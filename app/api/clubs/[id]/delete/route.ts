import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clubId = params.id;

    // Verify the user owns the club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .eq('owner_id', user.id)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Get all club members for notification
    const { data: members, error: membersError } = await supabase
      .from('club_members')
      .select(`
        user_id,
        users!inner(email, user_metadata)
      `)
      .eq('club_id', clubId);

    if (membersError) {
      console.error('Error fetching club members:', membersError);
    }

    // Start a transaction to delete everything
    const { error: deleteError } = await supabase.rpc('delete_club_with_notifications', {
      club_id: clubId,
      club_name: club.name,
      owner_email: user.email || '',
      member_emails: members?.map(m => m.users?.email).filter(Boolean) || []
    });

    if (deleteError) {
      console.error('Error deleting club:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete club' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Club deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in delete club API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

