import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPersonas } from '../api/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    getPersonas().then(data => {
      if (data.success) {
        setPersonas(data.data);
      }
    }).catch(console.error);
  }, []);

  const handleCardClick = (persona) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light text-text-primary flex flex-col justify-center items-center font-sans py-12 px-4 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-border-light shadow-xl relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary-orange tracking-tight">Agent 22 Portal</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-input-bg border border-border-light rounded-lg text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all placeholder:text-placeholder"
              placeholder="manager@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-input-bg border border-border-light rounded-lg text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all tracking-widest placeholder:text-placeholder"
                placeholder="•••••••••••"
                required
              />
            </div>
          </div>
          
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-button-orange hover:bg-hover-orange text-white p-3 rounded-lg font-bold transition-all shadow-md shadow-orange-500/20 mt-4 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {personas.length > 0 && (
          <div className="mt-8 border-t border-border-light pt-6">
            <div className="flex items-center text-sm font-medium text-text-secondary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-primary-orange">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Quick Login Personas
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {personas.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleCardClick(p)}
                  className="flex items-center p-2 rounded-lg bg-white border border-border-light hover:border-border-orange hover:shadow-sm transition-all text-left"
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs mr-3 border ${p.color}`}>
                    {p.icon}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-text-primary truncate">{p.name}</div>
                    <div className="text-[10px] text-text-secondary truncate">{p.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
