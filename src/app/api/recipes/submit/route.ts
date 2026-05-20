import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import YAML from 'yaml';

export async function POST(req: Request) {
  try {
    const { yaml, username, recipeName } = await req.json();

    if (!yaml || !username || !recipeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured.' },
        { status: 500 }
      );
    }

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

    // Normalize target base model ID
    const targetModelId = baseModel.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const recipeId = `${username}-${recipeName}`;

    // Helper function to dynamically generate parent model metadata
    const generateModelMetadata = (id: string) => {
      const parts = id.split('-');
      const familyName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const displayName = parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      
      return {
        id: id,
        name: displayName,
        family: familyName,
        description: `Auto-registered ${displayName} architecture optimized for high-performance local compute.`,
        tags: [familyName.toLowerCase(), "auto-registered"],
      };
    };

    // 1. Verify parent model exists in DB, otherwise auto-create it
    const { data: existingModel, error: findErr } = await supabaseAdmin
      .from('models')
      .select('id')
      .eq('id', targetModelId)
      .maybeSingle();

    if (!existingModel && !findErr) {
      const meta = generateModelMetadata(targetModelId);
      console.log(`Auto-registering new model family in Supabase: ${meta.name}`);
      const { error: insertModelErr } = await supabaseAdmin.from('models').insert(meta);
      if (insertModelErr) {
        console.error("Failed to insert model:", insertModelErr);
        throw new Error("Failed to register base model architecture.");
      }
    }

    // 2. Insert the recipe linked to the model family
    const { error: insertRecipeErr } = await supabaseAdmin.from('recipes').upsert({
      id: recipeId,
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
      manifest_url: `/api/recipes/${recipeId}/manifest`,
      manifest_yaml: yaml,
      pulls: "0",
      updated: "Just added"
    });

    if (insertRecipeErr) {
      console.error("Failed to insert recipe:", insertRecipeErr);
      throw new Error("Failed to register recipe.");
    }

    console.log("Successfully indexed recipe in Supabase registry!");
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error submitting recipe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit recipe' },
      { status: 500 }
    );
  }
}
