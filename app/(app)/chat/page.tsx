'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { PageLoader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Send, MessageSquare } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'
import { getChatHistory, sendChatMessage } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChatHistory().then(m => { setMessages(m); setLoading(false) })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || sending) return
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)
    const reply = await sendChatMessage(userMsg.content)
    setMessages(prev => [...prev, reply])
    setSending(false)
  }

  if (loading) return <PageLoader />

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="pb-3 border-b border-onyx-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-evergreen flex items-center justify-center">
            <MessageSquare size={14} className="text-lime" />
          </div>
          <div>
            <p className="font-heading font-semibold text-sm text-onyx">Assistant IA</p>
            <p className="text-[10px] text-onyx-400">Contexte : profil, séances, matchs, stats</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="size-14 rounded-full bg-evergreen/10 flex items-center justify-center">
              <MessageSquare size={24} className="text-evergreen" />
            </div>
            <p className="font-heading font-bold text-base text-onyx">Pose ta question</p>
            <p className="text-sm text-onyx-400 max-w-[240px]">
              L'IA connaît ton profil, tes séances et tes matchs
            </p>
            {['Comment améliorer mon revers ?', 'Analyse ma semaine', 'Programme pour débutant'].map(q => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-evergreen/30 text-evergreen hover:bg-evergreen/5"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="size-7 rounded-full bg-evergreen flex items-center justify-center mr-2 shrink-0 mt-1">
                <MessageSquare size={12} className="text-lime" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] rounded-[12px] px-4 py-2.5 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-evergreen text-pp-white rounded-br-[4px]'
                : 'bg-white border border-onyx-100 text-onyx rounded-bl-[4px]',
            )}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              <p className={cn('text-[10px] mt-1', msg.role === 'user' ? 'text-lime/70' : 'text-onyx-400')}>
                {formatRelativeTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-evergreen flex items-center justify-center">
              <MessageSquare size={12} className="text-lime" />
            </div>
            <div className="bg-white border border-onyx-100 rounded-[12px] rounded-bl-[4px] px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="size-1.5 rounded-full bg-onyx-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-onyx-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Pose ta question..."
          className="flex-1 h-10 rounded-full border border-onyx-200 bg-white px-4 text-sm focus:outline-none focus:border-evergreen"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="size-10 rounded-full bg-evergreen text-pp-white flex items-center justify-center disabled:opacity-40"
        >
          {sending ? <LoadingSpinner size="sm" className="border-lime border-t-transparent" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
