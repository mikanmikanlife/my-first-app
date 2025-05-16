import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import ThreadList from './components/ThreadList';
import ChatWindow from './components/ChatWindow';
import { Thread, Message } from './types';
import { getAIResponse } from './utils/mockApi';
import { MenuIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  fetchThreadsWithMessages,
  createThread,
  addMessage,
  updateThreadTitle,
  deleteThread
} from './lib/supabaseService';
import { v4 as uuidv4 } from 'uuid';

function AuthenticatedApp() {
  const { user, signOut } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isThreadListOpen, setIsThreadListOpen] = useState<boolean>(true);
  const [threadIdBeingEdited, setThreadIdBeingEdited] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const activeThread = threads.find(thread => thread.id === activeThreadId);
 

  // 初期データの読み込み
  useEffect(() => {
    if (user) {
      loadThreads();
    }
  }, [user]);

  const loadThreads = async () => {
    try {
      const loadedThreads = await fetchThreadsWithMessages(user!);
      setThreads(loadedThreads);
      if (loadedThreads.length > 0 && !activeThreadId) {
        setActiveThreadId(loadedThreads[0].id);
      }
    } catch (error) {
      console.error('スレッド読み込みエラー:', error);
      toast.error('チャット履歴の読み込みに失敗しました');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleStartRename = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setThreadIdBeingEdited(threadId);
      setNewTitle(thread.title);
    }
  };

  const handleCancelRename = () => {
    setThreadIdBeingEdited(null);
    setNewTitle('');
  };

  const handleSaveRename = async (threadId: string, newTitle: string) => {
    if (newTitle.trim()) {
      const success = await updateThreadTitle(threadId, newTitle.trim());
      if (success) {
        setThreads(threads.map(thread =>
          thread.id === threadId
            ? { ...thread, title: newTitle.trim() }
            : thread
        ));
        toast.success('タイトルを更新しました');
      } else {
        toast.error('タイトルの更新に失敗しました');
      }
    }
    setThreadIdBeingEdited(null);
    setNewTitle('');
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  const handleNewThread = async () => {
    const initialMessage: Message = {
      id: uuidv4(),
      content: 'こんにちは！どのようなことでお手伝いできますか？',
      role: 'assistant',
      timestamp: new Date()
    };

    const newThread = await createThread(user!, '新しい会話', initialMessage);
    if (newThread) {
      setThreads([newThread, ...threads]);
      setActiveThreadId(newThread.id);
      toast.success('新しい会話を開始しました');
    } else {
      toast.error('新しい会話の作成に失敗しました');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThread) return;

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    // メッセージの追加
    const success = await addMessage(activeThread.id, userMessage, user.id);
    if (!success) {
      toast.error('メッセージの送信に失敗しました');
      return;
    }

    // UIの更新
    let updatedThread = {
      ...activeThread,
      messages: [...activeThread.messages, userMessage]
    };

    // 最初のメッセージの場合、タイトルを更新
    if (activeThread.messages.length === 1 && activeThread.messages[0].role === 'assistant') {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      await updateThreadTitle(activeThread.id, title);
      updatedThread = { ...updatedThread, title };
    }

    setThreads(threads.map(thread =>
      thread.id === activeThreadId ? updatedThread : thread
    ));

    // AI応答の取得と保存
    setIsLoading(true);
    try {
      const aiResponse = await getAIResponse(content);
      const success = await addMessage(activeThread.id, aiResponse, null);
      if (success) {
        const threadWithAiResponse = {
          ...updatedThread,
          messages: [...updatedThread.messages, aiResponse]
        };
        setThreads(threads.map(thread =>
          thread.id === activeThreadId ? threadWithAiResponse : thread
        ));
      } else {
        toast.error('AI応答の保存に失敗しました');
      }
    } catch (error) {
      console.error('AIからの応答取得に失敗しました:', error);
      toast.error('AI応答の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetThread = async () => {
    if (!activeThread || !window.confirm('この会話をリセットしますか？すべてのメッセージが削除されます。')) {
      return;
    }

    const initialMessage: Message = {
      id: uuidv4(),
      content: 'こんにちは！どのようなことでお手伝いできますか？',
      role: 'assistant',
      timestamp: new Date(),
      user_id: null
    };

    // 既存のスレッドを削除して新しいスレッドを作成
    const success = await deleteThread(activeThread.id);
    if (success) {
      const newThread = await createThread(user!, activeThread.title, initialMessage);
      if (newThread) {
        setThreads(threads.map(thread =>
          thread.id === activeThread.id ? newThread : thread
        ));
        toast.success('会話をリセットしました');
      } else {
        toast.error('会話のリセットに失敗しました');
      }
    } else {
      toast.error('会話のリセットに失敗しました');
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!window.confirm('このチャットを削除してもよろしいですか？')) {
      return;
    }

    const success = await deleteThread(threadId);
    if (success) {
      const newThreads = threads.filter(thread => thread.id !== threadId);
      setThreads(newThreads);
      if (threadId === activeThreadId && newThreads.length > 0) {
        setActiveThreadId(newThreads[0].id);
      }
      toast.success('チャットを削除しました');
    } else {
      toast.error('チャットの削除に失敗しました');
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Toaster position="top-right" />
      <button
        onClick={() => setIsThreadListOpen(!isThreadListOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white shadow transition-colors md:left-2"
        aria-label="サイドバー切り替え"
      >
        <MenuIcon size={20} />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out bg-gray-900 h-full flex-shrink-0 border-r border-gray-800 ${
          isThreadListOpen ? 'w-72 md:w-64 sm:w-56' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <ThreadList
            threads={threads}
            activeThreadId={activeThreadId || ''}
            onSelectThread={handleSelectThread}
            onNewThread={handleNewThread}
            threadIdBeingEdited={threadIdBeingEdited}
            onStartRename={handleStartRename}
            onCancelRename={handleCancelRename}
            onSaveRename={handleSaveRename}
            onDeleteThread={handleDeleteThread}
            newTitle={newTitle}
            onNewTitleChange={setNewTitle}
          />
          <button
            onClick={signOut}
            className="p-4 text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {!isThreadListOpen && (
          <div className="h-14 border-b border-gray-700 flex items-center px-4 bg-gray-900"></div>
        )}
        <div className="flex-1">
          {activeThread ? (
            <ChatWindow
              activeThread={activeThread}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onResetThread={handleResetThread}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">
                左側のメニューから会話を選択するか、新しい会話を始めてください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UnauthenticatedApp() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'アカウントにログイン' : '新規アカウント登録'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLogin ? <LoginForm /> : <SignUpForm />}
          <div className="mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              {isLogin
                ? 'アカウントをお持ちでない方はこちら'
                : 'すでにアカウントをお持ちの方はこちら'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;