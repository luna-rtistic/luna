'use server';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createProphecy(formData: FormData) {
  const content = formData.get('content') as string;
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인 필요');
  const { error } = await supabase.from('prophecies').insert([{ content, user_id: user.id }]);
  if (error) throw error;
  revalidatePath('/prophecies');
}

export async function updateProphecy(formData: FormData) {
  const id = formData.get('id') as string;
  const content = formData.get('content') as string;
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인 필요');
  const { error } = await supabase
    .from('prophecies')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw error;
  revalidatePath('/prophecies');
}

export async function deleteProphecy(formData: FormData) {
  const id = formData.get('id') as string;
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인 필요');
  const { error } = await supabase
    .from('prophecies')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw error;
  revalidatePath('/prophecies');
}
 