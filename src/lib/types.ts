export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ChatSession = {
  id: string;
  headline: string;
  messages: Message[];
};
