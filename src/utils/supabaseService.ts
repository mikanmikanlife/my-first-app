import { supabase } from '../lib/supabaseClient';
import { Thread, Message } from '../types';
import { User } from '@supabase/supabase-js';

/**
 * スレッドを Supabase に保存
 */
export async function saveThreadToSupabase(thread: Thread, userId: string) {
  const { id, title, createdAt } = thread;

  const { error } = await supabase.from('threads').insert([
    {
      id,
      title,
      created_at: createdAt.toISOString(),
      user_id: userId,
    }
  ]);

  if (error) {
    console.error('スレッド保存失敗:', error.message);
  }
}

/**
 * メッセージを Supabase に保存
 */
export async function saveMessageToSupabase(threadId: string, message: Message) {
  const { id, content, role, timestamp } = message;

  const { error } = await supabase.from('messages').insert([
    {
      id,
      thread_id: threadId,
      content,
      role,
      created_at: timestamp.toISOString(),
    }
  ]);

  if (error) {
    console.error('メッセージ保存失敗:', error.message);
  }
}

/**
 * Supabase からスレッド＋メッセージを取得
 */
export const fetchThreadsWithMessages = async (user: User): Promise<Thread[]> => {
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select('id, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (threadsError || !threads) {
    console.error('スレッド取得失敗:', threadsError);
    return [];
  }

  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, thread_id, content, role, created_at');

  if (messagesError || !messages) {
    console.error('メッセージ取得失敗:', messagesError);
    return [];
  }

  const threadsWithMessages: Thread[] = threads.map((thread) => ({
    id: thread.id,
    title: thread.title,
    messages: messages
      .filter((m) => m.thread_id === thread.id)
      .map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        timestamp: new Date(m.created_at),
      })),
    createdAt: new Date(thread.created_at),
    updatedAt: new Date(thread.created_at), // updated_at がないので仮対応
  }));

  return threadsWithMessages;
};
