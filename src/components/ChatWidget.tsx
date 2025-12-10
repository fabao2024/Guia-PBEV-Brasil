
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { MessageSquare, X, Send, Sparkles, User, Bot, Globe } from 'lucide-react';
import { CAR_DB } from '../constants';
import { ChatMessage } from '../types';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou seu especialista em carros elétricos. Tenho acesso a todos os dados da tabela PBEV 2025. Pergunte-me sobre comparativos, autonomia ou preços!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatSessionRef = useRef<ChatSession | null>(null);

  // Initialize Chat Session on Open (or lazily)
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      try {
        // Access API Key using Vite's import.meta.env standard
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
          console.error("Gemini API Key is missing. Check .env.local");
          setMessages(prev => [...prev, { role: 'model', text: 'Erro de Configuração: API Key não encontrada. Verifique o arquivo .env.local.' }]);
          return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
          systemInstruction: `
                Você é o "Consultor EletricarBrasil", um assistente especialista no mercado brasileiro de carros elétricos.
                Use os dados fornecidos abaixo (Tabela PBEV 2025) como base principal.
                
                Dados dos Veículos:
                ${JSON.stringify(CAR_DB)}
                
                Instruções de Resposta:
                1. Seja conciso e direto.
                2. Sempre mencione preços e autonomia quando relevante.
                3. Compare carros lado a lado se pedido.
                4. Responda em formato de texto simples ou markdown básico (negrito).
                5. Seja educado e prestativo.
                6. Somente responda sobre os dados fornecidos e não faça suposições.
                7. Se o usuário perguntar sobre um veículo que não existe na tabela, responda que não temos dados sobre ele.
                8. Se o usuário perguntar sobre outro assunto além de veículos elétricos, responda que não temos dados sobre esse assunto.
                                `
        });

        chatSessionRef.current = model.startChat({
          history: [],
        });

      } catch (error) {
        console.error("DEBUG: Failed to initialize chat", error);
        setMessages(prev => [...prev, { role: 'model', text: `Erro técnico: ${(error as Error).message}` }]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage(userMsg);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error).message || "Erro desconhecido";
      setMessages(prev => [...prev, { role: 'model', text: `Erro ao conectar: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="text-yellow-300 w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Consultor EletriBrasil v4.0 (Gemini 2.5 Lite)</h3>
                <p className="text-blue-100 text-[10px] font-medium">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-blue-100'}`}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex flex-col max-w-[85%]">
                  <div
                    className={`p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                      }`}
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
                    }}
                  />

                  {/* Search Grounding Sources */}
                  {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 ml-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Fontes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, i) => (
                          <a
                            key={i}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md hover:bg-blue-100 hover:underline truncate max-w-[150px]"
                            title={source.title}
                          >
                            {source.title || new URL(source.uri).hostname}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-10">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Ex: Qual a autonomia real do Dolphin?"
                className="w-full bg-slate-100 border-0 rounded-full pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-1.5 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30"
        >
          <span className="font-bold hidden group-hover:inline-block transition-all text-sm">Consultor IA</span>
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
