"use client"

import { useState } from "react"
import { ChevronLeft, LayoutDashboard, GitBranch, FileText, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const [activeSection, setActiveSection] = useState<string>("display")

  if (!isOpen) return null

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  return (
    <div className="bg-gray-900 text-white h-full w-full absolute inset-0">
      <div className="h-full flex flex-col py-3 pb-4">
        {/* Drawer Header with Navigation */}
        <div className="bg-gray-900 mb-3 py-3 pb-2 flex items-center justify-center">
          <div className="flex space-x-16 relative w-full justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSectionChange("display")}
              className={cn(
                "rounded-full h-12 w-12 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5",
                activeSection === "display"
                  ? "bg-white text-gray-900 hover:bg-white"
                  : "bg-transparent text-white border-gray-700 hover:bg-gray-800 hover:border-gray-600",
              )}
              aria-label="Display"
            >
              <LayoutDashboard className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSectionChange("flow")}
              className={cn(
                "rounded-full h-12 w-12 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5",
                activeSection === "flow"
                  ? "bg-white text-gray-900 hover:bg-white"
                  : "bg-transparent text-white border-gray-700 hover:bg-gray-800 hover:border-gray-600",
              )}
              aria-label="Flow"
            >
              <GitBranch className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSectionChange("report")}
              className={cn(
                "rounded-full h-12 w-12 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5",
                activeSection === "report"
                  ? "bg-white text-gray-900 hover:bg-white"
                  : "bg-transparent text-white border-gray-700 hover:bg-gray-800 hover:border-gray-600",
              )}
              aria-label="Report"
            >
              <FileText className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSectionChange("analytics")}
              className={cn(
                "rounded-full h-12 w-12 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5",
                activeSection === "analytics"
                  ? "bg-white text-gray-900 hover:bg-white"
                  : "bg-transparent text-white border-gray-700 hover:bg-gray-800 hover:border-gray-600",
              )}
              aria-label="Analytics"
            >
              <BarChart2 className="h-6 w-6" />
            </Button>
            
            {/* Close Button positioned absolutely */}
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="rounded-full bg-white hover:bg-gray-400 text-gray-900 h-11 w-11 flex items-center justify-center absolute right-10 top-1"
              aria-label="Close drawer"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Empty content area */}
        <div className="flex-1 px-6 pt-2 pb-3">
          <div className="bg-black rounded-2xl shadow-lg h-full flex flex-col overflow-hidden border border-gray-800 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {/* Content will be added later */}
          </div>
        </div>

      </div>
    </div>
  )
}

