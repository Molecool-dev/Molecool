import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/widgets/[id]/download
 * Increment the download count for a widget
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // First, get the current download count
    const { data: widget, error: fetchError } = await supabase
      .from('widgets')
      .select('downloads')
      .eq('widget_id', id)
      .single();

    if (fetchError || !widget) {
      console.error('Error fetching widget:', fetchError);
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Increment the download count
    const { error: updateError } = await supabase
      .from('widgets')
      .update({ downloads: (widget.downloads || 0) + 1 })
      .eq('widget_id', id);

    if (updateError) {
      console.error('Error updating download count:', updateError);
      return NextResponse.json(
        { error: 'Failed to update download count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
