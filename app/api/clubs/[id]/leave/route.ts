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

    // Check if the club exists
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (club.owner_id === user.id) {
      return NextResponse.json(
        { error: 'Club owners cannot leave their own club. Please transfer ownership or delete the club.' },
        { status: 400 }
      );
    }

    // Check if user is a member
    const { data: membership, error: membershipError } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this club' },
        { status: 400 }
      );
    }

    // Remove user from club
    const { error: leaveError } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', user.id);

    if (leaveError) {
      console.error('Error leaving club:', leaveError);
      return NextResponse.json(
        { error: 'Failed to leave club' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully left the club' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in leave club API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

