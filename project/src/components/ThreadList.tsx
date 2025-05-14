import React, { useState } from 'react';
import { Thread } from '../types';
import { MessageSquareIcon, SquarePenIcon } from 'lucide-react';
import { ArrowsUpDownIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ThreadListProps {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  threadIdBeingEdited: string | null;
  onStartRename: (threadId: string) => void;
  onCancelRename: () => void;
  onSaveRename: (threadId: string, newTitle: string) => void;
  onDeleteThread: (threadId: string) => void;
  newTitle: string;
  onNewTitleChange: (value: string) => void;
}

const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  threadIdBeingEdited,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onDeleteThread,
  newTitle,
  onNewTitleChange
}) => {
  // 並び順の状態
  const [isNewestFirst, setIsNewestFirst] = useState(true);

  // 並び替え
  const sortedThreads = [...threads].sort((a, b) =>
    isNewestFirst
      ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  );

  // キーボードイベントハンドラー
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, threadId: string) => {
    if (e.key === 'Enter') {
      onSaveRename(threadId, newTitle);
    } else if (e.key === 'Escape') {
      onCancelRename();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-end gap-2">
        {/* 並び順トグルボタン */}
        <button
          onClick={() => setIsNewestFirst((prev) => !prev)}
          title="並び順を切り替え（新しい順 / 古い順）"
          className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <ArrowsUpDownIcon className="w-5 h-5 text-white" />
        </button>

        {/* 新規チャットボタン */}
        <button
          onClick={onNewThread}
          aria-label="新規チャット"
          className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <SquarePenIcon size={20} />
        </button>
      </div>
      
      {/* Thread list */}
      <div className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {sortedThreads.map((thread) => (
            <li key={thread.id}>
              <div className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-start gap-2 ${
                thread.id === activeThreadId
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}>
                <button
                  onClick={() => onSelectThread(thread.id)}
                  className="flex-1 flex items-start gap-2 min-w-0 focus:outline-none"
                >
                  <MessageSquareIcon size={16} className="mt-1 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    {threadIdBeingEdited === thread.id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => onNewTitleChange(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, thread.id)}
                        onBlur={() => onSaveRename(thread.id, newTitle)}
                        className="w-full bg-gray-800 text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        autoFocus
                      />
                    ) : (
                      <>
                        <p className="truncate font-medium">{thread.title}</p>
                        <p className="truncate text-xs opacity-70">
                          {new Date(thread.updatedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </>
                    )}
                  </div>
                </button>
                {!threadIdBeingEdited && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onStartRename(thread.id)}
                      className="p-1 hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                      title="タイトルを編集"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteThread(thread.id)}
                      className="p-1 text-red-500 hover:text-red-600 hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                      title="チャットを削除"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          ChatGPT風UI - 2025
        </div>
      </div>
    </div>
  );
};

export default ThreadList;