import { supabase } from './supabaseClient';
import { Thread, Message } from '../types';
import { User } from '@supabase/supabase-js';

/**
 * スレッドとメッセージを取得
 */
export const fetchThreadsWithMessages = async (user: User): Promise<Thread[]> => {
  // スレッドの取得
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (threadsError) {
    console.error('スレッド取得エラー:', threadsError);
    return [];
  }

  if (!threads.length) return [];

  // スレッドに紐づくメッセージの取得
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .in('thread_id', threads.map(t => t.id))
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('メッセージ取得エラー:', messagesError);
    return [];
  }

  // スレッドとメッセージを結合
  return threads.map(thread => ({
    id: thread.id,
    title: thread.title,
    messages: messages
      .filter(m => m.thread_id === thread.id)
      .map(m => ({
        id: m.id,
        content: m.content,
        role: m.role as 'user' | 'assistant',
        timestamp: new Date(m.created_at)
      })),
    createdAt: new Date(thread.created_at),
    updatedAt: new Date(thread.updated_at)
  }));
};

/**
 * 新規スレッドを作成
 */
export const createThread = async (
  user: User,
  title: string,
  initialMessage: Message
): Promise<Thread | null> => {
  // スレッドの作成
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .insert([{
      user_id: user.id,
      title
    }])
    .select()
    .single();

  if (threadError) {
    console.error('スレッド作成エラー:', threadError);
    return null;
  }

  // 初期メッセージの作成
  const { error: messageError } = await supabase
    .from('messages')
    .insert([{
      thread_id: thread.id,
      content: initialMessage.content,
      role: initialMessage.role
    }]);

  if (messageError) {
    console.error('メッセージ作成エラー:', messageError);
    return null;
  }

  return {
    id: thread.id,
    title: thread.title,
    messages: [initialMessage],
    createdAt: new Date(thread.created_at),
    updatedAt: new Date(thread.updated_at)
  };
};

/**
 * メッセージを追加
 */
export const addMessage = async (
  threadId: string,
  message: Message
): Promise<boolean> => {
  const { error } = await supabase
    .from('messages')
    .insert([{
      thread_id: threadId,
      content: message.content,
      role: message.role
    }]);

  if (error) {
    console.error('メッセージ追加エラー:', error);
    return false;
  }

  // スレッドの更新日時を更新
  await supabase
    .from('threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', threadId);

  return true;
};

/**
 * スレッドのタイトルを更新
 */
export const updateThreadTitle = async (
  threadId: string,
  title: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('threads')
    .update({ title })
    .eq('id', threadId);

  if (error) {
    console.error('スレッドタイトル更新エラー:', error);
    return false;
  }

  return true;
};

/**
 * スレッドを削除
 */
export const deleteThread = async (threadId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('threads')
    .delete()
    .eq('id', threadId);

  if (error) {
    console.error('スレッド削除エラー:', error);
    return false;
  }

  return true;
};