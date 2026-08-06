import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { askAdvisor } from '../api/api';

export default function AdvisorChatPage() {
  const [messages, setMessages] = useState([]);
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
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error answering your question.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-bg-light relative">
      <Navbar title="Advisor Chat" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full relative z-10">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 text-primary-orange rounded-full flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316v.192m6 3a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25m6-3a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Architecture Advisor</h2>
              <p className="text-xs text-text-secondary">AI Assistant Context & Rules Enforcer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <label className="text-sm font-medium text-gray-700">Link Request ID:</label>
            <input 
              type="number" 
              value={reqId} 
              onChange={(e) => setReqId(e.target.value)} 
              placeholder="e.g. 1" 
              className="w-24 border border-border-light bg-input-bg rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary-orange focus:border-border-orange transition-all placeholder:text-placeholder shadow-inner"
            />
          </div>
        </div>
        
        <div className="flex-1 bg-white border border-border-light rounded-t-2xl shadow-lg p-6 overflow-y-auto flex flex-col gap-6 relative">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-sidebar flex-shrink-0 flex items-center justify-center mr-3 mt-1 shadow-md">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
              )}

              <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user' 
                  ? 'bg-gradient-to-br from-primary-orange to-button-orange text-white rounded-br-sm' 
                  : 'bg-gray-50 text-gray-800 border border-border-light rounded-bl-sm'
                }`}>
                {m.text}
              </div>

            </div>
          ))}
          {loading && (
            <div className="flex justify-start w-full">
              <div className="w-8 h-8 rounded-full bg-sidebar flex-shrink-0 flex items-center justify-center mr-3 mt-1 shadow-md">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
              </div>
              <div className="max-w-[75%] p-4 rounded-2xl text-sm bg-gray-50 text-gray-500 border border-border-light rounded-bl-sm flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-primary-orange rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-orange rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-primary-orange rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="bg-white border border-t-0 border-border-light rounded-b-2xl shadow-lg p-4 flex gap-3 relative z-10">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type your question about architecture, validation, or design..." 
            className="flex-1 border border-border-light rounded-xl px-5 py-3 outline-none focus:border-border-orange focus:ring-2 focus:ring-orange-500/20 bg-input-bg transition-all placeholder:text-placeholder shadow-inner"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="bg-sidebar hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-gray-500/20"
          >
            <span>Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
