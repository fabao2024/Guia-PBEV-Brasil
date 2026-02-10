
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { MessageSquare, X, Send, Sparkles, User, Bot, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CAR_DB } from '../constants';
import { ChatMessage } from '../types';
import { sanitizeChatInput, validateChatInput } from '../utils/sanitize';
import { useRateLimit } from '../hooks/useRateLimit';

function buildCarSummary(lang: string): string {
  const isEn = lang === 'en';
  const totalCars = CAR_DB.length;
  const brands = [...new Set(CAR_DB.map(c => c.brand))];
  const categories = [...new Set(CAR_DB.map(c => c.cat))];
  const priceRange = {
    min: Math.min(...CAR_DB.map(c => c.price)),
    max: Math.max(...CAR_DB.map(c => c.price)),
  };
  const rangeRange = {
    min: Math.min(...CAR_DB.map(c => c.range)),
    max: Math.max(...CAR_DB.map(c => c.range)),
  };

  const carList = CAR_DB.map(c =>
    `${c.brand} ${c.model}: R$${c.price.toLocaleString('pt-BR')}, ${c.range}km, ${c.cat}${c.power ? `, ${c.power}cv` : ''}${c.torque ? `, ${c.torque}kgfm` : ''}`
  ).join('\n');

  if (isEn) {
    return `Total: ${totalCars} vehicles
Brands: ${brands.join(', ')}
Categories: ${categories.join(', ')}
Price range: R$${priceRange.min.toLocaleString('pt-BR')} - R$${priceRange.max.toLocaleString('pt-BR')}
Range: ${rangeRange.min}km - ${rangeRange.max}km

Vehicle list:
${carList}`;
  }

  return `Total: ${totalCars} veículos
Marcas: ${brands.join(', ')}
Categorias: ${categories.join(', ')}
Faixa de preço: R$${priceRange.min.toLocaleString('pt-BR')} - R$${priceRange.max.toLocaleString('pt-BR')}
Faixa de autonomia: ${rangeRange.min}km - ${rangeRange.max}km

Lista de veículos:
${carList}`;
}

export default function ChatWidget() {
  const enableAI = import.meta.env.VITE_ENABLE_AI !== 'false';
  if (!enableAI) return null;

  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: t('chat.welcome') }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const langRef = useRef(i18n.language);
  const { checkRateLimit, recordRequest } = useRateLimit();

  // Reset chat session when language changes
  useEffect(() => {
    if (langRef.current !== i18n.language) {
      langRef.current = i18n.language;
      chatSessionRef.current = null;
      setMessages([{ role: 'model', text: t('chat.welcome') }]);
    }
  }, [i18n.language, t]);

  // Initialize Chat Session on Open (or lazily)
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
          console.error("Gemini API Key is missing. Check .env.local");
          setMessages(prev => [...prev, { role: 'model', text: t('chat.configError') }]);
          return;
        }

        const isEn = i18n.language === 'en';
        const systemPrompt = isEn
          ? `You are the "EletriBrasil Consultant", an expert assistant on the Brazilian electric vehicle market.
Use the data provided below (PBEV 2025 Table) as your primary source.

Vehicle Data:
${buildCarSummary('en')}

Response Instructions:
1. Be concise and direct.
2. Always mention prices and range when relevant.
3. Compare cars side by side if requested.
4. Respond in plain text or basic markdown (bold).
5. Be polite and helpful.
6. Only answer based on the provided data and do not make assumptions.
7. If the user asks about a vehicle not in the table, respond that you don't have data on it.
8. If the user asks about a topic other than electric vehicles, respond that you don't have data on that topic.
9. Always respond in English.`
          : `Você é o "Consultor EletricarBrasil", um assistente especialista no mercado brasileiro de carros elétricos.
Use os dados fornecidos abaixo (Tabela PBEV 2025) como base principal.

Dados dos Veículos:
${buildCarSummary('pt-BR')}

Instruções de Resposta:
1. Seja conciso e direto.
2. Sempre mencione preços e autonomia quando relevante.
3. Compare carros lado a lado se pedido.
4. Responda em formato de texto simples ou markdown básico (negrito).
5. Seja educado e prestativo.
6. Somente responda sobre os dados fornecidos e não faça suposições.
7. Se o usuário perguntar sobre um veículo que não existe na tabela, responda que não temos dados sobre ele.
8. Se o usuário perguntar sobre outro assunto além de veículos elétricos, responda que não temos dados sobre esse assunto.`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
          systemInstruction: systemPrompt
        });

        chatSessionRef.current = model.startChat({
          history: [],
        });

      } catch (error) {
        console.error("DEBUG: Failed to initialize chat", error);
        setMessages(prev => [...prev, { role: 'model', text: t('chat.techError', { message: (error as Error).message }) }]);
      }
    }
  }, [isOpen, i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !chatSessionRef.current) return;

    // Rate limiting
    const rateLimitResult = checkRateLimit();
    if (!rateLimitResult.allowed) {
      const seconds = Math.ceil(rateLimitResult.retryAfterMs / 1000);
      setMessages(prev => [...prev, {
        role: 'model',
        text: t('chat.rateLimit', { seconds })
      }]);
      return;
    }

    // Sanitize and validate
    const sanitized = sanitizeChatInput(inputValue);
    const validation = validateChatInput(sanitized, i18n.language);
    if (!validation.valid) {
      setMessages(prev => [...prev, { role: 'model', text: validation.error! }]);
      setInputValue('');
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: sanitized }]);
    setInputValue('');
    setIsLoading(true);
    recordRequest();

    try {
      const result = await chatSessionRef.current.sendMessage(sanitized);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error).message || "Unknown error";
      setMessages(prev => [...prev, { role: 'model', text: t('chat.connectError', { message: errorMessage }) }]);
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
                <h3 className="text-white font-bold text-sm">{t('chat.headerTitle')}</h3>
                <p className="text-blue-100 text-[10px] font-medium">{t('chat.headerSubtitle')}</p>
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
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-1">{children}</ol>,
                        li: ({ children }) => <li className="mb-0.5">{children}</li>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* Search Grounding Sources */}
                  {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 ml-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {t('chat.sources')}
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
                placeholder={t('chat.placeholder')}
                maxLength={1000}
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
          <span className="font-bold hidden group-hover:inline-block transition-all text-sm">{t('chat.toggleLabel')}</span>
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
