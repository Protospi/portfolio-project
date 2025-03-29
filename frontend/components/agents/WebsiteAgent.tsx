"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Plus, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ChatMessage from "@/components/chat-message"
import { useAppTranslation } from "@/hooks/useAppTranslation"

// Define interface for chat message with optional languageCode
export interface ChatMessageType {
  role: string;
  content: string;
  languageCode?: string;
}

export default function WebsiteAgent() {
  const { $t, currentLanguage } = useAppTranslation()
  
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [initialized, setInitialized] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [conversationId, setConversationId] = useState<string>("")
  const [welcomeMessageSaved, setWelcomeMessageSaved] = useState(false)
  
  // Generate a MongoDB ObjectId style ID
  const generateObjectId = (): string => {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0')
    const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0')
    const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0')
    
    return timestamp + machineId + processId + counter
  }

  // Save message to database
  const saveMessageToDatabase = async (message: ChatMessageType) => {
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('Error: No userId found in localStorage');
        return;
      }
      
      console.log('Saving message to database:', {
        conversationId,
        role: message.role,
        content: message.content.substring(0, 50) + '...',
        languageCode: message.languageCode || currentLanguage,
        userId
      });
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          conversationId,
          role: message.role,
          content: message.content,
          languageCode: message.languageCode || currentLanguage,
          timestamp: new Date().toISOString(),
          agent: "website"
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error text available');
        console.error('Failed to save message to database:', response.status, errorText);
      } else {
        console.log('Message saved successfully:', message.role);
      }
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  // Initialize or reset the conversation
  const initializeConversation = () => {
    const newConversationId = generateObjectId()
    setConversationId(newConversationId)
    
    const welcomeMessage = { 
      role: "assistant", 
      content: $t('welcome'),
      languageCode: currentLanguage
    }
    
    setMessages([welcomeMessage])
    setInitialized(true)
    setWelcomeMessageSaved(false)
    
    // We don't save the welcome message immediately, only when user sends first message
  }
  
  // Handle clearing the conversation
  const handleClearConversation = () => {
    initializeConversation()
    // Focus the input field after clearing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)
  }
  
  // Handle client-side mounting to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Initialize messages only once when component mounts or language changes
  useEffect(() => {
    if (isMounted && (!initialized || (messages.length > 0 && currentLanguage !== messages[0]?.languageCode))) {
      initializeConversation()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, initialized, isMounted])

  // Focus input field when component mounts
  useEffect(() => {
    if (inputRef.current && isMounted) {
      inputRef.current.focus()
    }
  }, [isMounted])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Get userId from localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('Error: No userId found in localStorage');
      const errorMessage = { 
        role: "assistant", 
        content: "Error: User not found. Please refresh the page and try again.", 
        languageCode: currentLanguage 
      }
      setMessages([...messages, errorMessage]);
      return;
    }

    // Add user message to the UI immediately
    const userMessage = { 
      role: "user", 
      content: input,
      languageCode: currentLanguage 
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")

    // If this is the first user message in this conversation, save the welcome message first
    if (!welcomeMessageSaved && messages.length === 1 && messages[0].role === "assistant") {
      await saveMessageToDatabase(messages[0])
      setWelcomeMessageSaved(true)
    }

    // Save user message to database
    await saveMessageToDatabase(userMessage)

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
          language: currentLanguage,
          agent: "website",
          conversationId: conversationId,
          userId: userId
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

      // We don't need to save the assistant message here since it's already saved by the backend
      // The backend webSiteAgent.js handles saving the assistant response
      
    } catch (error) {
      console.error('Error calling API:', error)
      // Show error message to user
      const errorMessage = { 
        role: "assistant", 
        content: `${$t('error.api')}`, 
        languageCode: currentLanguage 
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      // Save error message to database
      await saveMessageToDatabase(errorMessage)
    }
  }

  // Set a safe default placeholder value for server-side rendering
  const placeholderText = isMounted ? $t('intro.cta') : 'Explore my work'

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
      {/* Header with Title and Action Buttons */}
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-xl">{$t('agent.website.title')}</h2>
        <div className="flex gap-4">
          <Button 
            type="button" 
            size="icon" 
            className="rounded-full bg-gray-900 hover:bg-gray-800 text-white h-10 w-10 flex-shrink-0"
            aria-label={$t('agent.website.clear')}
            title={$t('agent.website.clear')}
            onClick={handleClearConversation}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button 
            type="button" 
            size="icon" 
            className="rounded-full bg-gray-900 hover:bg-gray-800 text-white h-10 w-10 flex-shrink-0"
            aria-label={$t('agent.website.export')}
            title={$t('agent.website.export')}
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
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
  )
} 