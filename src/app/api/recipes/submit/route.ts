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
      const vram = parsedYaml.requirements?.vram || '8GB VRAM';
      const hardware = parsedYaml.requirements?.hardware || 'RTX 4060 Ti';
      const quantization = parsedYaml.model?.quantization || 'Q4_K_S';
      const baseModel = parsedYaml.model?.base || 'qwen-35b-moe';

      const gpuLayers = parsedYaml.engine?.gpu_layers || 99;
      const moeExperts = parsedYaml.engine?.moe_experts || 0;
      const flashAttention = parsedYaml.engine?.flash_attention ?? false;
      const kvKey = parsedYaml.engine?.kv_cache?.key || '';
      const kvValue = parsedYaml.engine?.kv_cache?.value || '';

      const modelsPath = pathNode.join(process.cwd(), 'src/lib/models.json');
      const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

      // Normalize target base model ID
      const targetModelId = baseModel.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

      // Helper function to dynamically generate parent model metadata
      const generateModelMetadata = (id: string) => {
        const parts = id.split('-');
        const familyName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const displayName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        
        return {
          id: id,
          name: displayName,
          family: familyName,
          description: `Auto-registered ${displayName} architecture optimized for high-performance local compute.`,
          tags: [familyName.toLowerCase(), "auto-registered"],
          recipes: []
        };
      };

      // Find or auto-create architecture in local JSON
      let modelEntry = models.find((m: any) => m.id === targetModelId);
      if (!modelEntry) {
        modelEntry = generateModelMetadata(targetModelId);
        models.push(modelEntry);
      }

      // Append new recipe
      modelEntry.recipes.push({
        id: `${username}-${recipeName}`,
        name: `${username}/${recipeName}`,
        hardware_tier: vram,
        hardware_requirements: hardware,
        quantization: quantization,
        context_size: "32768",
        kv_cache_key: kvKey,
        kv_cache_value: kvValue,
        flash_attention: flashAttention,
        moe_experts: moeExperts,
        manifest_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/recipes/${username}/${recipeName}.yaml`,
        pulls: "0",
        updated: "Just added"
      });
      fs.writeFileSync(modelsPath, JSON.stringify(models, null, 2));

      // Direct real-time insertion to Supabase
      const { supabase } = require('@/lib/supabase');
      if (supabase) {
        try {
          // 1. Verify parent model exists in DB, otherwise auto-create it
          supabase.from('models')
            .select('id')
            .eq('id', targetModelId)
            .maybeSingle()
            .then(async ({ data: existingModel, error: findErr }: any) => {
              if (!existingModel && !findErr) {
                const meta = generateModelMetadata(targetModelId);
                console.log(`Auto-registering new model family in Supabase: ${meta.name}`);
                await supabase.from('models').insert({
                  id: meta.id,
                  name: meta.name,
                  family: meta.family,
                  description: meta.description,
                  tags: meta.tags
                });
              }

              // 2. Insert the recipe linked to the model family
              await supabase.from('recipes').insert({
                id: `${username}-${recipeName}`,
                model_id: targetModelId,
                name: `${username}/${recipeName}`,
                hardware_tier: vram,
                hardware_requirements: hardware,
                quantization: quantization,
                context_size: "32768",
                kv_cache_key: kvKey,
                kv_cache_value: kvValue,
                flash_attention: flashAttention,
                moe_experts: moeExperts,
                manifest_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/recipes/${username}/${recipeName}.yaml`,
                pulls: "0",
                updated: "Just added"
              });
              console.log("Successfully indexed recipe in Supabase registry!");
            })
            .catch((dbEx: any) => {
              console.error("Supabase auto-register exception:", dbEx);
            });
        } catch (dbEx) {
          console.error("Supabase indexing exception:", dbEx);
        }
      }
    } catch (err) {
      console.warn("Failed to write to local models.json / Supabase:", err);
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
