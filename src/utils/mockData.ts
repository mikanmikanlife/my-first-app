import { Thread } from '../types';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

// Create some sample threads with messages
export const initialThreads: Thread[] = [
  {
    id: generateId(),
    title: "General Questions",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    messages: [
      {
        id: generateId(),
        content: "こんにちは！何か質問はありますか？",
        role: 'assistant',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2),
      },
      {
        id: generateId(),
        content: "AIについて教えてください。",
        role: 'user',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2 + 5 * 60 * 1000),
      },
      {
        id: generateId(),
        content: "AIは「人工知能（Artificial Intelligence）」の略称です。人間の知能を模倣し、学習、問題解決、パターン認識などのタスクを実行するコンピュータシステムを指します。近年では機械学習やディープラーニングの発展により、自然言語処理、画像認識、意思決定支援など様々な分野で活用されています。",
        role: 'assistant',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2 + 10 * 60 * 1000),
      }
    ]
  },
  {
    id: generateId(),
    title: "プログラミング相談",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    messages: [
      {
        id: generateId(),
        content: "何かお手伝いできることはありますか？",
        role: 'assistant',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: generateId(),
        content: "Reactでのステート管理のベストプラクティスを教えてください。",
        role: 'user',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      },
      {
        id: generateId(),
        content: "Reactでのステート管理のベストプラクティスは以下のとおりです：\n\n1. **単一責任の原則を守る** - 各コンポーネントは必要最小限のステートのみを管理する\n\n2. **ステートを上位へリフトアップする** - 複数のコンポーネントで共有するステートは共通の親コンポーネントで管理する\n\n3. **状態を分割する** - 関連する状態をグループ化し、独立して更新できるようにする\n\n4. **useReducerの活用** - 複雑な状態ロジックには、useReducerを使用して管理する\n\n5. **コンテキストの活用** - グローバルな状態はReact Contextを使用して管理する\n\nアプリケーションの規模が大きくなる場合は、Redux、Zustand、Jotaiなどの状態管理ライブラリの使用も検討してください。",
        role: 'assistant',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      }
    ]
  },
  {
    id: generateId(),
    title: "新しい会話",
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
      {
        id: generateId(),
        content: "こんにちは！どのようなことでお手伝いできますか？",
        role: 'assistant',
        timestamp: new Date(),
      }
    ]
  }
];