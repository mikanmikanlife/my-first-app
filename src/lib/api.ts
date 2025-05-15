import { supabase } from './supabaseClient';
import { Thread } from '../types';

export async function fetchThreadsByUser(userId: string): Promise<Thread[]> {
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Thread[];
}
