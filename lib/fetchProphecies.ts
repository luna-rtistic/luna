import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function fetchProphecies() {
  const supabase = createClientComponentClient();
  const { data, error } = await supabase
    .from('prophecies')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
} 