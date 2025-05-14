import React from 'react';
import { Message } from '../types';
import { UserIcon } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`py-5 ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {isUser ? (
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <UserIcon size={18} />
              </div>
            ) : (
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
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="font-medium text-sm text-gray-500">
              {isUser ? 'あなた' : 'AI アシスタント'}
            </p>
            <div className="prose prose-slate max-w-none">
              {message.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;