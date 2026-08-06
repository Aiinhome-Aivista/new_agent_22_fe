import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative font-sans flex flex-col justify-center">
      {/* Decorative Orbs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary-orange rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      
      {/* Navbar */}
      <div className="absolute top-0 w-full p-8 flex justify-between items-center z-10">
        <div className="text-2xl font-bold tracking-widest text-primary-orange">
          DigiconFX
        </div>
        <div>
          <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-primary-orange transition-colors">
            Login
          </button>
        </div>
      </div>

      <div className="z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm text-sm font-medium mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-primary-orange">Agent 22</span> is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-orange to-orange-400">Kafka API</span> Generation
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Empower your enterprise with Agentic AI. Generate production-ready, standardized event-driven microservices from requirements in minutes, not months.
        </p>
        
        <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={() => navigate('/login')} 
            className="bg-primary-orange hover:bg-hover-orange text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,90,20,0.4)]"
          >
            Access Dashboard
          </button>
          <button 
            onClick={() => window.open('https://www.pwc.com', '_blank')} 
            className="bg-transparent border border-gray-600 hover:border-gray-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
      
      {/* Features showcase */}
      <div className="absolute bottom-10 w-full flex justify-center gap-12 text-sm font-medium text-gray-500 z-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div> AI Orchestration
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div> RAG Pattern Matching
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div> Automated Validation
        </div>
      </div>
    </div>
  );
}
