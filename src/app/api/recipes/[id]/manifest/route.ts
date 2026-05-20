import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!supabase) {
      return new NextResponse('Supabase not configured', { status: 500 });
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('manifest_yaml')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching manifest:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (!data || !data.manifest_yaml) {
      return new NextResponse('Manifest not found', { status: 404 });
    }

    // Return as plain text/yaml
    return new NextResponse(data.manifest_yaml, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error serving manifest:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
