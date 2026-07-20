/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic, HelpCircle, Sparkles, Check, PhoneCall, Disc } from 'lucide-react';

interface AIChatbotProps {
  currentTab: string;
  currency: 'GHS' | 'USD';
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function AIChatbot({ currentTab, currency }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hello! I am your Immortal Electronics AI Technical Assistant. Need help choosing a premium smartphone, estimating repair pricing, or initiating a device swap in Accra? Ask me anything!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Voice Search Simulation State
  const [isListening, setIsListening] = useState(false);
  const [voicePulse, setVoicePulse] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Simulated Voice Prompts
  const sampleVoicePrompts = [
    "How much does it cost to replace an iPhone 13 screen in Ghana?",
    "Do you have the MacBook Pro M3 Max in stock?",
    "Where is Immortal Electronics Accra branch located?",
    "What is the trade-in value for Samsung S22 Ultra?"
  ];

  const handleVoiceSearchToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    let pulseInterval = setInterval(() => {
      setVoicePulse(p => (p + 1) % 4);
    }, 400);

    // Simulate transcribing voice after 2.5 seconds
    setTimeout(() => {
      clearInterval(pulseInterval);
      setIsListening(false);
      const chosenText = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)];
      setInputMessage(chosenText);
    }, 2800);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    if (!textToSend) setInputMessage('');

    // Append user message
    const updatedMessages = [...messages, { role: 'user' as const, text }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { currentTab, currency },
          chatHistory: updatedMessages.slice(-6) // include recent chat context
        })
      });

      const data = await response.json();
      if (data.response) {
        setMessages(prev => [...prev, { role: 'model', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "I'm currently optimizing my diagnostic systems. Our standard Accra support center can be reached directly via our WhatsApp CTA for swift support." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Diagnostic networks are experiencing high volume. Drop-off coordinates: Immortal Electronics, Circle Ebony, Accra, Ghana." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    { text: "Estimated screen replacement price?", id: "q-screen" },
    { text: "Do you accept MoMo/Cards?", id: "q-momo" },
    { text: "What is the warranty period?", id: "q-warranty" },
    { text: "Where is Accra shop located?", id: "q-location" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="chatbot-launcher-btn"
          className="flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-tr from-[#0066FF] to-[#00CCFF] hover:scale-105 active:scale-95 text-white font-sans font-bold shadow-xl shadow-[#0066FF]/30 transition-all border border-white/10"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <span className="text-sm">AI Technical Assistant</span>
        </button>
      )}

      {/* Expanded chat drawer */}
      {isOpen && (
        <div 
          className="w-80 sm:w-96 h-[500px] rounded-2xl bg-white dark:bg-[#0B0B0B] border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden"
          id="chatbot-panel"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0066FF] to-[#00CCFF] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold tracking-wider">IMMORTAL AI ADVISOR</h4>
                <span className="block text-[9px] text-white/80 font-mono">POWERED BY GEMINI 3.5 FLASH</span>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              id="chatbot-close-btn"
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-black/10"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#0066FF] text-white rounded-br-none shadow-md shadow-[#0066FF]/10'
                      : 'bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl rounded-bl-none p-3 max-w-[80%]">
                  <div className="flex space-x-1.5 items-center">
                    <span className="w-2 h-2 bg-[#0066FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-[#0066FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-[#0066FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    <span className="text-[10px] font-mono text-gray-400 pl-1">Analyzing dynamics...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Quick clicks */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 bg-gray-100 dark:bg-[#121212] border-t border-gray-200 dark:border-gray-800">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block mb-1">Click typical questions:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleSendMessage(q.text)}
                    id={q.id}
                    className="text-[10px] bg-white dark:bg-[#0B0B0B] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg transition-colors"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice search listening overlay inside chat */}
          {isListening && (
            <div className="px-4 py-3 bg-amber-400/10 text-amber-500 text-xs flex items-center justify-between border-t border-gray-100 dark:border-gray-900 font-mono animate-pulse">
              <div className="flex items-center space-x-2">
                <Disc className="w-4 h-4 animate-spin text-amber-500" />
                <span>Simulated Listening... Speak Now</span>
              </div>
              <div className="flex space-x-0.5 items-end h-3">
                <span className={`w-0.5 bg-amber-500 transition-all ${voicePulse >= 0 ? 'h-3' : 'h-1'}`}></span>
                <span className={`w-0.5 bg-amber-500 transition-all ${voicePulse >= 1 ? 'h-2' : 'h-1.5'}`}></span>
                <span className={`w-0.5 bg-amber-500 transition-all ${voicePulse >= 2 ? 'h-3.5' : 'h-1'}`}></span>
                <span className={`w-0.5 bg-amber-500 transition-all ${voicePulse >= 3 ? 'h-2' : 'h-2.5'}`}></span>
              </div>
            </div>
          )}

          {/* Input Panel */}
          <div className="p-3 bg-white dark:bg-[#0B0B0B] border-t border-gray-200 dark:border-gray-800 flex items-center space-x-2">
            {/* Simulated Voice Search Button */}
            <button
              onClick={handleVoiceSearchToggle}
              title="Voice Search"
              id="chatbot-mic-btn"
              className={`p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-[#0066FF] hover:border-[#0066FF]/40 transition-colors ${
                isListening ? 'bg-amber-400/10 text-amber-500 border-amber-400/30' : ''
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Ask about repairs, stock, or swaps..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2.5 text-xs bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl"
              id="chatbot-input-field"
            />

            <button
              onClick={() => handleSendMessage()}
              id="chatbot-send-btn"
              className="p-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055DD] text-white shadow-md shadow-[#0066FF]/10 active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
