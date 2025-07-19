import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuContent = DropdownMenuPrimitive.Content
const DropdownMenuItem = DropdownMenuPrimitive.Item
const DropdownMenuSeparator = DropdownMenuPrimitive.Separator

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Dropdown({ trigger, children }: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="min-w-56 bg-card border border-border rounded-md p-1 shadow-md"
        sideOffset={4}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface DropdownItemProps {
  icon?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DropdownItem({ icon, onClick, children, className }: DropdownItemProps) {
  return (
    <DropdownMenuItem
      className={cn(
        "flex items-center px-3 py-2 text-sm rounded-sm cursor-pointer hover:bg-muted text-foreground",
        className
      )}
      onClick={onClick}
    >
      {icon && <i className={cn(icon, "mr-3 text-sm")}></i>}
      {children}
    </DropdownMenuItem>
  )
}

export function DropdownSeparator() {
  return <DropdownMenuSeparator className="h-px bg-border my-1" />
}