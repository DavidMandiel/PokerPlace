import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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

    // Check if the club exists and is joinable
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

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .single();

    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      console.error('Error checking existing membership:', memberCheckError);
      return NextResponse.json(
        { error: 'Failed to check membership status' },
        { status: 500 }
      );
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this club' },
        { status: 400 }
      );
    }

    // Check if user is the owner
    if (club.owner_id === user.id) {
      return NextResponse.json(
        { error: 'You are the owner of this club' },
        { status: 400 }
      );
    }

    // Check club visibility
    if (club.visibility === 'hidden') {
      return NextResponse.json(
        { error: 'This club is hidden and cannot be joined' },
        { status: 403 }
      );
    }

    // Add user to club
    const { error: joinError } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: user.id,
        joined_at: new Date().toISOString()
      });

    if (joinError) {
      console.error('Error joining club:', joinError);
      return NextResponse.json(
        { error: 'Failed to join club' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully joined the club' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in join club API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
