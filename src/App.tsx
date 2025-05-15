import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import ThreadList from './components/ThreadList';
import ChatWindow from './components/ChatWindow';
import { Thread } from './types';
import { MenuIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function AuthenticatedApp() {
  const { signOut } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isThreadListOpen, setIsThreadListOpen] = useState<boolean>(true);
  const [threadIdBeingEdited, setThreadIdBeingEdited] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');

  const activeThread = threads.find(thread => thread.id === activeThreadId);

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

  const handleSaveRename = (threadId: string, newTitle: string) => {
    if (newTitle.trim()) {
      setThreads(threads.map(thread =>
        thread.id === threadId
          ? { ...thread, title: newTitle.trim() }
          : thread
      ));
    }
    setThreadIdBeingEdited(null);
    setNewTitle('');
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  const handleNewThread = () => {
    const newThread: Thread = {
      id: Math.random().toString(36).substring(2, 10),
      title: '新しい会話',
      messages: [
        {
          id: Math.random().toString(36).substring(2, 10),
          content: 'こんにちは！どのようなことでお手伝いできますか？',
          role: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setThreads([newThread, ...threads]);
    setActiveThreadId(newThread.id);
  };

  const handleDeleteThread = (threadId: string) => {
    if (window.confirm('このチャットを削除してもよろしいですか？')) {
      const newThreads = threads.filter(thread => thread.id !== threadId);
      setThreads(newThreads);
      
      if (threadId === activeThreadId) {
        const latestThread = newThreads[0];
        if (latestThread) {
          setActiveThreadId(latestThread.id);
        }
      }
    }
  };

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
            activeThreadId={activeThreadId}
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
              onSendMessage={async () => {}}
              onResetThread={() => {}}
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

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
      <Toaster />
    </AuthProvider>
  );
}

export default App;