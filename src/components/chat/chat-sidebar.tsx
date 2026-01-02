'use client'

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import type { ChatSession } from "@/lib/types"
import { Bot, MessageSquareText, Plus, Trash2 } from "lucide-react"
import { Logo } from "@/app/logo"

type ChatSidebarProps = {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSessionSelect: (id: string) => void
  onNewChat: () => void
  onSessionDelete: (id: string) => void
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  onSessionDelete,
}: ChatSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <Logo />
          <SidebarTrigger />
        </div>
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
          {sessions.map((session) => (
            <SidebarMenuItem key={session.id}>
              <SidebarMenuButton
                onClick={() => onSessionSelect(session.id)}
                isActive={session.id === activeSessionId}
                className="w-full justify-start gap-2"
                tooltip={session.headline}
              >
                <MessageSquareText className="shrink-0"/>
                <span className="truncate">{session.headline}</span>
              </SidebarMenuButton>
              <SidebarMenuAction
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionDelete(session.id);
                }}
                showOnHover
                aria-label="Delete chat"
              >
                <Trash2 />
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))}
          {sessions.length === 0 && (
             <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-8">
              <Bot className="h-12 w-12" />
              <p className="text-sm">No chats yet. Start a new conversation to see it here.</p>
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
