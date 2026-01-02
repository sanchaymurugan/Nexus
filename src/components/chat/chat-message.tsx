import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Bot, User } from "lucide-react"

const userAvatar = PlaceHolderImages.find((img) => img.id === "user-avatar")

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant"

  return (
    <div
      className={cn(
        "flex items-start gap-4"
      )}
    >
      <Avatar
        className={cn(
          "h-10 w-10 border shrink-0",
          isAssistant ? "bg-primary text-primary-foreground" : "bg-background"
        )}
      >
        {isAssistant ? (
          <AvatarFallback>
            <Bot className="h-6 w-6" />
          </AvatarFallback>
        ) : (
          <>
            {userAvatar && (
              <AvatarImage
                src={userAvatar.imageUrl}
                alt={userAvatar.description}
                width={40}
                height={40}
                data-ai-hint={userAvatar.imageHint}
              />
            )}
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={cn(
          "max-w-[85%] rounded-lg p-4 text-base whitespace-pre-wrap",
          isAssistant
            ? "bg-card text-card-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
