import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { MessageCircle, X, Send, RotateCcw, Minus, ShoppingBag, Mic, Bot } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ─── Stable session ID per page-load ─────────────────────────────────────────
function getSessionId() {
  let id = sessionStorage.getItem('tm_chat_session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now();
    sessionStorage.setItem('tm_chat_session', id);
  }
  return id;
}

// ─── Suggestion chips shown on open ───────────────────────────────────────────
const INITIAL_SUGGESTIONS = [
  'Show me trending sneakers',
  'What\'s under ₹3000?',
  'What are your top running shoes?',
  'Compare Nike vs Adidas',
];

// ─── Color helper for product cards ──────────────────────────────────────────
const COLOR_MAP = {
  black: '#1a1a1a', white: '#e5e7eb', blue: '#3b82f6', navy: '#1e3a5f',
  red: '#ef4444', green: '#10b981', grey: '#9ca3af', gray: '#9ca3af',
  silver: '#c0c0c0', brown: '#92400e', purple: '#8b5cf6', maroon: '#7f1d1d',
  yellow: '#f59e0b', orange: '#f97316', pink: '#ec4899',
};

// ─── Chat Product Card ────────────────────────────────────────────────────────
function ChatProductCard({ product, onAddToCart, onNavigate }) {
  const colors = Array.isArray(product.colors) ? product.colors : [];

  return (
    <div
      className="chat-product-card"
      style={{ cursor: 'pointer' }}
      onClick={() => onNavigate(product)}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="chat-product-img"
        onError={(e) => {
          e.target.src = `https://placehold.co/200x200/F3F4F6/6B7280?text=${encodeURIComponent(product.name?.slice(0, 10) || 'Product')}`;
        }}
      />
      <div className="chat-product-brand">{product.brand}</div>
      <div className="chat-product-name">{product.name}</div>
      <div className="chat-product-price">₹{product.price?.toLocaleString('en-IN')}</div>

      {colors.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
          {colors.slice(0, 5).map((c) => (
            <span
              key={c}
              title={c}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: COLOR_MAP[c.toLowerCase()] || c,
                border: '1px solid #e5e7eb',
                display: 'inline-block',
              }}
            />
          ))}
        </div>
      )}

      <button
        className="btn"
        style={{ width: '100%', padding: '6px', fontSize: '0.78rem' }}
        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
      >
        <ShoppingBag size={12} style={{ display: 'inline', marginRight: 4 }} />
        Add to Cart
      </button>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onAddToCart, onSuggestionClick, onNavigate }) {
  const isUser = msg.role === 'user';

  if (msg.role === 'system-suggestions') {
    return (
      <div className="chat-suggestions">
        {msg.suggestions.map((s) => (
          <button key={s} className="suggestion-chip" onClick={() => onSuggestionClick(s)}>
            {s}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`message-group ${isUser ? 'user' : 'ai'}`}>
      <div className={`msg-bubble ${isUser ? 'user' : 'ai'}`}>
        {msg.text}
      </div>

      {/* Product carousel — rendered after AI message */}
      {!isUser && msg.products && msg.products.length > 0 && (
        <div className="chat-products-carousel">
          {msg.products.map((p) => (
            <ChatProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      <div className="msg-time">{msg.time}</div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="message-group ai">
      <div className="msg-bubble ai" style={{ padding: '12px 16px' }}>
        <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', height: '16px' }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)',
                animation: `bounce 1.2s infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

// ─── Main ChatWidget ──────────────────────────────────────────────────────────
export default function ChatWidget({ initialMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(getSessionId);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // ── Send message ──
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || inputVal).trim();
    if (!trimmed || isTyping) return;
    setInputVal('');

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev.filter((m) => m.role !== 'system-suggestions'),
      { role: 'user', text: trimmed, time: now },
    ]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });
      const data = await res.json();

      // If AI added something to the server-side cart, sync to client cart
      if (data.cartUpdate?.action === 'add' && data.products?.length > 0) {
        const p = data.products[0];
        if (p) {
          addToCart(
            {
              id: p.id,
              name: p.name,
              price: p.price,
              imageUrl: p.imageUrl,
              brand: p.brand,
              slug: p.slug,
            },
            p.sizes?.[0] || 'one-size'
          );
        }
      }

      const replyText = data.reply || "I couldn't process that. Please try again.";
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: replyText,
          time: replyTime,
          products: data.products || [],
        },
      ]);
      
      // Auto-speak the AI reply
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(replyText);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: "Sorry, I'm having trouble connecting. Please try again in a moment!",
          time: errTime,
          products: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [inputVal, isTyping, sessionId, addToCart]);

  // ── Auto-scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Speech Recognition ──
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        sendMessage(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [sendMessage]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // ── Open with initial message from ProductGrid "Ask AI" button ──
  useEffect(() => {
    if (initialMessage && !isOpen) {
      setIsOpen(true);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (initialMessage && isOpen) {
      sendMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  // ── Focus input when opened ──
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages([
          {
            role: 'ai',
            text: "Hi! I'm your Tokyo Mart AI assistant. How can I help you find the perfect gear today? 🏃",
            time: now,
            products: [],
          },
          {
            role: 'system-suggestions',
            suggestions: INITIAL_SUGGESTIONS,
          },
        ]);
      }
    }
  }, [isOpen]);

  // ── Add product to cart from chat ──
  const handleAddToCart = useCallback((product) => {
    const size = product.sizes?.[0] || 'one-size';
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        brand: product.brand,
        slug: product.slug,
      },
      size
    );
    sendMessage(`Add ${product.name} to my cart`);
  }, [addToCart, sendMessage]);

  // ── Navigate to product page from chat ──
  const handleNavigate = useCallback((product) => {
    navigate(`/product/${product.slug || product.id}`);
  }, [navigate]);

  // ── Reset chat ──
  const handleReset = async () => {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      await fetch(`${API_URL}/api/chat/reset/${sessionId}`, { method: 'POST' });
    } catch (_) { /* ignore */ }
    setMessages([]);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        role: 'ai',
        text: "Chat cleared! How can I help you today? 😊",
        time: now,
        products: [],
      },
      { role: 'system-suggestions', suggestions: INITIAL_SUGGESTIONS },
    ]);
  };

  // ── Key handler ──
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Bounce animation keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes pulseMic {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .chat-panel { animation: slideUp 0.25s ease; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .bot-trigger-btn { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div className="bot-floating-widget">
        {/* ── Chat Panel ──────────────────────────────────────────────── */}
        {isOpen && (
          <div className="chat-panel">
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white'
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div className="chat-header-name">Tokyo Mart AI</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                    {isListening ? 'Listening...' : 'Online · Powered by Gemini'}
                  </div>
                </div>
              </div>
              <div className="chat-header-actions" style={{ display: 'flex', gap: '4px' }}>
                <button title="Clear chat" onClick={handleReset}>
                  <RotateCcw size={16} />
                </button>
                <button title="Minimize" onClick={() => setIsOpen(false)}>
                  <Minus size={16} />
                </button>
                <button title="Close" onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  onAddToCart={handleAddToCart}
                  onSuggestionClick={sendMessage}
                  onNavigate={handleNavigate}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chat-input-wrap">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder={isListening ? "Listening..." : "Ask about products, sizes, shipping..."}
                rows={1}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ maxHeight: '80px', overflowY: 'auto', resize: 'none', lineHeight: '1.4' }}
              />
              <div className="chat-input-actions">
                <button
                  className="icon-btn"
                  onClick={toggleListen}
                  title={isListening ? "Stop listening" : "Voice input"}
                  style={{ color: isListening ? 'var(--red)' : 'var(--accent)', animation: isListening ? 'pulseMic 1.5s infinite' : 'none' }}
                >
                  <Mic size={18} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => sendMessage()}
                  disabled={!inputVal.trim() || isTyping}
                  style={{ opacity: (!inputVal.trim() || isTyping) ? 0.4 : 1 }}
                  title="Send"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Trigger Button ────────────────────────────────────────────── */}
        <button
          className="bot-trigger-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          id="chat-widget-trigger"
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
          {!isOpen && <span>Ask AI Assistant</span>}
        </button>
      </div>
    </>
  );
}
