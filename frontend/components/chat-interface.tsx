"use client"

import { useState, useEffect } from "react"
import { Globe, Hotel, Calendar, ShoppingCart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppTranslation } from "@/hooks/useAppTranslation"

// Import agent components
import WebsiteAgent from "./agents/WebsiteAgent"
import ConciergeAgent from "./agents/ConciergeAgent"
import SchedulerAgent from "./agents/SchedulerAgent"
import SellerAgent from "./agents/SellerAgent"

interface ChatInterfaceProps {
  isDrawerOpen: boolean
  onOpenDrawer: () => void
}

export default function ChatInterface({ isDrawerOpen, onOpenDrawer }: ChatInterfaceProps) {
  const { $t, currentLanguage } = useAppTranslation()
  
  const [activeAgent, setActiveAgent] = useState("website")
  const [isMounted, setIsMounted] = useState(false)
  
  // Handle client-side mounting to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 ease-in-out bg-[#f5f5f7] pt-2 pb-6 pl-4 pr-4 ${
        isDrawerOpen ? "hidden" : "block w-full"
      }`}
    >
      {/* Agent Selection Header */}
      <div className="bg-[#f5f5f7] mb-3 py-3 pb-2 flex items-center justify-center">
        <div className="flex space-x-16 relative w-full justify-center">
          <Button
            variant={activeAgent === "website" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveAgent("website")}
            className={cn(
              "rounded-full h-12 w-12 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5",
              activeAgent !== "website" && "hover:bg-gray-200"
            )}
            aria-label="Website Agent"
          >
            <Globe strokeWidth={1.5} />
          </Button>
          <Button
            variant={activeAgent === "concierge" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveAgent("concierge")}
            className={cn(
              "rounded-full h-12 w-12 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5",
              activeAgent !== "concierge" && "hover:bg-gray-200"
            )}
            aria-label="Hotel Concierge Agent"
          >
            <Hotel strokeWidth={1.5} />
          </Button>
          <Button
            variant={activeAgent === "scheduler" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveAgent("scheduler")}
            className={cn(
              "rounded-full h-12 w-12 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5",
              activeAgent !== "scheduler" && "hover:bg-gray-200"
            )}
            aria-label="Scheduler Agent"
          >
            <Calendar strokeWidth={1.5} />
          </Button>
          <Button
            variant={activeAgent === "seller" ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveAgent("seller")}
            className={cn(
              "rounded-full h-12 w-12 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5",
              activeAgent !== "seller" && "hover:bg-gray-200"
            )}
            aria-label="Seller Agent"
          >
            <ShoppingCart strokeWidth={1.5} />
          </Button>
          
          {/* Open Drawer Button positioned absolutely */}
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenDrawer}
            className="rounded-full bg-gray-900 hover:bg-gray-300 text-white h-11 w-11 flex items-center justify-center absolute right-6 border-0 top-1"
            aria-label="Open drawer"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Chat Card Container - Render the appropriate agent component */}
      {isMounted && (
        <>
          {activeAgent === "website" && <WebsiteAgent />}
          {activeAgent === "concierge" && <ConciergeAgent />}
          {activeAgent === "scheduler" && <SchedulerAgent />}
          {activeAgent === "seller" && <SellerAgent />}
        </>
      )}
    </div>
  )
} 