import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const hardcodedPersonas = [
    { name: 'Rahul Ghosh', role: 'Developer', email: 'developer@example.com', password: 'password123', icon: 'RG', color: 'border-emerald-600 text-emerald-600 bg-emerald-50' },
    { name: 'Sanjib Sau', role: 'Solution Architect', email: 'architect@example.com', password: 'password123', icon: 'SS', color: 'border-blue-600 text-blue-600 bg-blue-50' },
    { name: 'Sneha Sen', role: 'Tech Lead', email: 'techlead@example.com', password: 'password123', icon: 'SS', color: 'border-purple-600 text-purple-600 bg-purple-50' },
    { name: 'Rakesh Singh', role: 'Platform / DevOps', email: 'devops@example.com', password: 'password123', icon: 'RS', color: 'border-amber-600 text-amber-600 bg-amber-50' }
  ];

  const [personas] = useState(hardcodedPersonas);

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
      navigate(result.dashboard || '/', { replace: true });
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light text-text-primary flex flex-col justify-center items-center font-sans py-12 px-4 relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      
      <div className="w-full max-w-md bg-gradient-to-br from-white to-input-bg rounded-2xl p-8 border border-border-light shadow-xl relative z-10 animate-fade-in-up">
        
        <div className="flex justify-center items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-orange to-button-orange flex items-center justify-center text-white font-bold text-2xl shadow-[0_4px_10px_rgba(255,90,20,0.3)] hover:shadow-[0_4px_15px_rgba(255,90,20,0.5)] transition-all">
            D
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-sidebar">
            Digicon<span className="text-primary-orange">FX</span>
          </span>
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
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 bg-input-bg border border-border-light rounded-lg text-text-primary focus:ring-1 focus:ring-primary-orange focus:border-border-orange outline-none transition-all tracking-widest placeholder:text-placeholder"
                placeholder="•••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-placeholder hover:text-text-secondary transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-button-orange hover:bg-hover-orange text-white p-3 rounded-lg font-bold transition-all shadow-md shadow-orange-500/20 mt-4 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : 'Sign In'}
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
                    <div className="text-[10px] text-text-secondary truncate">{p.role}</div>
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
