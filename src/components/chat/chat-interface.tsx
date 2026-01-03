'use client'

import { submitMessage, type ChatState } from "@/lib/actions"
import type { Message } from "@/lib/types"
import { useEffect, useRef, useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUp, Bot, Loader2, Mic, Paperclip, Sparkles } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { AnimatePresence, motion } from "framer-motion"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, orderBy, query } from "firebase/firestore"

type ChatInterfaceProps = {
  chatState: ChatState | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <ArrowUp />}
      <span className="sr-only">Send message</span>
    </Button>
  )
}

export function ChatInterface({
  chatState,
}: ChatInterfaceProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const { user } = useUser();
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(() => {
    if (!user || !chatState?.sessionId) return null;
    return query(
      collection(firestore, `users/${user.uid}/sessions/${chatState.sessionId}/messages`),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, user, chatState?.sessionId]);

  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);

  const [state, formAction] = useActionState(submitMessage, chatState as ChatState)
  
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);


  useEffect(() => {
    if (messages) {
      setOptimisticMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]");
      if (scrollableView) {
          scrollableView.scrollTop = scrollableView.scrollHeight;
      }
    }
  }, [optimisticMessages.length])
  
  const handleFormAction = (formData: FormData) => {
    const userMessageContent = formData.get('message') as string;
    if (!userMessageContent?.trim()) return;

    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessageContent,
      createdAt: new Date()
    };
    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    formAction(formData);
    formRef.current?.reset();
  }


  if (!chatState) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="flex h-full flex-col items-center justify-center gap-6 text-center text-muted-foreground p-4">
          <Bot className="h-28 w-28" />
          <h2 className="text-3xl font-semibold">Start a new chat</h2>
          <p className="text-lg">Select a chat from the sidebar or start a new one to begin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b p-6">
        <h2 className="text-2xl font-semibold truncate pr-4">{state.headline}</h2>
        <Select defaultValue="pro">
          <SelectTrigger className="w-auto sm:w-[200px] flex-shrink-0 text-base py-5">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <SelectValue placeholder="Select a mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fast">Fast</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="ultra">Ultra</SelectItem>
          </SelectContent>
        </Select>
      </header>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <AnimatePresence>
            <motion.div className="p-6 sm:p-8 space-y-8">
            {(messagesLoading && optimisticMessages.length === 0) && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {optimisticMessages.map((message, index) => (
                <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                <ChatMessage message={message} />
                </motion.div>
            ))}
            </motion.div>
        </AnimatePresence>
      </ScrollArea>
      <div className="border-t bg-background/80 p-6 backdrop-blur-sm">
        <form
          ref={formRef}
          action={handleFormAction}
          className="relative"
        >
          <Textarea
            name="message"
            placeholder="Ask Nexus anything..."
            className="pr-32 pl-28 min-h-[56px] text-lg resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                formRef.current?.requestSubmit()
              }
            }}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-1">
            <Button type="button" variant="ghost" size="icon" className="w-10 h-10" aria-label="Attach file">
              <Paperclip className="w-6 h-6" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="w-10 h-10" aria-label="Use voice">
              <Mic className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
