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

    // Use RPC to atomically increment the download count
    // This prevents race conditions when multiple downloads happen simultaneously
    // @ts-expect-error - Type inference issue with Supabase RPC functions
    const { error } = await supabase.rpc('increment_widget_downloads', {
      widget_id_param: id
    });

    if (error) {
      console.error('Error incrementing download count:', error);
      // Check if it's a "not found" scenario (function returns but no rows updated)
      // For now, we'll treat all errors the same way
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
