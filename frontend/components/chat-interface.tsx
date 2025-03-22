"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Globe, Hotel, Calendar, ShoppingCart, ChevronRight, Mic, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ChatMessage from "@/components/chat-message"
import { cn } from "@/lib/utils"
import { useAppTranslation } from "@/hooks/useAppTranslation"

// Define interface for chat message with optional languageCode
interface ChatMessageType {
  role: string;
  content: string;
  languageCode?: string;
}

interface ChatInterfaceProps {
  isDrawerOpen: boolean
  onOpenDrawer: () => void
}

export default function ChatInterface({ isDrawerOpen, onOpenDrawer }: ChatInterfaceProps) {
  const { $t, currentLanguage, detectedLanguage, isLanguageDetected } = useAppTranslation()
  
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [activeAgent, setActiveAgent] = useState("website")
  const inputRef = useRef<HTMLInputElement>(null)
  const [initialized, setInitialized] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Handle client-side mounting to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Initialize messages only once when component mounts or language changes
  useEffect(() => {
    if (isMounted && (!initialized || (messages.length > 0 && currentLanguage !== messages[0]?.languageCode))) {
      setMessages([{ 
        role: "assistant", 
        content: $t('welcome'),
        languageCode: currentLanguage
      }])
      setInitialized(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, initialized, isMounted])

  // Focus input field when component mounts initially or when agent changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeAgent])
  
  // Additional effect to ensure focus on initial page load
  useEffect(() => {
    if (inputRef.current && isMounted) {
      inputRef.current.focus()
    }
  }, [isMounted])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message to the UI immediately
    const userMessage = { role: "user", content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")

    try {
      // Prepare the messages for the API call
      const apiMessages = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Start streaming response from the API
      const response = await fetch('/api/web-site-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          language: currentLanguage, // Send the current language to the API
          agent: activeAgent // Include the active agent type
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      // Create a temporary variable to accumulate the response
      let accumulatedResponse = ""
      
      // Add a loading message that we'll update as we get chunks
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "", 
        languageCode: currentLanguage 
      }])

      // Read the stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value)
        
        // Process the SSE format (data: {...}\n\n)
        const lines = chunk.split('\n\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            // Check if we've reached the end
            if (data === '[DONE]') {
              continue
            }
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedResponse += parsed.content
                
                // Update the last message with the accumulated response
                setMessages(prev => {
                  const updatedMessages = [...prev]
                  if (updatedMessages.length > 0) {
                    updatedMessages[updatedMessages.length - 1] = {
                      role: "assistant",
                      content: accumulatedResponse,
                      languageCode: currentLanguage
                    }
                  }
                  return updatedMessages
                })
              }
            } catch (e) {
              console.error('Error parsing SSE data', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calling API:', error)
      // Show error message to user
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: `${$t('error.api')}`, 
          languageCode: currentLanguage 
        }
      ])
    }
  }

  const changeAgent = (agent: string) => {
    setActiveAgent(agent)
    // Reset messages with a welcome message in the current language
    setMessages([{ 
      role: "assistant", 
      content: $t('welcome'),
      languageCode: currentLanguage
    }])
  }

  // Set a safe default placeholder value for server-side rendering
  const placeholderText = isMounted ? $t('intro.cta') : 'Explore my work'

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
            onClick={() => changeAgent("website")}
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
            onClick={() => changeAgent("concierge")}
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
            onClick={() => changeAgent("scheduler")}
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
            onClick={() => changeAgent("seller")}
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

      {/* Chat Card Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={{
              role: message.role,
              content: message.content
            }} />
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white">
          <div className="flex items-center gap-4">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholderText}
              className="flex-1"
            />
            
            {/* Mic Button */}
            <Button 
              type="button" 
              size="icon" 
              className="rounded-full bg-gray-900 hover:bg-gray-800 text-white h-10 w-10 flex-shrink-0"
              aria-label="Voice input"
            >
              <Mic className="h-5 w-5" />
            </Button>
            
            {/* File Upload Button */}
            <Button 
              type="button" 
              size="icon" 
              className="rounded-full bg-gray-900 hover:bg-gray-800 text-white h-10 w-10 flex-shrink-0"
              aria-label="Upload file"
            >
              <Plus className="h-5 w-5" />
            </Button>
            
            <Button type="submit" size="icon" className="rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 