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
      // updated_at はトリガーで自動更新されるので指定不要
    }
  ]);

  if (error) {
    console.error('スレッド保存失敗:', error.message);
  }
}

/**
 * メッセージを Supabase に保存
 */
export async function saveMessageToSupabase(threadId: string, message: Message, userId?: string) {
  const { id, content, role, timestamp } = message;

  // userIdが未定義または不正な値の場合はnullを設定
  const userIdOrNull = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) ? userId : null;

  const { error } = await supabase.from('messages').insert([
    {
      id,
      thread_id: threadId,
      content,
      role,
      created_at: timestamp.toISOString(),
      user_id: userIdOrNull
    }
   
  ]);

  if (error) {
    console.error('メッセージ保存失敗:', error.message);
  }
}

/**
 * 新しいスレッドを作成
 */
export async function createThread(user: User, title: string, initialMessage: Message): Promise<Thread | null> {
  const thread: Thread = {
    id: crypto.randomUUID(),
    title,
    messages: [initialMessage],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await saveThreadToSupabase(thread, user.id);
  await saveMessageToSupabase(thread.id, initialMessage);

  return thread;
}

/**
 * メッセージを追加
 */
export async function addMessage(threadId: string, message: Message, userId?: string): Promise<boolean> {
  try {
    await saveMessageToSupabase(threadId, message, userId);
    console.log('addmessage内userId:',userId);
    return true;
  } catch (error) {
    console.error('メッセージ追加エラー:', error);
    return false;
  }
}

/**
 * スレッドのタイトルを更新
 */
export async function updateThreadTitle(threadId: string, newTitle: string): Promise<boolean> {
  const { error } = await supabase
    .from('threads')
    .update({ title: newTitle })
    .eq('id', threadId);

  return !error;
}

/**
 * スレッドを削除
 */
export async function deleteThread(threadId: string): Promise<boolean> {
  const { error } = await supabase
    .from('threads')
    .delete()
    .eq('id', threadId);

  return !error;
}

/**
 * Supabase からスレッド＋メッセージを取得
 */
export const fetchThreadsWithMessages = async (user: User): Promise<Thread[]> => {
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false }); // ← created_atから変更（任意）

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
    updatedAt: new Date(thread.updated_at),
  }));

  return threadsWithMessages;
};