import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, displayName, bio, twitterHandle, linkedinUrl, websiteUrl, githubUrl } = await request.json();

    if (!username || !supabase) {
      return NextResponse.json({ error: 'Missing username or DB disconnected' }, { status: 400 });
    }

    const { data, error } = await supabase.from('profiles').upsert({
      username,
      display_name: displayName,
      bio,
      twitter_handle: twitterHandle,
      linkedin_url: linkedinUrl,
      website_url: websiteUrl,
      github_url: githubUrl
    }).select().single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, profile: data });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
