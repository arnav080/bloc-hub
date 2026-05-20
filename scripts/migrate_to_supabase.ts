import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables manually since this is a standalone script
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Starting migration...");
  
  const modelsPath = path.resolve(__dirname, '../src/lib/models.json');
  if (!fs.existsSync(modelsPath)) {
    console.error("src/lib/models.json not found!");
    process.exit(1);
  }

  const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
  
  for (const model of models) {
    console.log(`Migrating model family: ${model.name}`);
    
    // Insert Model Family
    const { error: modelErr } = await supabase.from('models').upsert({
      id: model.id,
      name: model.name,
      family: model.family,
      description: model.description,
      tags: model.tags
    });

    if (modelErr) {
      console.error(`Failed to insert model ${model.id}:`, modelErr);
      continue;
    }

    // Insert Recipes
    if (model.recipes && model.recipes.length > 0) {
      for (const recipe of model.recipes) {
        console.log(`  Migrating recipe: ${recipe.name}`);
        
        // Find local YAML file
        // ID format: username-recipename
        // Actual local path format: recipes/username/recipename.yaml
        const username = recipe.name.split('/')[0];
        const recipename = recipe.name.split('/')[1];
        
        let yamlContent = "";
        const recipePath = path.resolve(__dirname, `../recipes/${username}/${recipename}.yaml`);
        if (fs.existsSync(recipePath)) {
          yamlContent = fs.readFileSync(recipePath, 'utf8');
        } else {
          console.warn(`    WARNING: YAML file not found at ${recipePath}. Inserting without manifest_yaml.`);
        }

        const { error: recipeErr } = await supabase.from('recipes').upsert({
          id: recipe.id,
          model_id: model.id,
          name: recipe.name,
          hardware_tier: recipe.hardware_tier,
          hardware_requirements: recipe.hardware_requirements,
          quantization: recipe.quantization,
          context_size: recipe.context_size,
          kv_cache_key: recipe.kv_cache_key,
          kv_cache_value: recipe.kv_cache_value,
          flash_attention: recipe.flash_attention,
          moe_experts: recipe.moe_experts,
          manifest_url: `/api/recipes/${recipe.id}/manifest`,
          manifest_yaml: yamlContent,
          pulls: recipe.pulls || "0",
          updated: recipe.updated,
          created_at: recipe.created_at || new Date().toISOString()
        });

        if (recipeErr) {
          console.error(`    Failed to insert recipe ${recipe.id}:`, recipeErr);
        }
      }
    }
  }

  console.log("Migration complete!");
}

migrate();
