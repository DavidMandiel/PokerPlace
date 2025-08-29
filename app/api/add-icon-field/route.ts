import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Add the icon field to the clubs table
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE clubs ADD COLUMN IF NOT EXISTS icon TEXT;'
    });

    if (error) {
      console.error('Error adding icon field:', error);
      return NextResponse.json({ error: 'Failed to add icon field' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Icon field added successfully' });
  } catch (error) {
    console.error('Error in add-icon-field API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
