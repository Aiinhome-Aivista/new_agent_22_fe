import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const personas = [
  {
    id: 'architect',
    name: 'Jane Doe',
    role: 'Enterprise Architect',
    description: 'Review blueprints and approve generated architecture designs.',
    icon: '🏗️',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'developer',
    name: 'John Smith',
    role: 'Kafka Developer',
    description: 'Define source/target topics and trigger AI generation.',
    icon: '💻',
    color: 'from-primary-orange to-orange-400'
  },
  {
    id: 'ba',
    name: 'Alice Johnson',
    role: 'Business Analyst',
    description: 'Provide natural language schema requirements for transformations.',
    icon: '📊',
    color: 'from-purple-500 to-pink-400'
  }
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (persona) => {
    login(persona);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col justify-center items-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      <div className="z-10 text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Select Your Persona</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          For this demo, please select a role to access the Agent 22 DigiconFX workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-8 z-10">
        {personas.map((persona, index) => (
          <button
            key={persona.id}
            onClick={() => handleLogin(persona)}
            className="group text-left bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all transform hover:-translate-y-1 animate-fade-in-up relative overflow-hidden"
            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${persona.color}`}></div>
            <div className="text-4xl mb-6">{persona.icon}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{persona.name}</h2>
            <div className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${persona.color} mb-4 inline-block`}>
              {persona.role}
            </div>
            <p className="text-sm text-gray-500 line-clamp-3">
              {persona.description}
            </p>
            <div className="mt-8 flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors">
              Sign In <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="absolute bottom-8 text-xs text-gray-400 font-medium z-10">
        PwC Enterprise Internal Demo Use Only
      </div>
    </div>
  );
}
