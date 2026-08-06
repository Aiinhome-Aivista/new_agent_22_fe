import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { askAdvisor } from '../api/api';

export default function AdvisorChatPage() {
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I am your Architecture Advisor. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [reqId, setReqId] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await askAdvisor(sessionId, userMsg, reqId ? parseInt(reqId) : null);
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error answering your question.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Advisor Chat" />
      <div className="flex-1 flex flex-col p-8 max-w-4xl mx-auto w-full">
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Optional Context (Request ID):</label>
          <input 
            type="number" 
            value={reqId} 
            onChange={(e) => setReqId(e.target.value)} 
            placeholder="e.g. 1" 
            className="border border-border-light rounded px-3 py-1 text-sm outline-none focus:border-border-orange"
          />
        </div>
        
        <div className="flex-1 bg-white border border-border-light rounded-t shadow-sm p-4 overflow-y-auto flex flex-col gap-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg text-sm ${m.sender === 'user' ? 'bg-primary-orange text-white rounded-br-none shadow-sm' : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg text-sm bg-gray-50 text-gray-500 border border-gray-200 rounded-bl-none flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="bg-white border border-t-0 border-border-light rounded-b shadow-sm p-4 flex gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask about architecture or validation decisions..." 
            className="flex-1 border border-border-light rounded px-4 py-2 outline-none focus:border-border-orange focus:ring-1 focus:ring-border-orange bg-input-bg"
          />
          <button type="submit" disabled={loading} className="bg-sidebar hover:bg-gray-700 text-white px-6 py-2 rounded font-medium transition-colors disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
