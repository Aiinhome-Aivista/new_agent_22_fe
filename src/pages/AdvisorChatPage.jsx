import { useState, useRef, useEffect } from 'react';
import { askAdvisor, getRequests, getChatHistory } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';

const formatMessage = (text) => {
  if (!text) return null;
  
  const blocks = text.split(/(```[\s\S]*?```)/g);
  
  return blocks.map((block, index) => {
    if (block.startsWith('```') && block.endsWith('```')) {
      const lines = block.split('\n');
      const lang = lines[0].replace('```', '').trim();
      const code = lines.slice(1, -1).join('\n');
      return (
        <div key={index} className="my-3 rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-sm">
          {lang && (
            <div className="bg-[#2d2d2d] px-3 py-1 text-xs font-mono text-gray-400 border-b border-gray-700 uppercase tracking-wider">
              {lang}
            </div>
          )}
          <pre className="p-3 overflow-x-auto text-[13px] font-mono text-gray-300 leading-relaxed whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      );
    } else {
      return (
        <span key={index}>
          {block.split('\n').map((line, i, arr) => {
            const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
            return (
              <span key={i}>
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                  }
                  if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
                    return <code key={j} className="px-1.5 py-0.5 mx-0.5 bg-orange-50 text-button-orange rounded font-mono text-[13px] border border-orange-100">{part.slice(1, -1)}</code>;
                  }
                  return <span key={j}>{part}</span>;
                })}
                {i < arr.length - 1 && <br />}
              </span>
            );
          })}
        </span>
      );
    }
  });
};

export default function AdvisorChatPage() {
  const { user } = useAuth();
  const { currentTrack, currentProject } = useProject();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [reqId, setReqId] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSelectedLabel = () => {
    if (!reqId) return "Global Context (All Projects)";
    const req = requests.find(r => r.id.toString() === reqId.toString());
    if (req) {
      const shortName = req.request_name.length > 25 ? req.request_name.substring(0, 25) + '...' : req.request_name;
      return `${req.id} - ${shortName} (${req.status})`;
    }
    return "Global Context (All Projects)";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    getRequests().then(res => {
      if (res.success) {
        let reqs = res.data || [];
        if (currentTrack) {
          reqs = reqs.filter(r => 
            r.track_id === currentTrack.id || 
            r.track_name === currentTrack.track_name ||
            (currentTrack.track_name && r.request_name && r.request_name.toLowerCase().includes(currentTrack.track_name.toLowerCase()))
          );
        }
        setRequests(reqs);
      }
    }).catch(err => console.error(err));
  }, [currentTrack]);

  useEffect(() => {
    const fetchHistory = async (sid) => {
      try {
        const res = await getChatHistory(sid);
        if (res.success && res.data) {
          const loadedMessages = [];
          res.data.forEach(item => {
            loadedMessages.push({ sender: 'user', text: item.question });
            loadedMessages.push({ sender: 'ai', text: item.answer });
          });
          setMessages(loadedMessages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    };

    // Create a deterministic session ID based on user and request!
    // This ensures history persists across logouts, page reloads, and even different computers.
    const userIdentifier = user?.email || user?.session_id || 'guest';
    const existingSession = `chat_${userIdentifier}_req_${reqId || 'global'}`;
    
    setSessionId(existingSession);
    fetchHistory(existingSession);
  }, [reqId, user]);

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
    <div className="flex flex-col h-full relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      <div className="flex-1 flex flex-col py-2 max-w-6xl mx-auto w-full relative z-10">
        
        {/* Unified Chat Container */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-8 py-5 border-b border-gray-100 relative z-20 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-orange to-button-orange text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316v.192m6 3a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25m6-3a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Architecture Advisor</h2>
                <p className="text-sm text-text-secondary font-medium">AI Context & Rules Enforcer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 sm:mt-0 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <label className="text-sm font-semibold text-gray-600">Context:</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-72 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none hover:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 transition-all shadow-sm flex items-center justify-between text-gray-700 font-medium"
                >
                  <span className="truncate">{getSelectedLabel()}</span>
                  <svg className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full mt-1 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                    <button
                      onClick={() => { setReqId(''); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!reqId ? 'bg-orange-50 text-primary-orange font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      Global Context (All Projects)
                    </button>
                    
                    {requests.length > 0 && (
                      <>
                        <div className="px-4 py-1.5 bg-gray-50 border-y border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Specific Projects
                        </div>
                        {requests.map(req => {
                          const isSelected = reqId.toString() === req.id.toString();
                          return (
                            <button
                              key={req.id}
                              onClick={() => { setReqId(req.id.toString()); setIsDropdownOpen(false); }}
                              title={req.request_name}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${isSelected ? 'bg-orange-50 text-primary-orange font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-orange'}`}
                            >
                              <span className={`shrink-0 font-mono ${isSelected ? 'text-primary-orange/70' : 'text-gray-400'}`}>#{req.id}</span>
                              <span className="truncate flex-1">{req.request_name}</span>
                              <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${isSelected ? 'bg-primary-orange/10 text-primary-orange' : 'bg-gray-100 text-gray-500'}`}>{req.status}</span>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Body */}
          <div className="flex-1 bg-[#F9FAFB] p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 relative">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                
                {m.sender === 'ai' && (
                  <div className="w-10 h-10 rounded-xl bg-sidebar flex-shrink-0 flex items-center justify-center mr-4 mt-1 shadow-md shadow-gray-400/20">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                )}

                <div className={`max-w-[80%] p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    m.sender === 'user' 
                    ? 'bg-gradient-to-br from-primary-orange to-button-orange text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                  }`}>
                  {m.sender === 'ai' ? formatMessage(m.text) : m.text}
                </div>

              </div>
            ))}

            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full animate-fade-in">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-gray-200/50 mb-6 border border-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-primary-orange">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">How can I help you today?</h3>
                <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                  I am the Architecture Advisor powered by Mistral & RAG. <br/>
                  I automatically adapt to your persona (Developer, Architect, etc.) and can analyze Blueprints and System Contexts if you provide a Request ID.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex justify-start w-full animate-fade-in-up">
                <div className="w-10 h-10 rounded-xl bg-sidebar flex-shrink-0 flex items-center justify-center mr-4 mt-1 shadow-md shadow-gray-400/20">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                </div>
                <div className="max-w-[75%] p-5 rounded-2xl bg-white border border-gray-100 rounded-tl-sm flex items-center gap-2 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-primary-orange rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-primary-orange rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2.5 h-2.5 bg-primary-orange rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <form onSubmit={handleSend} className="bg-white border-t border-gray-100 px-6 py-5 flex gap-4 relative z-20">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask about architecture, validation, or design..." 
              className="flex-1 border-2 border-gray-100 rounded-2xl px-6 py-4 text-base outline-none focus:border-primary-orange focus:ring-4 focus:ring-primary-orange/10 bg-gray-50/50 transition-all placeholder:text-gray-400"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="bg-primary-orange hover:bg-hover-orange text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:hover:bg-primary-orange flex items-center gap-3 shadow-lg shadow-orange-500/25"
            >
              <span className="text-base">Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
