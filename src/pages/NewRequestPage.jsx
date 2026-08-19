import { useState, useRef, useEffect } from 'react';
import { submitChatIntake, runWorkflow, getRequest } from '../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import { SparklesIcon, PaperClipIcon, PaperAirplaneIcon, ChevronDownIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';

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
  const { id } = useParams();
  const [isReadOnly, setIsReadOnly] = useState(!!id);
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
  const textareaRef = useRef(null);

  const languages = ['Java Kafka']; 

  useEffect(() => {
    if (id) {
      setIsReadOnly(true);
      setLoading(true);
      getRequest(id).then(res => {
        const req = res.data?.request;
        const spec = res.data?.spec;
        if (req) {
           let loadedMessages = null;
           if (spec?.schema_hints) {
             try {
               const parsed = JSON.parse(spec.schema_hints);
               if (Array.isArray(parsed) && parsed.length > 0) {
                 loadedMessages = parsed;
               }
             } catch (e) {
               // Not JSON, fallback to string format below
             }
           }

           if (loadedMessages) {
             // Ensure the final agent message is displayed in history
             const lastMsg = loadedMessages[loadedMessages.length - 1];
             if (lastMsg && (lastMsg.role !== 'agent' || !lastMsg.text.includes("Perfect!"))) {
               loadedMessages.push({ role: 'agent', text: "Perfect! I have enough information. I'm generating your blueprint now..." });
             }
             setMessages(loadedMessages);
           } else {
             const promptText = spec?.schema_hints && spec.schema_hints !== 'Conversational Intake' 
               ? spec.schema_hints 
               : `I need to build a microservice named "${req.request_name}" with application ID "${req.application_id}". Source topics: ${spec?.source_topics || 'None'}, Target topics: ${spec?.target_topics || 'None'}.`;
             
             setMessages([
               { role: 'agent', text: "Hello! I'm your AI Architect. Tell me about the project you want to build." },
               { role: 'user', text: promptText },
               { role: 'agent', text: `Perfect! I have enough information. I generated the blueprint for ${req.request_name}.` }
             ]);
           }
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
        setError("Failed to load chat history for this request.");
      });
    } else {
      setIsReadOnly(false);
      setMessages([
        { role: 'agent', text: "Hello! I'm your AI Architect. Tell me about the project you want to build." }
      ]);
      setPrompt('');
      setSampleFiles([]);
      setError('');
    }
  }, [id]);

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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
    }
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


      {/* Main Content Area: Chat History */}
      <div className="flex-1 overflow-y-auto p-4 w-full pt-1">
        <div className="max-w-6xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] items-end ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-primary-orange text-white'}`}>
                  {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                </div>
                
                {/* Message Bubble */}
                <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm flex flex-col ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm' 
                    : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-bl-sm'
                }`}>
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.files.map((fileName, fIdx) => (
                        <div key={fIdx} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                          msg.role === 'user' 
                            ? 'bg-blue-600/50 border-blue-400/30 text-blue-50' 
                            : 'bg-orange-50 text-primary-orange border-orange-100'
                        }`}>
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
              <div className="flex gap-3 max-w-[85%] flex-row items-end">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-orange text-white shadow-sm">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm flex items-center gap-1.5">
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
      {isReadOnly ? (
        <div className="w-full shrink-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-6 pb-6 px-4 flex justify-center relative">
          <div className="w-full max-w-6xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-200 rounded-[28px] p-5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium text-[15px]">
                This chat session is closed. 
                <button onClick={() => navigate(`/requests/${id}/blueprint`)} className="text-primary-orange hover:text-orange-600 font-bold ml-2 transition-colors">
                  View Approved Blueprint &rarr;
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full shrink-0 bg-gradient-to-t from-[#e2efff]/50 via-[#e2efff]/30 to-transparent pt-6 pb-6 px-4 flex flex-col items-center relative">
          
          {/* Sample Files display outside the pill */}
          {sampleFiles.length > 0 && (
            <div className="w-full max-w-4xl px-4 pb-3 flex flex-wrap gap-2 items-center justify-center">
              {sampleFiles.map((file, index) => (
                <div key={index} className="inline-flex items-center gap-2 bg-white text-slate-700 text-xs font-bold px-3 py-2 rounded-xl shadow-sm border border-slate-200">
                  <PaperClipIcon className="w-4 h-4 text-slate-500" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="w-full max-w-4xl px-4 pb-3">
              <p className="text-sm text-red-600 font-medium bg-red-50 py-2 px-4 rounded-xl border border-red-100 flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </p>
            </div>
          )}

          <div className="w-full max-w-6xl bg-white shadow-[0_2px_15px_rgba(0,0,0,0.06)] border border-slate-200 rounded-[32px] py-1.5 px-2 flex items-center transition-all focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.1)] focus-within:border-primary-orange focus-within:ring-4 focus-within:ring-primary-orange/20 mb-2">
            
            {/* Left: Plus icon for file upload */}
            <label htmlFor="file-upload" className="cursor-pointer p-3 text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors shrink-0 ml-1">
              <PlusIcon className="w-6 h-6" strokeWidth={1.5} />
              <input 
                id="file-upload" 
                type="file" 
                className="sr-only" 
                multiple
                accept=".doc,.docx,.pdf,.ppt,.pptx,.json,.java,.avsc,.sql" 
                onChange={handleFileChange}
              />
            </label>

            <div className="flex-1 px-3 py-3.5">
              <textarea
                ref={textareaRef}
                value={prompt}
                readOnly={loading}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading) handleSubmit();
                  }
                }}
                placeholder="Message AI Architect to build a Java Kafka Streams application..."
                rows={1}
                className={`w-full bg-transparent min-h-[24px] max-h-[200px] resize-none outline-none text-slate-800 placeholder:text-slate-350 font-medium text-[14px] leading-relaxed overflow-y-auto ${loading ? 'cursor-default caret-transparent pointer-events-none' : ''}`}
              />
            </div>

            {/* Right: Dropdown & Send/Mic */}
            <div className="flex items-center gap-1 shrink-0 mr-1">
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 font-medium text-[14px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {language === 'Java Kafka' ? 'Java' : language}
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden py-1 z-20 animate-fade-in-up">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          language === lang ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={loading || (!prompt.trim() && sampleFiles.length === 0)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${prompt.trim() || sampleFiles.length > 0 ? 'bg-black text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className={prompt.trim() || sampleFiles.length > 0 ? 'text-white' : 'text-slate-400'}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium mt-1">Supports: PDF, DOCX, PPTX, JSON, SQL, JAVA</span>
        </div>
      )}
    </div>
  );
}
