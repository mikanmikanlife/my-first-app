import React, { useEffect, useRef } from 'react';
import { Message, Thread } from '../types';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  activeThread: Thread;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onResetThread: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  activeThread,
  isLoading,
  onSendMessage,
  onResetThread
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread.messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">{activeThread.title}</h2>
          <span className="text-sm text-gray-500">
            {new Date(activeThread.updatedAt).toLocaleDateString('ja-JP')}
          </span>
        </div>
      </div>
      
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-gray-200">
          {activeThread.messages.map((message: Message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="py-5 bg-gray-50">
              <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M12 8V4H8" />
                        <rect width="16" height="12" x="4" y="8" rx="2" />
                        <path d="M2 14h2" />
                        <path d="M20 14h2" />
                        <path d="M15 13v2" />
                        <path d="M9 13v2" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <ChatInput 
        onSendMessage={onSendMessage}
        onReset={onResetThread}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatWindow;