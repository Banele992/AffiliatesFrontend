import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

interface Message {
    id: number;
    text: string;
    sender: 'bot' | 'user';
    time: string;
}

// ──────────────────────────────────────────────────────────
//  Language definitions
// ──────────────────────────────────────────────────────────
type LangCode = 'en' | 'zu' | 'af' | 'pt' | 'fr';

interface LangConfig {
    label: string;
    flag: string;
    greeting: string;
    placeholder: string;
    hint: string;
    online: string;
    errorNetwork: string;
    errorServer: string;
}

const LANGUAGES: Record<LangCode, LangConfig> = {
    en: {
        label: 'English',
        flag: '🇬🇧',
        greeting:
            "👋 Hello! I'm your Affiliates assistant. I can help you with commission queries, campaign information, voucher status, or any questions about the Hollywoodbets Affiliate Program. How can I help you today?",
        placeholder: 'Ask about affiliates...',
        hint: 'Press Enter to send · Shift+Enter for new line',
        online: 'Online',
        errorNetwork: "Sorry, I'm having trouble connecting to the server right now. Please try again later.",
        errorServer: "Sorry, I didn't get that.",
    },
    zu: {
        label: 'isiZulu',
        flag: '🇿🇦',
        greeting:
            "👋 Sawubona! Ngingumsizi wakho wama-Affiliates. Ngingakusiza ngemibuzo yamakhomisheni, ulwazi lwemizungulu, isimo sesheli, noma noma yimiphi imibuzo mayelana nohlelo lwe-Hollywoodbets Affiliate Program. Ngingakusiza kanjani namuhla?",
        placeholder: 'Buza ngama-affiliates...',
        hint: 'Cindezela Enter ukuthumela · Shift+Enter umugqa omusha',
        online: 'Ku-inthanethi',
        errorNetwork: 'Ngiyaxolisa, ngiba nezinkinga zokuxhumana neseva. Sicela uzame futhi kamuva.',
        errorServer: 'Ngiyaxolisa, angizange ngizuze lokho.',
    },
    af: {
        label: 'Afrikaans',
        flag: '🇿🇦',
        greeting:
            "👋 Hallo! Ek is jou Affiliates-assistent. Ek kan jou help met kommissievrae, veldtoginligting, koeponstatus, of enige vrae oor die Hollywoodbets Affiliateprogramme. Hoe kan ek jou vandag help?",
        placeholder: 'Vra oor affiliates...',
        hint: 'Druk Enter om te stuur · Shift+Enter vir nuwe reël',
        online: 'Aanlyn',
        errorNetwork: 'Jammer, ek ondervind probleme om met die bediener te verbind. Probeer asseblief later weer.',
        errorServer: 'Jammer, ek het dit nie reggekry nie.',
    },
    pt: {
        label: 'Português',
        flag: '🇵🇹',
        greeting:
            "👋 Olá! Sou o seu assistente de Afiliados. Posso ajudá-lo com consultas de comissões, informações de campanhas, status de vouchers ou quaisquer perguntas sobre o Programa de Afiliados da Hollywoodbets. Como posso ajudá-lo hoje?",
        placeholder: 'Pergunte sobre afiliados...',
        hint: 'Pressione Enter para enviar · Shift+Enter para nova linha',
        online: 'Online',
        errorNetwork: 'Desculpe, estou com problemas para conectar ao servidor. Por favor, tente novamente mais tarde.',
        errorServer: 'Desculpe, não consegui processar isso.',
    },
    fr: {
        label: 'Français',
        flag: '🇫🇷',
        greeting:
            "👋 Bonjour! Je suis votre assistant Affiliés. Je peux vous aider avec vos questions de commission, les informations de campagne, le statut des bons, ou toute question concernant le Programme d'Affiliation Hollywoodbets. Comment puis-je vous aider aujourd'hui?",
        placeholder: "Posez une question sur les affiliés...",
        hint: 'Appuyez sur Entrée pour envoyer · Maj+Entrée pour nouvelle ligne',
        online: 'En ligne',
        errorNetwork: "Désolé, je rencontre des problèmes de connexion au serveur. Veuillez réessayer plus tard.",
        errorServer: "Désolé, je n'ai pas compris.",
    },
};

// ──────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────
const getTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m}${ampm}`;
};

const buildGreeting = (lang: LangCode): Message => ({
    id: 0,
    text: LANGUAGES[lang].greeting,
    sender: 'bot',
    time: getTime(),
});

// ──────────────────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────────────────
const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState<LangCode>('en');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [messages, setMessages] = useState<Message[]>([buildGreeting('en')]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const langMenuRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(1);

    const cfg = LANGUAGES[language];

    // Scroll & focus
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, messages]);

    // Close language menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Language switch ──────────────────────────────────
    const switchLanguage = (code: LangCode) => {
        setLanguage(code);
        setShowLangMenu(false);
        setConversationId(null);
        nextId.current = 1;
        setMessages([{ ...buildGreeting(code), id: nextId.current++ }]);
    };

    // ── Send message ─────────────────────────────────────
    const sendMessage = async () => {
        const text = input.trim();
        if (!text) return;

        const userMsg: Message = { id: nextId.current++, text, sender: 'user', time: getTime() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:5082/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    conversationId: conversationId,
                    language: language,
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId);
            }

            const botMsg: Message = {
                id: nextId.current++,
                text: data.reply || cfg.errorServer,
                sender: 'bot',
                time: getTime(),
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Error communicating with chatbot API:', error);
            const botMsg: Message = {
                id: nextId.current++,
                text: cfg.errorNetwork,
                sender: 'bot',
                time: getTime(),
            };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ── Render ───────────────────────────────────────────
    return (
        <>
            {/* Chat Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'chatbot-toggle--open' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Toggle chat"
                id="chatbot-toggle-btn"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    <span className="chatbot-toggle-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z" />
                        </svg>
                        <span>Chat</span>
                    </span>
                )}
            </button>

            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'chatbot-window--open' : ''}`} id="chatbot-window">

                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-left">
                        <div className="chatbot-avatar">
                            <img src="/HollywoodLogo.png" alt="Logo" style={{ width: '100%', height: 'auto', borderRadius: '50%' }} />
                        </div>
                        <div className="chatbot-header-info">
                            <span className="chatbot-name">Affiliates Assistant</span>
                            <span className="chatbot-status">
                                <span className="chatbot-status-dot" />
                                {cfg.online}
                            </span>
                        </div>
                    </div>

                    <div className="chatbot-header-actions">
                        {/* Language Selector */}
                        <div className="chatbot-lang-selector" ref={langMenuRef}>
                            <button
                                className="chatbot-lang-btn"
                                onClick={() => setShowLangMenu(prev => !prev)}
                                aria-label="Change language"
                                id="chatbot-lang-btn"
                                title={`Language: ${cfg.label}`}
                            >
                                <span className="chatbot-lang-flag">{cfg.flag}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    width="14"
                                    height="14"
                                    className={`chatbot-lang-chevron ${showLangMenu ? 'chatbot-lang-chevron--open' : ''}`}
                                >
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            </button>

                            {showLangMenu && (
                                <div className="chatbot-lang-menu" id="chatbot-lang-menu">
                                    {(Object.entries(LANGUAGES) as [LangCode, LangConfig][]).map(([code, l]) => (
                                        <button
                                            key={code}
                                            className={`chatbot-lang-option ${language === code ? 'chatbot-lang-option--active' : ''}`}
                                            onClick={() => switchLanguage(code)}
                                            id={`chatbot-lang-option-${code}`}
                                        >
                                            <span>{l.flag}</span>
                                            <span>{l.label}</span>
                                            {language === code && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            className="chatbot-close-btn"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                            id="chatbot-close-btn"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="chatbot-messages" id="chatbot-messages">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`chatbot-message chatbot-message--${msg.sender}`}
                        >
                            {msg.sender === 'bot' && (
                                <div className="chatbot-msg-avatar">
                                    <img src="/HollywoodLogo.png" alt="Bot" style={{ width: '100%', height: 'auto', borderRadius: '50%' }} />
                                </div>
                            )}
                            <div className="chatbot-bubble-wrap">
                                <div className="chatbot-bubble">{msg.text}</div>
                                <span className="chatbot-time">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chatbot-message chatbot-message--bot">
                            <div className="chatbot-msg-avatar">
                                <img src="/HollywoodLogo.png" alt="Bot" style={{ width: '100%', height: 'auto', borderRadius: '50%' }} />
                            </div>
                            <div className="chatbot-bubble-wrap">
                                <div className="chatbot-bubble chatbot-typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chatbot-input-area">
                    <textarea
                        ref={inputRef}
                        className="chatbot-input"
                        placeholder={cfg.placeholder}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        id="chatbot-input"
                    />
                    <button
                        className="chatbot-send-btn"
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        aria-label="Send message"
                        id="chatbot-send-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
                <p className="chatbot-hint">{cfg.hint}</p>
            </div>
        </>
    );
};

export default ChatBot;
