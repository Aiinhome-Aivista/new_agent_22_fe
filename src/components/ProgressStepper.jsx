import { useLocation } from 'react-router-dom';

const steps = [
  { path: 'patterns', label: 'Intake' },
  { path: 'blueprint', label: 'Blueprint' },
  { path: 'generation', label: 'Generation' },
  { path: 'validation', label: 'Validation' },
  { path: 'package', label: 'Packages' },
  { path: 'review', label: 'Review' }
];

export default function ProgressStepper() {
  const location = useLocation();
  
  // Ex: /requests/123/patterns
  const currentPath = location.pathname.split('/').pop();
  
  const currentIndex = steps.findIndex(s => s.path === currentPath);
  
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-border-light">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isPending = idx > currentIndex;
        
        return (
          <div key={step.path} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${isCompleted ? 'bg-green-500 text-white' : ''}
              ${isCurrent ? 'bg-primary-orange text-white' : ''}
              ${isPending ? 'bg-gray-200 text-gray-500' : ''}
            `}>
              {idx + 1}
            </div>
            <span className={`text-sm ${isCurrent ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-px mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
