import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function POST(req: Request) {
  try {
    const { yaml, username, recipeName } = await req.json();

    if (!yaml || !username || !recipeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT
    });

    const repoString = process.env.GITHUB_RECIPE_REPO;
    if (!repoString || !process.env.GITHUB_PAT) {
      console.warn("GITHUB_PAT or GITHUB_RECIPE_REPO not found in env. Falling back to mock success.");
      return NextResponse.json({ 
        success: true, 
        message: 'Mock upload successful (GitHub keys not found)' 
      });
    }

    const [owner, repo] = repoString.split('/');
    const path = `recipes/${username}/${recipeName}.yaml`;
    const message = `chore(registry): Add recipe ${username}/${recipeName}`;

    // Write to local models.json for immediate local visual feedback
    try {
      const fs = require('fs');
      const pathNode = require('path');
      const YAML = require('yaml');
      
      const parsedYaml = YAML.parse(yaml);
      const vram = parsedYaml.requirements?.vram || '8GB';
      const quantization = parsedYaml.model?.quantization || 'Q4_K_M';
      const contextSize = parsedYaml.engine?.context_size || 8192;
      const baseModel = parsedYaml.model?.base || 'llama-3-8b';

      const modelsPath = pathNode.join(process.cwd(), 'src/lib/models.json');
      const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

      // Find matching base model
      const targetModelId = baseModel === 'qwen-2.5-7b' ? 'qwen-35b-moe' : 
                            baseModel === 'llama-3-8b' ? 'llama-3.1-8b' : 
                            'deepseek-coder-v2';
                            
      const modelEntry = models.find((m: any) => m.id === targetModelId);
      if (modelEntry) {
        // Append new recipe
        modelEntry.recipes.push({
          id: `${username}-${recipeName}`,
          name: `${username}/${recipeName}`,
          hardware_tier: `${vram} VRAM`,
          hardware_requirements: `${vram} VRAM`,
          quantization: quantization,
          context_size: String(contextSize),
          manifest_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/recipes/${username}/${recipeName}.yaml`,
          pulls: "0",
          updated: "Just added"
        });
        fs.writeFileSync(modelsPath, JSON.stringify(models, null, 2));
      }
    } catch (err) {
      console.warn("Failed to write to local models.json:", err);
    }
    
    // Check if file exists to get its SHA (required for updating existing files)
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      if (!Array.isArray(data) && data.sha) {
        sha = data.sha;
      }
    } catch (e: any) {
      if (e.status !== 404) {
        throw e;
      }
    }

    // Create or update the file via API
    const contentEncoded = Buffer.from(yaml).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: contentEncoded,
      ...(sha && { sha }) // Conditionally spread the sha if it exists
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error submitting recipe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to commit recipe to Git repository' },
      { status: 500 }
    );
  }
}
