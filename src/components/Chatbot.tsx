import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ui, defaultLang } from '../i18n/ui';

interface ChatbotProps {
  lang: keyof typeof ui;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isOptions?: boolean;
}

export default function Chatbot({ lang }: ChatbotProps) {
  // Local translation function for the client
  const t = (key: keyof typeof ui[typeof defaultLang]) => {
    return ui[lang][key] || ui[defaultLang][key];
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initial greeting when opened for the first time
    if (isOpen && messages.length === 0) {
      simulateBotTyping(() => {
        setMessages([
          {
            id: '1',
            sender: 'bot',
            text: t('chat.msg1'),
            isOptions: true,
          },
        ]);
        setStep(1);
      });
    }
  }, [isOpen]);

  const simulateBotTyping = (callback: () => void, duration = 1200) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, duration);
  };

  const handleOptionClick = (option: 'web' | 'sales' | 'social' | 'human') => {
    // Add user message
    const optionText = {
      web: t('chat.opt1'),
      sales: t('chat.opt2'),
      social: t('chat.opt3'),
      human: t('chat.opt4'),
    }[option];

    const newMessages = [...messages, { id: Date.now().toString(), sender: 'user' as const, text: optionText }];
    // Remove options flag from previous bot message
    if (newMessages.length > 0) {
      const firstMsg = newMessages[0];
      firstMsg.isOptions = false;
    }
    
    setMessages(newMessages);
    setStep(2);

    simulateBotTyping(() => {
      const replyKey = `chat.reply.${option}`;
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'bot', text: t(replyKey) },
      ]);
    });
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (step === 2) {
      if (!validateEmail(inputValue)) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'bot', text: t('chat.error.email') }]);
        return;
      }

      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: inputValue }]);
      setInputValue('');
      setStep(3);

      simulateBotTyping(() => {
        setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'bot', text: t('chat.reply.thanks') }]);
      });
    }
  };

  return (
    <div className="chatbot-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="chatbot-window"
          >
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">d</div>
                <div>
                  <h4>{t('chat.title')}</h4>
                  <span className="chatbot-status">
                    <span className="status-dot"></span>
                    {t('chat.status')}
                  </span>
                </div>
              </div>
              <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`chat-bubble ${msg.sender}`}
                  >
                    {msg.text}
                  </motion.div>

                  {msg.isOptions && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                      className="chat-options"
                    >
                      <button onClick={() => handleOptionClick('web')}>{t('chat.opt1')}</button>
                      <button onClick={() => handleOptionClick('sales')}>{t('chat.opt2')}</button>
                      <button onClick={() => handleOptionClick('social')}>{t('chat.opt3')}</button>
                      <button onClick={() => handleOptionClick('human')}>{t('chat.opt4')}</button>
                    </motion.div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="chat-message-row bot">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chat-bubble bot typing">
                    <span></span><span></span><span></span>
                  </motion.div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {step >= 2 && step < 3 && (
              <form onSubmit={handleFormSubmit} className="chatbot-input-area">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                />
                <button type="submit" disabled={!inputValue.trim() || isTyping}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            )}
            
            {step === 3 && (
              <div className="chatbot-footer">
                dimenfy AI
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="fab-status-dot"></span>
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.svg key="chat" initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 30 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </motion.svg>
          ) : (
            <motion.svg key="close" initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 30 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      <style>{`
        .chatbot-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
        }

        .chatbot-fab {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), #0044CC);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0, 102, 255, 0.4);
          position: relative;
        }

        .fab-status-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 14px;
          height: 14px;
          background: var(--color-accent);
          border: 3px solid #0A0A0F;
          border-radius: 50%;
        }

        .chatbot-window {
          width: 350px;
          height: 500px;
          max-height: calc(100vh - 120px);
          background: rgba(15, 15, 20, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chatbot-header {
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chatbot-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--color-surface);
          border: 1px solid rgba(0, 102, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--color-primary);
        }

        .chatbot-header h4 {
          margin: 0;
          font-size: 14px;
          font-family: var(--font-display);
        }

        .chatbot-status {
          font-size: 11px;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--color-accent);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px var(--color-accent);
        }

        .chatbot-close {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          display: flex;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .chatbot-close:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }

        .chatbot-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .chat-message-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .chat-message-row.user {
          align-items: flex-end;
        }

        .chat-bubble {
          max-width: 85%;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
        }

        .chat-bubble.bot {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text);
          border-radius: 16px 16px 16px 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .chat-bubble.user {
          background: var(--color-primary);
          color: white;
          border-radius: 16px 16px 4px 16px;
        }

        .chat-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          margin-top: 4px;
        }

        .chat-options button {
          background: rgba(0, 102, 255, 0.1);
          border: 1px solid rgba(0, 102, 255, 0.3);
          color: white;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chat-options button:hover {
          background: rgba(0, 102, 255, 0.2);
          border-color: rgba(0, 102, 255, 0.5);
          transform: translateX(4px);
        }

        .typing span {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--color-text-secondary);
          border-radius: 50%;
          margin: 0 2px;
          animation: typing 1.4s infinite both;
        }

        .typing span:nth-child(1) { animation-delay: 0s; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }

        .chatbot-input-area {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          gap: 12px;
        }

        .chatbot-input-area input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          border-radius: 20px;
          color: white;
          font-size: 14px;
        }
        
        .chatbot-input-area input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .chatbot-input-area button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chatbot-input-area button:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
        }

        .chatbot-footer {
          padding: 12px;
          text-align: center;
          font-size: 11px;
          color: var(--color-text-secondary);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 480px) {
          .chatbot-window {
            width: calc(100vw - 32px);
            bottom: 80px;
            right: 16px;
            position: absolute;
          }
        }
      `}</style>
    </div>
  );
}
