import { Message, Thread } from '../types';
import { v4 as uuidv4 } from 'uuid';
// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

// Simulate API response with a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulated AI response function
export const getAIResponse = async (message: string): Promise<Message> => {
  // Simulate network delay
  await delay(1000);
  
  // Mock responses based on input
  let response = "申し訳ありませんが、よく理解できませんでした。もう少し詳しく教えていただけますか？";
  
  if (message.includes("こんにちは") || message.includes("はじめまして")) {
    response = "こんにちは！どのようなことでお手伝いできますか？";
  } else if (message.includes("ありがとう")) {
    response = "どういたしまして！他にお手伝いできることがあれば、お気軽にお尋ねください。";
  } else if (message.includes("AI") || message.includes("人工知能")) {
    response = "AIとは「人工知能（Artificial Intelligence）」の略称で、人間の知能を模倣するコンピュータシステムです。自然言語処理、画像認識、意思決定支援など様々な分野で活用されています。";
  } else if (message.length < 10) {
    response = "もう少し詳しく教えていただけますか？より具体的な回答ができます。";
  }
  
  return {
    id: uuidv4(),
    content: response,
    role: 'assistant',
    timestamp: new Date()
  };
};