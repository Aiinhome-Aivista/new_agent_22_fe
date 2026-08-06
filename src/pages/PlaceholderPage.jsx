import { useLocation } from 'react-router-dom';

export default function PlaceholderPage() {
  const location = useLocation();
  
  // Create a readable title from the path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const title = pathParts.length > 0 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1)
    : "Module";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
        <div className="w-24 h-24 bg-orange-100 text-primary-orange rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.827M15.75 15.75L12 12m0 0l-3.75 3.75M12 12L8.25 8.25" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 3h1.5a2.25 2.25 0 0 1 2.25 2.25v2.25a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25V5.25A2.25 2.25 0 0 1 11.25 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v9" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">{title} Module</h2>
        <p className="text-text-secondary max-w-md text-lg">
          This enterprise module is currently under development in the Agent 22 platform. 
          Please check back later!
        </p>
      </div>
    </div>
  );
}
