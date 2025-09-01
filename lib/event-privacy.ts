import { createBrowserClient } from "@supabase/ssr";

export type EventPrivacy = "public" | "private" | "secret";
export type UserEventStatus = "upcoming" | "friends" | "other" | "registered";

export interface EventPrivacyContext {
  eventId: string;
  userId: string;
  clubId?: string;
  eventPrivacy: EventPrivacy;
}

/**
 * Determines the user's relationship to an event based on privacy settings
 * and club membership status
 */
export async function getUserEventStatus(
  context: EventPrivacyContext
): Promise<UserEventStatus> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { eventId, userId, clubId, eventPrivacy } = context;

  // Check if user is registered for the event
  const { data: attendance } = await supabase
    .from('event_attendees')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (attendance?.status === 'confirmed') {
    return 'registered';
  }

  // Check club membership for private/secret events
  if (eventPrivacy === 'private' || eventPrivacy === 'secret') {
    if (!clubId) {
      return 'other'; // No club associated, user can't access
    }

    const { data: membership } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (membership) {
      return 'friends'; // User is a club member
    } else {
      return 'other'; // User is not a club member
    }
  }

  // For public events, check if user has friends in the event
  const { data: friendsInEvent } = await supabase
    .from('event_attendees')
    .select(`
      user_id,
      user_profiles!inner(nickname)
    `)
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .limit(1);

  // This is a simplified check - in a real app you'd have a friends table
  // For now, we'll consider it "friends" if there are other attendees
  if (friendsInEvent && friendsInEvent.length > 0) {
    return 'friends';
  }

  return 'other';
}

/**
 * Determines what action button should be shown for an event
 */
export function getEventActionButton(
  userStatus: UserEventStatus,
  eventPrivacy: EventPrivacy,
  isClubMember: boolean
): {
  text: string;
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  action: 'register' | 'leave' | 'request_join_club' | 'view_details';
} {
  switch (userStatus) {
    case 'registered':
      return {
        text: 'Leave Event',
        variant: 'danger',
        action: 'leave'
      };
    
    case 'friends':
      return {
        text: 'Join Game',
        variant: 'primary',
        action: 'register'
      };
    
    case 'other':
      if (eventPrivacy === 'private' && !isClubMember) {
        return {
          text: 'Request To Join Club',
          variant: 'success',
          action: 'request_join_club'
        };
      }
      return {
        text: 'Register',
        variant: 'primary',
        action: 'register'
      };
    
    default:
      return {
        text: 'View Details',
        variant: 'secondary',
        action: 'view_details'
      };
  }
}

/**
 * Checks if a user can view an event based on privacy settings
 */
export async function canUserViewEvent(
  eventId: string,
  userId: string,
  eventPrivacy: EventPrivacy,
  clubId?: string
): Promise<boolean> {
  if (eventPrivacy === 'public') {
    return true;
  }

  if (eventPrivacy === 'private' || eventPrivacy === 'secret') {
    if (!clubId) {
      return false;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: membership } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    return !!membership;
  }

  return false;
}

/**
 * Gets the appropriate privacy badge text and icon
 */
export function getPrivacyBadge(eventPrivacy: EventPrivacy): {
  text: string;
  icon: string;
} {
  switch (eventPrivacy) {
    case 'private':
      return {
        text: 'friends only',
        icon: 'users'
      };
    case 'secret':
      return {
        text: 'invite only',
        icon: 'star'
      };
    default:
      return {
        text: '',
        icon: ''
      };
  }
}



