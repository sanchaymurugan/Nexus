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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { ChatSession } from "@/lib/types"
import { Bot, MessageSquareText, Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Logo } from "@/app/logo"

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
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Logo className="hidden group-data-[state=collapsed]:block" showName={false} />
        </div>
        <Button
            variant="outline"
            className="h-10 w-full justify-start px-3 group-data-[state=collapsed]:hidden"
            onClick={onNewChat}
        >
            <Plus className="mr-2 h-5 w-5" />
            New Chat
        </Button>
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
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
                            className="h-8 text-base"
                        />
                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <Check className="w-5 h-5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => handleCancelEdit(e, session.id)}>
                            <X className="w-5 h-5" />
                        </Button>
                     </form>
                  ) : (
                    <>
                      <SidebarMenuButton
                        onClick={() => onSessionSelect(session.id)}
                        isActive={session.id === activeSessionId}
                        className="w-full justify-start gap-3 pr-[56px]"
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
                            <Pencil className="w-5 h-5" />
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
                          <Trash2 className="w-5 h-5" />
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
              <Bot className="h-16 w-16" />
              <p className="text-base">
                No chats yet. Start a new conversation to see it here.
              </p>
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
