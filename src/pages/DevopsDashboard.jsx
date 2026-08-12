import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardMetrics } from '../api/api';
import Loader from '../components/Loader';
import { ArchiveBoxIcon, RocketLaunchIcon, GlobeAltIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function DevopsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDashboardMetrics('devops').then(res => {
      if (res.success) setMetrics(res.data);
    }).catch(console.error);
  }, []);

  if (!metrics) return <Loader />;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Platform DevOps Portal</h1>
        <p className="text-text-secondary mt-1">Inspect packaging and deployment configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/packages')}
          className="bg-gradient-to-br from-primary-orange to-button-orange p-6 rounded-2xl shadow-[0_8px_30px_rgba(255,90,20,0.2)] text-white flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,90,20,0.3)] cursor-pointer"
        >
          <div>
            <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">Package History</h3>
            <p className="text-4xl font-extrabold mt-2">{metrics.package_history}</p>
          </div>
          <div className="text-3xl bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30"><ArchiveBoxIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Deployments</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.deployments}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><RocketLaunchIcon className="w-8 h-8" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group">
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Environment Status</h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.environment_status}</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><GlobeAltIcon className="w-8 h-8" /></div>
        </div>

        <div 
          onClick={() => navigate('/devops/config')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-border-light/60 flex justify-between items-start transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-orange/30 group cursor-pointer"
        >
          <div>
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider group-hover:text-primary-orange transition-colors">Config Health </h3>
            <p className="text-4xl font-extrabold text-sidebar mt-2">{metrics.configuration_health} Passed</p>
          </div>
          <div className="text-3xl bg-input-bg text-primary-orange p-3 rounded-xl border border-border-orange/20 group-hover:bg-primary-orange group-hover:text-white transition-colors"><Cog8ToothIcon className="w-8 h-8" /></div>
        </div>
      </div>
      
      {/* Dynamic Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Environment Health Monitor */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6 h-full">
            <h2 className="text-lg font-bold text-sidebar mb-4">Environment Health</h2>
            <div className="space-y-4">
              
              {/* Production */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-green-100 bg-green-50/30">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                  <span className="text-sm font-bold text-sidebar">Production (AWS-EKS)</span>
                </div>
                <span className="text-xs font-semibold text-green-600">Stable</span>
              </div>

              {/* UAT / Staging */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-green-100 bg-green-50/30">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                  <span className="text-sm font-bold text-sidebar">Staging (AWS-EKS)</span>
                </div>
                <span className="text-xs font-semibold text-green-600">Stable</span>
              </div>

              {/* Development */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-yellow-100 bg-yellow-50/30">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </div>
                  <span className="text-sm font-bold text-sidebar">Development (Local)</span>
                </div>
                <span className="text-xs font-semibold text-yellow-600">Deploying...</span>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Deployment Pipeline Visual */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 p-6 h-full flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-lg font-bold text-sidebar mb-6 relative z-10">Active Deployment: User Service</h2>
            
            <div className="flex-grow flex items-center justify-between relative z-10 px-4 mt-2">
              {/* Line connector */}
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-input-bg -translate-y-1/2 z-0"></div>
              <div className="absolute top-1/2 left-8 w-1/2 h-1 bg-primary-orange -translate-y-1/2 z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-orange text-white flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-xs font-bold text-sidebar">Build & Package</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-orange text-white flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-xs font-bold text-sidebar">Code Quality</span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-primary-orange text-primary-orange flex items-center justify-center shadow-md animate-pulse">
                  <span className="w-2.5 h-2.5 bg-primary-orange rounded-full"></span>
                </div>
                <span className="text-xs font-bold text-primary-orange">Push Image</span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-input-bg text-text-secondary flex items-center justify-center">
                  <GlobeAltIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-text-secondary">Deploy to Dev</span>
              </div>
            </div>
            
            <div className="mt-8 text-center relative z-10">
               <p className="text-xs text-text-secondary">Pipeline ID: <span className="font-mono bg-input-bg px-1 py-0.5 rounded">PL-9482-US</span></p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

