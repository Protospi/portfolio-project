"use client"

export default function ChatMessage({ message }: { message: { role: string; content: string } }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  )
}

