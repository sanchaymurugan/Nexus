import type { SVGProps } from "react"
import { cn } from "@/lib/utils"

const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    {...props}
  >
    <path
      d="M50 2.5 L93.3 26.25 V 73.75 L50 97.5 L6.7 73.75 V 26.25 Z"
      className="fill-primary"
    />
    <path
      d="M35 70 L35 30 L45 30 L60 55 L60 30 L70 30 L70 70 L60 70 L45 45 L45 70 Z"
      className="fill-primary-foreground"
    />
  </svg>
)

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className="h-6 w-6" />
      <h1 className="text-lg font-semibold text-foreground">Nexus</h1>
    </div>
  )
}
