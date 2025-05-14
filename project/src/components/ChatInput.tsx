import React, { useState } from 'react';
import { SendIcon, RotateCcwIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onReset: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onReset, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white py-4">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[100px]"
              placeholder="メッセージを入力..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`absolute right-3 bottom-3 p-2 rounded-md ${
                message.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!message.trim() || isLoading}
            >
              <SendIcon size={18} />
            </button>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              <span>Shift + Enter で改行</span>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RotateCcwIcon size={16} />
              <span>リセット</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;