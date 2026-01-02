'use client'

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarInput,
} from "@/components/ui/sidebar"
import type { ChatSession } from "@/lib/types"
import { Bot, MessageSquareText, Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { Logo } from "@/app/logo"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

type ChatSidebarProps = {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSessionSelect: (id: string) => void
  onNewChat: () => void
  onSessionDelete: (id: string) => void
  onSessionUpdate: (session: ChatSession) => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  onSessionDelete,
  onSessionUpdate,
}: ChatSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingHeadline, setEditingHeadline] = useState('')

  const handleEditClick = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation()
    setEditingSessionId(session.id)
    setEditingHeadline(session.headline)
  }

  const handleSaveEdit = (e: React.FormEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const session = sessions.find(s => s.id === sessionId);
    if(session && editingHeadline.trim()){
      onSessionUpdate({ ...session, headline: editingHeadline.trim() });
    }
    setEditingSessionId(null);
  }

  const handleCancelEdit = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setEditingSessionId(null);
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <Button
          variant="outline"
          className="h-10 w-full justify-start px-3"
          onClick={onNewChat}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        <SidebarMenu className="mt-4">
          <AnimatePresence initial={false}>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <SidebarMenuItem>
                  {editingSessionId === session.id ? (
                     <form onSubmit={(e) => handleSaveEdit(e, session.id)} className="flex items-center gap-1 w-full p-1">
                        <SidebarInput 
                            autoFocus
                            value={editingHeadline} 
                            onChange={(e) => setEditingHeadline(e.target.value)}
                            className="h-7"
                        />
                        <Button type="submit" variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <Check />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => handleCancelEdit(e, session.id)}>
                            <X />
                        </Button>
                     </form>
                  ) : (
                    <>
                      <SidebarMenuButton
                        onClick={() => onSessionSelect(session.id)}
                        isActive={session.id === activeSessionId}
                        className="w-full justify-start gap-2 pr-[56px]"
                        tooltip={session.headline}
                      >
                        <MessageSquareText className="shrink-0" />
                        <span className="truncate">{session.headline}</span>
                      </SidebarMenuButton>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                         <SidebarMenuAction
                            onClick={(e) => handleEditClick(e, session)}
                            showOnHover
                            aria-label="Edit headline"
                            className="relative"
                         >
                            <Pencil />
                        </SidebarMenuAction>
                        <SidebarMenuAction
                          onClick={(e) => {
                            e.stopPropagation()
                            onSessionDelete(session.id)
                          }}
                          showOnHover
                          aria-label="Delete chat"
                          className="relative"
                        >
                          <Trash2 />
                        </SidebarMenuAction>
                      </div>
                    </>
                  )}
                </SidebarMenuItem>
              </motion.div>
            ))}
          </AnimatePresence>
          {sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-8">
              <Bot className="h-12 w-12" />
              <p className="text-sm">
                No chats yet. Start a new conversation to see it here.
              </p>
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
