import React, { useState, useEffect } from 'react';
import ThreadList from './components/ThreadList';
import ChatWindow from './components/ChatWindow';
import { Thread, Message } from './types';
import { initialThreads } from './utils/mockData';
import { getAIResponse } from './utils/mockApi';
import { MenuIcon } from 'lucide-react';

function App() {
  // ステート
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState<string>(initialThreads[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isThreadListOpen, setIsThreadListOpen] = useState<boolean>(true);
  
  // スレッドの編集用ステート
  const [threadIdBeingEdited, setThreadIdBeingEdited] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');

  // アクティブなスレッドを取得
  const activeThread = threads.find(thread => thread.id === activeThreadId) || threads[0];

  // スレッドのリネームハンドラー
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

  // スレッド選択ハンドラー
  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  // 新規スレッド作成ハンドラー
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

  // メッセージ送信ハンドラー
  const handleSendMessage = async (content: string) => {
    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 10),
      content,
      role: 'user',
      timestamp: new Date()
    };
    
    // スレッドを更新
    const updatedThread = {
      ...activeThread,
      updatedAt: new Date(),
      messages: [...activeThread.messages, userMessage]
    };
    
    // もしユーザーの最初のメッセージなら、タイトルを更新
    let threadToUpdate = updatedThread;
    if (activeThread.messages.length === 1 && activeThread.messages[0].role === 'assistant') {
      // ユーザーの最初のメッセージを短くしてタイトルにする
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      threadToUpdate = {
        ...updatedThread,
        title
      };
    }
    
    // スレッド一覧を更新
    setThreads(threads.map(thread => 
      thread.id === activeThreadId ? threadToUpdate : thread
    ));
    
    // AI応答を取得
    setIsLoading(true);
    try {
      const aiResponse = await getAIResponse(content);
      
      // AI応答をスレッドに追加
      const threadWithAiResponse = {
        ...threadToUpdate,
        updatedAt: new Date(),
        messages: [...threadToUpdate.messages, aiResponse]
      };
      
      // スレッド一覧を更新
      setThreads(threads.map(thread => 
        thread.id === activeThreadId ? threadWithAiResponse : thread
      ));
    } catch (error) {
      console.error('AIからの応答取得に失敗しました:', error);
      // エラーメッセージを表示することもできます
    } finally {
      setIsLoading(false);
    }
  };

  // スレッドリセットハンドラー
  const handleResetThread = () => {
    // 確認ダイアログ
    if (window.confirm('この会話をリセットしますか？すべてのメッセージが削除されます。')) {
      const resetThread: Thread = {
        ...activeThread,
        messages: [
          {
            id: Math.random().toString(36).substring(2, 10),
            content: 'こんにちは！どのようなことでお手伝いできますか？',
            role: 'assistant',
            timestamp: new Date()
          }
        ],
        updatedAt: new Date()
      };
      
      setThreads(threads.map(thread => 
        thread.id === activeThreadId ? resetThread : thread
      ));
    }
  };

  // スレッド削除ハンドラー
  const handleDeleteThread = (threadId: string) => {
    if (window.confirm('このチャットを削除してもよろしいですか？')) {
      const newThreads = threads.filter(thread => thread.id !== threadId);
      setThreads(newThreads);
      
      // 削除したスレッドがアクティブだった場合、最新のスレッドをアクティブにする
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
      {/* トグルボタン */}
      <button
        onClick={() => setIsThreadListOpen(!isThreadListOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white shadow transition-colors md:left-2"
        aria-label="サイドバー切り替え"
      >
        <MenuIcon size={20} />
      </button>

      {/* サイドバー */}
      <div
        className={`transition-all duration-300 ease-in-out bg-gray-900 h-full flex-shrink-0 border-r border-gray-800 ${
          isThreadListOpen ? 'w-72 md:w-64 sm:w-56' : 'w-0'
        } overflow-hidden`}
      >
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
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 上部ナビ（タイトル非表示） */}
        { !isThreadListOpen && (
          <div className="h-14 border-b border-gray-700 flex items-center px-4 bg-gray-900"></div>
        )}
        {/* チャットウィンドウ */}
        <div className="flex-1">
          <ChatWindow
            activeThread={activeThread}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onResetThread={handleResetThread}
          />
        </div>
      </div>
    </div>
  );
}

export default App;