import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import modelsJson from '@/lib/models.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim() || '';

    let feedRecipes: any[] = [];
    let isPersonalized = false;

    if (supabase && username) {
      // 1. Fetch who this user follows
      const { data: follows } = await supabase
        .from('follows')
        .select('following_username')
        .eq('follower_username', username);

      const followedUsernames = follows?.map(f => f.following_username.toLowerCase()) || [];

      if (followedUsernames.length > 0) {
        // 2. Fetch recipes created by followed users
        // Since recipes are named like 'username/recipe-name', we search for prefix matches
        const { data: recipes, error } = await supabase
          .from('recipes')
          .select('*, models(name, family)')
          .order('created_at', { ascending: false });

        if (recipes) {
          // Client-side filter prefix match since `.in()` doesn't support wildcard matches in Supabase easily
          feedRecipes = recipes.filter(recipe => {
            const author = recipe.name.split('/')[0]?.toLowerCase();
            return followedUsernames.includes(author);
          }).slice(0, 15);

          if (feedRecipes.length > 0) {
            isPersonalized = true;
          }
        }
      }

      // 3. Fallback to Latest Global Recipes if following feed is empty
      if (feedRecipes.length === 0) {
        const { data: globalRecipes } = await supabase
          .from('recipes')
          .select('*, models(name, family)')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (globalRecipes) {
          feedRecipes = globalRecipes;
        }
      }
    } else {
      // Offline/Local Fallback scanning modelsJson recipes
      const allRecipes: any[] = [];
      modelsJson.forEach(m => {
        if (m.recipes && Array.isArray(m.recipes)) {
          m.recipes.forEach(r => {
            allRecipes.push({
              ...r,
              models: { name: m.name, family: m.family },
              created_at: r.updated === "Just added" ? new Date().toISOString() : new Date(Date.now() - 86400000).toISOString()
            });
          });
        }
      });
      // Sort by newest mock date
      feedRecipes = allRecipes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
    }

    return NextResponse.json({ 
      recipes: feedRecipes, 
      isPersonalized 
    });
  } catch (error: any) {
    console.error("Feed API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
