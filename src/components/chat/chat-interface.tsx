'use client'

import { submitMessage } from "@/lib/actions"
import type { ChatSession } from "@/lib/types"
import { useEffect, useRef, useActionState } from "react"
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
import { useFormStatus } from "react-dom"
import { Logo } from "@/app/logo"
import { SidebarTrigger } from "../ui/sidebar"

type ChatInterfaceProps = {
  session: ChatSession | null
  onSessionUpdate: (session: ChatSession) => void
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <ArrowUp />}
      <span className="sr-only">Send message</span>
    </Button>
  )
}

export function ChatInterface({
  session,
  onSessionUpdate,
}: ChatInterfaceProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [state, formAction] = useActionState(submitMessage, {
    messages: session?.messages ?? [],
    headline: session?.headline,
  })

  useEffect(() => {
    if (session && (state.messages !== session.messages || (state.headline && state.headline !== session.headline))) {
      onSessionUpdate({
        ...session,
        messages: state.messages,
        headline: state.headline || session.headline,
      })
    }
  }, [state, session, onSessionUpdate])

  useEffect(() => {
    if (formRef.current) {
        formRef.current.reset();
    }
  }, [session?.id])


  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]");
      if (scrollableView) {
          scrollableView.scrollTop = scrollableView.scrollHeight;
      }
    }
  }, [state.messages.length])

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
        <Logo className="mb-4" />
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-muted-foreground p-4">
          <Bot className="h-24 w-24" />
          <h2 className="text-2xl font-semibold">Start a new chat</h2>
          <p>Select a chat from the sidebar or start a new one to begin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-xl font-semibold truncate pr-4">{session.headline}</h2>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo className="hidden md:flex" />
        </div>
        <Select defaultValue="pro">
          <SelectTrigger className="w-auto sm:w-[180px] flex-shrink-0">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
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
            <motion.div className="p-4 sm:p-6 space-y-6">
            {state.messages.map((message, index) => (
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
      <div className="border-t bg-background/80 p-4 backdrop-blur-sm">
        <form
          ref={formRef}
          action={(formData) => {
            if (formRef.current?.message.value.trim()) {
                formAction(formData);
                formRef.current.reset();
            }
          }}
          className="relative"
        >
          <Textarea
            name="message"
            placeholder="Ask Nexus anything..."
            className="pr-28 pl-24 min-h-[48px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                formRef.current?.requestSubmit()
              }
            }}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-0.5">
            <Button type="button" variant="ghost" size="icon" aria-label="Attach file">
              <Paperclip />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label="Use voice">
              <Mic />
            </Button>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
