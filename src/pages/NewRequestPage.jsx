import { useState, useRef, useEffect } from 'react';
import { submitChatIntake, runWorkflow } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, PaperClipIcon, PaperAirplaneIcon, ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline';

const TypewriterText = ({ text, animate }) => {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      return;
    }
    
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(intervalId);
    }, 20);
    
    return () => clearInterval(intervalId);
  }, [text, animate]);

  return <span>{displayedText}</span>;
};

export default function NewRequestPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('Java Kafka');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sampleFiles, setSampleFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', text: "Hello! I'm your AI Architect. Tell me about the project you want to build." }
  ]);
  const chatEndRef = useRef(null);

  const languages = ['Java Kafka']; 

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSampleFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setSampleFiles(prev => prev.filter((_, i) => i !== index));
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!prompt.trim() && sampleFiles.length === 0) return;
    
    const userMsg = prompt.trim();
    const newMessages = [...messages, { role: 'user', text: userMsg, files: sampleFiles.map(f => f.name) }];
    setMessages(newMessages);
    setPrompt('');
    const filesToUpload = [...sampleFiles]; // Store before clearing
    setSampleFiles([]);
    setLoading(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('messages', JSON.stringify(newMessages));
      payload.append('language', language);
      
      filesToUpload.forEach(file => {
        payload.append('file_upload', file);
      });

      const res = await submitChatIntake(payload);

      if (res.status === 'more_info') {
        setMessages(prev => [...prev, { role: 'agent', text: res.question }]);
        setLoading(false);
      } else if (res.status === 'complete') {
        setMessages(prev => [...prev, { role: 'agent', text: "Perfect! I have enough information. I'm generating your blueprint now..." }]);
        
        const reqId = res.data.request_id;
        localStorage.setItem('lastGenerationRequestId', reqId);
        
        // Trigger workflow and redirect to blueprint
        // Set draft_mode to true so it stops at blueprint review
        await runWorkflow(reqId, true);
        navigate(`/blueprint?id=${reqId}`);
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-fade-in-up rounded-2xl">
      {/* Top Bar with Language Selector (Top Right) */}
      <div className="flex justify-end absolute top-2 right-4 z-10">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200 px-5 py-2.5 rounded-full shadow-sm hover:bg-slate-50 transition-all font-semibold text-sidebar text-sm"
          >
            {language}
            <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden py-1 z-20 animate-fade-in-up">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    language === lang ? 'bg-orange-50 text-primary-orange font-bold' : 'hover:bg-slate-50 text-sidebar font-medium'
                  }`}
                >
                  {lang}
                </button>
              ))}
              <div className="px-4 py-3 text-xs text-text-secondary italic border-t border-slate-100 mt-1">
                More languages coming soon...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Chat History */}
      <div className="flex-1 overflow-y-auto p-4 w-full pt-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-primary-orange text-white'}`}>
                  {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                </div>
                
                {/* Message Bubble */}
                <div className={`px-5 py-3 rounded-2xl text-sm shadow-sm flex flex-col ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-sidebar rounded-tl-sm'}`}>
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.files.map((fileName, fIdx) => (
                        <div key={fIdx} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${msg.role === 'user' ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-orange-50 text-primary-orange border-orange-100'}`}>
                          <PaperClipIcon className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">{fileName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span>
                    {msg.role === 'agent' ? <TypewriterText text={msg.text} animate={idx === messages.length - 1} /> : msg.text}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-orange text-white">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="w-full shrink-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-6 pb-4 px-4 flex justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/60 p-2 flex flex-col transition-all focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.12)] focus-within:border-primary-orange/30">
          
          {error && (
            <div className="px-4 pt-2">
              <p className="text-xs text-red-600 font-bold bg-red-50 py-1.5 px-3 rounded-lg border border-red-100">{error}</p>
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="e.g. I want to build a Java Kafka Streams app for a real-time fraud detection service using state stores..."
            className="w-full bg-transparent px-4 py-2 mt-2 min-h-[50px] max-h-[150px] resize-none outline-none text-sidebar placeholder:text-slate-400 font-medium text-sm"
          />
          
          {sampleFiles.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 items-center">
              {sampleFiles.map((file, index) => (
                <div key={index} className="inline-flex items-center gap-2 bg-orange-50 text-primary-orange text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-100">
                  <PaperClipIcon className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="ml-1 text-primary-orange hover:text-red-500 font-extrabold p-0.5 rounded-full hover:bg-orange-100 transition-colors">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center px-3 pb-2 pt-2 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-3">
              <label htmlFor="file-upload" className="cursor-pointer p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors text-text-secondary hover:text-primary-orange group relative">
                <PaperClipIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <input 
                  id="file-upload" 
                  type="file" 
                  className="sr-only" 
                  multiple
                  accept=".doc,.docx,.pdf,.ppt,.pptx,.json,.java,.avsc,.sql" 
                  onChange={handleFileChange}
                />
              </label>
              <span className="text-xs text-text-secondary hidden sm:inline-block">Supports: PDF, DOCX, PPTX, JSON, SQL, AVRO, JAVA</span>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading || (!prompt.trim() && sampleFiles.length === 0)}
              className="p-2.5 bg-primary-orange hover:bg-hover-orange disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full flex items-center justify-center transition-all shadow-sm group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
