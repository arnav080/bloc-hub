import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import modelsJson from '@/lib/models.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json({ models: [], recipes: [], users: [] });
    }

    const lowerQuery = query.toLowerCase();

    // 1. Search Users
    let users: any[] = [];
    if (supabase) {
      const { data: dbUsers } = await supabase
        .from('profiles')
        .select('username, display_name')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(5);
      if (dbUsers) users = dbUsers;
    } else {
      // Mock Fallback Users
      const mockUsers = [
        { username: "arnav080", display_name: "Arnav Gautam" },
        { username: "elonmusk", display_name: "Elon Musk" },
        { username: "dostmalone", display_name: "Dost Malone" }
      ];
      users = mockUsers.filter(u => 
        u.username.toLowerCase().includes(lowerQuery) || 
        u.display_name.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Search Models & Recipes
    let models: any[] = [];
    let recipes: any[] = [];

    if (supabase) {
      const { data: dbModels } = await supabase
        .from('models')
        .select('id, name, family')
        .or(`name.ilike.%${query}%,family.ilike.%${query}%`)
        .limit(5);
      if (dbModels) models = dbModels;

      const { data: dbRecipes } = await supabase
        .from('recipes')
        .select('id, name, quantization')
        .ilike('name', `%${query}%`)
        .limit(5);
      if (dbRecipes) recipes = dbRecipes;
    } else {
      // Local Fallback scanning modelsJson
      models = modelsJson
        .filter(m => m.name.toLowerCase().includes(lowerQuery) || m.family.toLowerCase().includes(lowerQuery))
        .map(m => ({ id: m.id, name: m.name, family: m.family }))
        .slice(0, 5);

      const allRecipes: any[] = [];
      modelsJson.forEach(m => {
        if (m.recipes && Array.isArray(m.recipes)) {
          m.recipes.forEach(r => {
            if (r.name.toLowerCase().includes(lowerQuery)) {
              allRecipes.push({ id: r.id, name: r.name, quantization: r.quantization });
            }
          });
        }
      });
      recipes = allRecipes.slice(0, 5);
    }

    return NextResponse.json({ models, recipes, users });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
