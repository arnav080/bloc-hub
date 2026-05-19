import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { authId, username, fullName, bio, twitter, github, linkedin, website } = await request.json();

    if (!authId || !username || !supabase) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");

    // 1. Check if username is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', cleanUsername)
      .maybeSingle();
    
    if (existingProfile) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    // 2. Insert the new profile linked to the secure Auth ID
    const { data, error } = await supabase.from('profiles').insert({
      auth_id: authId,
      username: cleanUsername,
      display_name: fullName,
      bio: bio || null,
      twitter_handle: twitter || null,
      linkedin_url: linkedin || null,
      website_url: website || null,
      github_url: github || null
    }).select().single();

    if (error) {
      if (error.code === '23505' && error.message.includes('auth_id')) {
        return NextResponse.json({ error: 'You already have a profile linked to this account!' }, { status: 409 });
      }
      throw error;
    }
    
    return NextResponse.json({ success: true, profile: data });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
