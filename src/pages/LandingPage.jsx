import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-bg-light text-text-primary overflow-hidden relative font-sans flex flex-col">
      {/* Decorative Background Orbs */}
      <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-input-bg rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-primary-orange rounded-full mix-blend-multiply filter blur-[150px] opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-button-orange rounded-full mix-blend-multiply filter blur-[150px] opacity-5 animate-float" style={{ animationDelay: '4s' }}></div>
      
      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-5 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-lg border-b border-border-light/40 sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-orange to-button-orange flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_10px_rgba(255,90,20,0.3)] group-hover:shadow-[0_4px_15px_rgba(255,90,20,0.5)] transition-all">
            D
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-sidebar">
            Digicon<span className="text-primary-orange">FX</span>
          </span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={() => navigate('/login')} className="text-sm font-semibold text-text-secondary hover:text-primary-orange transition-colors hidden sm:block">
            Login
          </button>
          <button onClick={() => navigate('/login')} className="bg-primary-orange hover:bg-hover-orange text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all shadow-[0_4px_14px_0_rgba(255,90,20,0.39)] hover:shadow-[0_6px_20px_rgba(255,90,20,0.23)] hover:-translate-y-0.5">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto py-20 lg:py-28">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-orange/30 bg-input-bg text-sm font-semibold mb-10 animate-fade-in-up shadow-sm" style={{ animationDelay: '0.1s' }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-orange"></span>
          </span>
          <span className="text-primary-orange uppercase tracking-wider text-xs font-bold">Agent 22 is Live</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-fade-in-up text-sidebar leading-[1.1]" style={{ animationDelay: '0.2s' }}>
          Next-Gen <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-orange via-button-orange to-hover-orange">Kafka API</span> Generation
        </h1>
        
        <p className="text-lg md:text-xl text-text-secondary mb-12 max-w-3xl animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
          Empower your enterprise with Agentic AI. Generate production-ready, standardized event-driven microservices from requirements in minutes, not months. Experience the future of seamless integration.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 animate-fade-in-up w-full justify-center" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={() => navigate('/login')} 
            className="flex items-center justify-center gap-2 bg-primary-orange hover:bg-hover-orange text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-[0_10px_30px_-10px_rgba(255,90,20,0.6)]"
          >
            Start Building
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={() => window.open('https://www.pwc.com', '_blank')} 
            className="flex items-center justify-center gap-2 bg-white border-2 border-border-light hover:border-primary-orange hover:text-primary-orange text-text-primary px-8 py-4 rounded-xl font-bold text-lg transition-all"
          >
            Learn More
          </button>
        </div>

        {/* Feature Highlights inside Hero */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 w-full animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-light/50 hover:border-border-orange/50 hover:shadow-[0_8px_30px_rgba(255,90,20,0.08)] transition-all hover:-translate-y-1 group text-left">
            <div className="w-14 h-14 rounded-2xl bg-input-bg flex items-center justify-center mb-6 text-primary-orange group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-sidebar mb-3">AI Orchestration</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Intelligently maps business requirements to optimized Kafka topics and detailed schema definitions.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-light/50 hover:border-border-orange/50 hover:shadow-[0_8px_30px_rgba(255,90,20,0.08)] transition-all hover:-translate-y-1 group text-left">
            <div className="w-14 h-14 rounded-2xl bg-input-bg flex items-center justify-center mb-6 text-primary-orange group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-sidebar mb-3">RAG Pattern Matching</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Ensures strict alignment with enterprise architecture standards, policies, and best practices.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-light/50 hover:border-border-orange/50 hover:shadow-[0_8px_30px_rgba(255,90,20,0.08)] transition-all hover:-translate-y-1 group text-left">
            <div className="w-14 h-14 rounded-2xl bg-input-bg flex items-center justify-center mb-6 text-primary-orange group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.965 11.965 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-sidebar mb-3">Automated Validation</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Continuous deep validation of schema registry compatibility and generated event payloads.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white relative z-10 w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-sidebar mb-4">How Agent 22 Works</h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg">From natural language requirements to production-ready Kafka APIs in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border-light z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-input-bg border-4 border-white shadow-lg flex items-center justify-center mb-6 text-primary-orange group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-sidebar mb-3">1. Provide Requirements</h3>
              <p className="text-text-secondary text-sm">Input your business logic, event payloads, and data streams in natural language or structured formats.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-primary-orange border-4 border-white shadow-[0_10px_30px_rgba(255,90,20,0.4)] flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.428-1.428L13.5 18.75l1.178-.394a2.25 2.25 0 001.428-1.428l.394-1.183.394 1.183a2.25 2.25 0 001.428 1.428l1.178.394-1.178.394a2.25 2.25 0 00-1.428 1.428z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-sidebar mb-3">2. AI Orchestration</h3>
              <p className="text-text-secondary text-sm">Agent 22 analyzes the requirements, maps them to enterprise standards, and generates optimized Kafka topics and code.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-input-bg border-4 border-white shadow-lg flex items-center justify-center mb-6 text-primary-orange group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.452.15.099 0 00-.063-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-sidebar mb-3">3. Deploy & Monitor</h3>
              <p className="text-text-secondary text-sm">Instantly deploy standard-compliant APIs to your cluster. Monitor events, schemas, and throughput in real-time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition / Metrics Section */}
      <div className="py-24 bg-input-bg relative z-10 w-full border-y border-border-orange/20 overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/60 to-transparent"></div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-sidebar mb-6 leading-tight">
                Accelerate your <span className="text-primary-orange">Event-Driven</span> Architecture
              </h2>
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                Building and maintaining Kafka APIs at an enterprise scale can be bottlenecked by manual schema creation, boilerplate coding, and strict compliance checks. DigiconFX Agent 22 removes these barriers entirely.
              </p>
              <ul className="space-y-5 mb-8">
                {[
                  '10x faster API delivery cycle',
                  '100% compliance with corporate data standards',
                  'Automated Schema Registry (Avro/Protobuf) integration',
                  'Built-in RAG pattern validation for optimal streaming'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-orange/10 flex items-center justify-center text-primary-orange">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sidebar font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-orange to-button-orange rounded-3xl transform rotate-3 opacity-20 blur-xl"></div>
              <div className="bg-white rounded-3xl p-8 border border-border-light shadow-2xl relative z-10 hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-light/50">
                  <div>
                    <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Time to Production</h4>
                    <p className="text-3xl font-extrabold text-sidebar mt-1">90% Reduction</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center text-primary-orange">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-semibold text-sidebar">Traditional Method</span>
                      <span className="text-text-secondary">Weeks</span>
                    </div>
                    <div className="w-full bg-border-light rounded-full h-3">
                      <div className="bg-sidebar h-3 rounded-full w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-semibold text-primary-orange">Agent 22 AI</span>
                      <span className="text-primary-orange font-bold">Minutes</span>
                    </div>
                    <div className="w-full bg-border-light rounded-full h-3">
                      <div className="bg-gradient-to-r from-primary-orange to-button-orange h-3 rounded-full w-[10%] relative">
                         <div className="absolute top-0 right-0 bottom-0 left-0 animate-pulse bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 relative z-10 w-full bg-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-sidebar mb-6">Ready to transform your APIs?</h2>
          <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">Join the top enterprises using DigiconFX to automate and standardize their streaming data infrastructure.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="bg-primary-orange hover:bg-hover-orange text-white px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:-translate-y-1 shadow-[0_10px_30px_-10px_rgba(255,90,20,0.6)]"
          >
            Create Your First API Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-bg-light border-t border-border-light/50 pt-16 pb-8 w-full z-10 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-8 md:mb-0 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-orange to-button-orange flex items-center justify-center text-white font-bold text-xl shadow-md">
              D
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-sidebar">
              Digicon<span className="text-primary-orange">FX</span>
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-semibold text-text-secondary">
            <a href="#" className="hover:text-primary-orange transition-colors">Platform</a>
            <a href="#" className="hover:text-primary-orange transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary-orange transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-orange transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-orange transition-colors">Contact</a>
          </div>
        </div>
        <div className="text-center text-sm text-placeholder mt-12 pt-8 border-t border-border-light/30 max-w-6xl mx-auto">
          &copy; {new Date().getFullYear()} DigiconFX. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
