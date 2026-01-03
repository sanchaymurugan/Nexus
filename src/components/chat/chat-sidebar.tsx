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
  SidebarFooter,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import type { ChatSession } from "@/lib/types"
import { Bot, MessageSquareText, Plus, Trash2, Pencil, Check, X, LogOut, User as UserIcon } from "lucide-react"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useFirebase, useUser } from "@/firebase"
import { signOut } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'


type ChatSidebarProps = {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSessionSelect: (id: string) => void
  onNewChat: () => void
  onSessionDelete: (id: string) => Promise<void>
  onSessionUpdate: (session: Partial<ChatSession> & { id: string }) => Promise<void>;
  isLoading: boolean;
}

const userAvatar = PlaceHolderImages.find((img) => img.id === "user-avatar");

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  onSessionDelete,
  onSessionUpdate,
  isLoading,
}: ChatSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingHeadline, setEditingHeadline] = useState('')
  const { auth } = useFirebase();
  const { user } = useUser();

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
      onSessionUpdate({ id: sessionId, headline: editingHeadline.trim() });
    }
    setEditingSessionId(null);
  }

  const handleCancelEdit = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setEditingSessionId(null);
  }
  
  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  return (
    <Sidebar className="bg-background/50 backdrop-blur-sm md:bg-sidebar md:backdrop-blur-none">
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
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
        <SidebarMenu className={sessions.length === 0 && !isLoading ? "h-full" : ""}>
          {isLoading ? (
             <div className="p-2 space-y-2">
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
             </div>
          ) : (
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
          )}

          {sessions.length === 0 && !isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
              <Bot className="h-16 w-16" />
              <p className="text-base">
                No chats yet. Start a new conversation to see it here.
              </p>
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
        <div className="flex items-center gap-3 p-2 group-data-[state=collapsed]:hidden">
          <Avatar className="h-10 w-10 border">
             {userAvatar && (
              <AvatarImage
                src={user?.photoURL || userAvatar.imageUrl}
                alt={user?.displayName || "User"}
                width={40}
                height={40}
                data-ai-hint={userAvatar.imageHint}
              />
            )}
            <AvatarFallback>
              <UserIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{user?.displayName ?? "User"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</span>
          </div>
        </div>
        <Separator className="my-1" />
        <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
