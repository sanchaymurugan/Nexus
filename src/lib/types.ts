import type { Timestamp } from 'firebase/firestore';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Timestamp | Date;
};

export type ChatSession = {
  id: string;
  headline: string;
  messages: Message[];
  updatedAt?: Timestamp | Date;
  userId: string;
};
