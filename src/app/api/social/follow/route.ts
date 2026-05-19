import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { currentUsername, targetUsername, action } = await request.json();

    if (!currentUsername || !targetUsername || !supabase) {
      return NextResponse.json({ error: 'Missing parameters or Supabase not connected' }, { status: 400 });
    }

    // Auto-seed native profiles if they don't exist to prevent foreign key errors
    await supabase.from('profiles').insert([{ username: currentUsername }]).select().maybeSingle();
    await supabase.from('profiles').insert([{ username: targetUsername }]).select().maybeSingle();

    if (action === 'follow') {
      const { error } = await supabase.from('follows').insert({
        follower_username: currentUsername,
        following_username: targetUsername
      });
      if (error && error.code !== '23505') throw error; // Ignore unique constraint if already following
      return NextResponse.json({ success: true, message: 'Followed successfully' });
    } 
    
    if (action === 'unfollow') {
      const { error } = await supabase.from('follows')
        .delete()
        .match({ follower_username: currentUsername, following_username: targetUsername });
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Unfollowed successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
