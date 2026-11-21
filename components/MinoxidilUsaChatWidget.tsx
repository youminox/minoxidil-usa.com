'use client';

import { useEffect, useRef, useState, useCallback, type FormEvent } from 'react';
import Link from 'next/link';

export const CHAT_ENDPOINT =
  'https://ehwjvuhbimqakvzqbvvg.supabase.co/functions/v1/minoxidil-usa-chat';
export const OPEN_MINOXIDIL_USA_CHAT_EVENT = 'minoxidil-usa:open-chat';

const STORAGE_VISITOR_KEY = 'mxusa_chat_visitor_v1';
const STORAGE_SESSION_KEY = 'mxusa_chat_session_v1';
const STORAGE_MESSAGES_KEY = 'mxusa_chat_messages_v1';
const STORAGE_TEASER_KEY = 'mxusa_chat_teaser_v1';

export interface ChatArticleCard {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  url: string;
  image: string;
  excerpt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedArticles?: ChatArticleCard[];
  suggestedOptions?: string[];
  createdAt: string;
}

const INITIAL_QUICK_OPTIONS = [
  '🧔 How to use Minoxidil for patchy beard growth?',
  '💧 Cream-based (You Minox) vs. liquid or foam?',
  '⏱️ How long to wait before showering or sleeping?',
  '📉 Is the Minoxidil shedding phase normal?',
  '👩 How should women use Minoxidil safely?',
  '🧴 Can I combine Minoxidil with a derma roller or oils?',
];

const DEFAULT_WELCOME =
  "Hi! 👋 I'm your Minoxidil USA Clinical & Routine AI Advisor (Powered by You Minox). Ask me anything about hair or beard regrowth, application wait times, shedding phase, side effects, or cream vs. liquid formulas!";

export default function MinoxidilUsaChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showTeaser, setShowTeaser] = useState(false);
  const [visitorId, setVisitorId] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingPromptRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      let vid = localStorage.getItem(STORAGE_VISITOR_KEY);
      if (!vid) {
        vid =
          'mxusa-' +
          Math.random().toString(36).slice(2, 10) +
          '-' +
          Date.now().toString(36);
        localStorage.setItem(STORAGE_VISITOR_KEY, vid);
      }
      setVisitorId(vid);

      const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);
      if (savedSession) setSessionId(savedSession);

      const savedMessages = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }

    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!sessionStorage.getItem(STORAGE_TEASER_KEY)) {
        t1 = setTimeout(() => {
          setShowTeaser(true);
          sessionStorage.setItem(STORAGE_TEASER_KEY, '1');
          t2 = setTimeout(() => setShowTeaser(false), 11000);
        }, 5500);
      }
    } catch {
      // ignore
    }

    fetch(CHAT_ENDPOINT, { method: 'GET' })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.is_enabled === 'boolean') {
          setIsEnabled(data.is_enabled);
        }
        if (data?.welcome_message) {
          setWelcomeMessage(data.welcome_message);
        }
      })
      .catch(() => {
        // fallback defaults
      });

    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [messages, isOpen, isLoading]);

  const persistMessages = useCallback(
    (nextMessages: ChatMessage[], nextSessionId?: string | null) => {
      setMessages(nextMessages);
      try {
        localStorage.setItem(
          STORAGE_MESSAGES_KEY,
          JSON.stringify(nextMessages.slice(-24))
        );
        if (nextSessionId) {
          localStorage.setItem(STORAGE_SESSION_KEY, nextSessionId);
        }
      } catch {
        // ignore
      }
    },
    []
  );

  const trackClick = (
    targetUrl: string,
    article?: { slug?: string; title?: string; category?: string }
  ) => {
    try {
      fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'track_click',
          session_id: sessionId,
          visitor_id: visitorId,
          article_slug: article?.slug || null,
          article_title: article?.title || null,
          category: article?.category || null,
          target_url: targetUrl,
          page_url:
            typeof window !== 'undefined'
              ? window.location.href
              : 'https://minoxidil-usa.com/',
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const sendMessage = useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: 'u-' + Date.now(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      const updatedWithUser = [...messages, userMsg];
      persistMessages(updatedWithUser, sessionId);
      setInput('');
      setIsLoading(true);

      try {
        const historyPayload = updatedWithUser.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch(CHAT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'chat',
            session_id: sessionId,
            visitor_id: visitorId,
            message: trimmed,
            history: historyPayload.slice(0, -1),
            page_url:
              typeof window !== 'undefined'
                ? window.location.href
                : 'https://minoxidil-usa.com/',
            user_agent:
              typeof navigator !== 'undefined' ? navigator.userAgent : '',
          }),
        });

        const data = await res.json();
        const nextSessId = data.session_id || sessionId;
        if (nextSessId && nextSessId !== sessionId) {
          setSessionId(nextSessId);
        }

        const assistantMsg: ChatMessage = {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content:
            data.reply ||
            'Explore our clinical guides at [Minoxidil USA](https://minoxidil-usa.com/) or discover our cream-based formula at [YouMinox.com](https://youminox.com/).',
          recommendedArticles: Array.isArray(data.recommended_articles)
            ? data.recommended_articles
            : [],
          suggestedOptions: Array.isArray(data.suggested_options)
            ? data.suggested_options
            : [],
          createdAt: new Date().toISOString(),
        };

        persistMessages([...updatedWithUser, assistantMsg], nextSessId);
      } catch {
        const fallbackMsg: ChatMessage = {
          id: 'a-err-' + Date.now(),
          role: 'assistant',
          content:
            'We experienced a brief connection delay. You can browse all 1,267+ clinical guides on [Minoxidil USA](https://minoxidil-usa.com/) or visit [YouMinox.com](https://youminox.com/).',
          suggestedOptions: ['Try again'],
          createdAt: new Date().toISOString(),
        };
        persistMessages([...updatedWithUser, fallbackMsg], sessionId);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, persistMessages, sessionId, visitorId]
  );

  useEffect(() => {
    const handleOpenEvent = (ev: Event) => {
      const customEv = ev as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setShowTeaser(false);
      if (customEv.detail?.prompt) {
        pendingPromptRef.current = customEv.detail.prompt;
      }
    };
    window.addEventListener(OPEN_MINOXIDIL_USA_CHAT_EVENT, handleOpenEvent);
    return () =>
      window.removeEventListener(OPEN_MINOXIDIL_USA_CHAT_EVENT, handleOpenEvent);
  }, []);

  useEffect(() => {
    if (isOpen && pendingPromptRef.current && !isLoading) {
      const p = pendingPromptRef.current;
      pendingPromptRef.current = null;
      void sendMessage(p);
    }
  }, [isOpen, isLoading, sendMessage]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleResetChat = () => {
    setMessages([]);
    setSessionId(null);
    try {
      localStorage.removeItem(STORAGE_MESSAGES_KEY);
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {
      // ignore
    }
  };

  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      if (!line.trim()) return <div key={lineIdx} className="h-2" />;

      const bullet = /^\s*[-•*]\s+/.test(line);
      const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*)/g;
      const parts = line.split(tokenRegex);

      return (
        <p
          key={lineIdx}
          className={`leading-relaxed mb-1.5 last:mb-0 ${bullet ? 'pl-2' : ''}`}
        >
          {parts.map((part, i) => {
            const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
            if (linkMatch) {
              const [, label, rawUrl] = linkMatch;
              const isInternal = rawUrl.includes('minoxidil-usa.com');
              const internalPath = isInternal
                ? rawUrl.replace(/^https?:\/\/(www\.)?minoxidil-usa\.com/i, '') || '/'
                : null;

              if (internalPath) {
                return (
                  <Link
                    key={i}
                    href={internalPath}
                    onClick={() => trackClick(rawUrl, { title: label })}
                    className="inline-flex items-center gap-1 font-bold text-primary-700 underline decoration-primary-400 decoration-2 underline-offset-2 hover:text-primary-900 transition-colors"
                  >
                    <span>{label}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                );
              }

              return (
                <a
                  key={i}
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick(rawUrl, { title: label })}
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 underline decoration-emerald-400 decoration-2 underline-offset-2 hover:text-emerald-900 transition-colors"
                >
                  <span>{label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              );
            }

            const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
            if (boldMatch) {
              return (
                <strong key={i} className="font-bold text-slate-900">
                  {boldMatch[1]}
                </strong>
              );
            }

            return (
              <span key={i}>
                {bullet && i === 0 ? part.replace(/^\s*[-•*]\s+/, '• ') : part}
              </span>
            );
          })}
        </p>
      );
    });
  };

  if (!isEnabled) return null;

  const latestAssistantMsg =
    messages.length > 0 && messages[messages.length - 1].role === 'assistant'
      ? messages[messages.length - 1]
      : null;

  return (
    <div className="fixed bottom-5 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
      {/* Chat Modal Window */}
      {isOpen && (
        <div
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[420px] h-[610px] max-h-[82vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Minoxidil USA Clinical AI Advisor"
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 text-white flex items-center justify-between gap-3 shrink-0"
            style={{
              background:
                'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #059669 100%)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-full bg-white/15 border border-white/30 grid place-items-center shrink-0">
                <span className="text-xl" aria-hidden="true">
                  🧬
                </span>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#064e3b]"
                  title="Online"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-extrabold text-[15px] leading-tight truncate text-white">
                    Minoxidil USA AI Advisor
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-300 text-slate-950 shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-xs text-emerald-100 truncate">
                  1,267+ Clinical Guides &bull; Powered by You Minox
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-xs text-white transition-colors cursor-pointer"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  ↺
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-sm font-bold text-white transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-slate-50/90 text-[13.5px] text-slate-800">
            {/* Welcome Bubble */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-900 text-white grid place-items-center text-[10px] font-extrabold shrink-0 mt-0.5">
                MX
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200/90 p-3.5 text-slate-800 shadow-sm max-w-[88%]">
                <p className="leading-relaxed">{welcomeMessage}</p>
              </div>
            </div>

            {/* Initial Quick Options */}
            {messages.length === 0 && !isLoading && (
              <div className="pl-9 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Popular clinical questions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {INITIAL_QUICK_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => void sendMessage(opt)}
                      className="text-left text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-emerald-200 text-primary-800 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-xs cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message History */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2.5">
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary-700 text-white px-3.5 py-2.5 max-w-[85%] shadow-xs">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-900 text-white grid place-items-center text-[10px] font-extrabold shrink-0 mt-0.5">
                        MX
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200/90 p-3.5 max-w-[88%] shadow-sm">
                        {renderFormattedContent(msg.content)}
                      </div>
                    </div>

                    {/* Interactive Recommended Article Cards */}
                    {msg.recommendedArticles &&
                      msg.recommendedArticles.length > 0 && (
                        <div className="pl-9 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            📚 Recommended Clinical Guides:
                          </span>
                          <div className="space-y-2">
                            {msg.recommendedArticles.map((art) => {
                              const internalHref = `/${art.category}/${art.slug}/`;
                              return (
                                <Link
                                  key={art.slug}
                                  href={internalHref}
                                  onClick={() =>
                                    trackClick(art.url, {
                                      slug: art.slug,
                                      title: art.title,
                                      category: art.category,
                                    })
                                  }
                                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all shadow-xs group"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={art.image}
                                    alt={art.title}
                                    width={56}
                                    height={44}
                                    loading="lazy"
                                    className="w-14 h-11 rounded-xl object-cover shrink-0 bg-slate-100"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-700 block">
                                      {art.categoryName}
                                    </span>
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary-800 line-clamp-2 leading-snug">
                                      {art.title}
                                    </h4>
                                  </div>
                                  <span className="text-primary-600 font-bold text-sm shrink-0 pr-1 group-hover:translate-x-0.5 transition-transform">
                                    →
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 pl-9" aria-label="Typing">
                {[0, 1, 2].map((idx) => (
                  <span
                    key={idx}
                    className="h-2 w-2 animate-bounce rounded-full bg-primary-600"
                    style={{ animationDelay: `${idx * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {/* Dynamic Follow-up Suggestion Chips */}
            {!isLoading &&
              latestAssistantMsg?.suggestedOptions &&
              latestAssistantMsg.suggestedOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-9">
                  {latestAssistantMsg.suggestedOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => void sendMessage(opt)}
                      className="rounded-full border border-primary-600/30 bg-white px-3 py-1.5 text-xs font-semibold text-primary-800 hover:bg-primary-50 transition-colors cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>

          {/* You Minox Official Brand Bottom Bar */}
          <a
            href="https://youminox.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackClick('https://youminox.com/', {
                slug: 'youminox-official-store',
                title: 'You Minox Cream-Based Minoxidil Store',
                category: 'sponsor',
              })
            }
            className="shrink-0 bg-emerald-50 px-4 py-2 text-center text-xs font-bold text-emerald-950 hover:bg-emerald-100 transition-colors border-t border-emerald-200/80"
          >
            ✨ Try Irritation-Free Cream Minoxidil &rarr;{' '}
            <span className="underline">Visit YouMinox.com ↗</span>
          </a>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex shrink-0 gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hair, beard, wait times, shedding..."
              maxLength={600}
              className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-600"
              aria-label="Ask a question about Minoxidil"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-600 text-white disabled:opacity-40 hover:bg-primary-700 transition-colors cursor-pointer"
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Teaser Bubble */}
      {!isOpen && showTeaser && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setShowTeaser(false);
          }}
          className="mb-3 max-w-[270px] rounded-2xl rounded-br-sm border border-emerald-200 bg-white px-4 py-3 text-left text-sm shadow-xl hover:border-primary-500 transition-colors cursor-pointer"
        >
          <span className="font-display font-bold text-slate-900 block">
            🇺🇸 Questions about Minoxidil?
          </span>
          <span className="block text-xs text-slate-600 mt-0.5">
            Ask our AI about hair &amp; beard routines, wait times, shedding, or cream vs. liquid.
          </span>
        </button>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowTeaser(false);
        }}
        className="relative grid h-14 w-14 place-items-center rounded-full text-2xl text-white shadow-[0_14px_30px_-8px_rgba(5,150,105,0.85)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
        }}
        aria-label={isOpen ? 'Close AI Advisor' : 'Open Minoxidil USA AI Advisor'}
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
          </span>
        )}
      </button>
    </div>
  );
}
