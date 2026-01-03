import type { Timestamp } from 'firebase/firestore';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Timestamp | AdminTimestamp | Date;
};

export type ChatSession = {
  id: string;
  headline: string;
  messages: Message[];
  updatedAt?: Timestamp | AdminTimestamp | Date;
  userId: string;
};
