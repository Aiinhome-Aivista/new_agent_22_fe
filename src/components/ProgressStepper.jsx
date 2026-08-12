import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getRequest } from '../api/api';

const steps = [
  { path: 'patterns', label: 'Intake' },
  { path: 'blueprint', label: 'Blueprint' },
  { path: 'generation', label: 'Generation' },
  { path: 'validation', label: 'Validation' },
  { path: 'package', label: 'Packages' },
  { path: 'review', label: 'Review' }
];

export default function ProgressStepper({ requestId: propRequestId, activeStep }) {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const lastPart = pathParts.pop();
  const currentPath = activeStep || (lastPart === 'progress' ? 'generation' : lastPart);

  // Try to extract request ID from URL if not passed as prop (e.g. /requests/123/generation)
  const urlRequestId = pathParts.find(p => !isNaN(p) && p.length > 0);
  const requestId = propRequestId || urlRequestId;

  const [reqData, setReqData] = useState(null);

  useEffect(() => {
    if (!requestId) return;

    const fetchStatus = () => {
      getRequest(requestId).then(res => {
        if (res.success) {
          setReqData(res.data);
        }
      }).catch(console.error);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [requestId]);

  const currentIndex = steps.findIndex(s => s.path === currentPath);

  const getStageStatus = (stepIndex) => {
    if (!reqData || !reqData.request) {
      if (stepIndex < currentIndex) return 'completed';
      if (stepIndex === currentIndex) return 'active';
      return 'pending';
    }

    const reqStatus = reqData.request.status;
    const bpStatus = reqData.blueprint?.status;
    const hasValErrors = reqData.validation_summary?.has_errors;
    const jobStatus = reqData.job?.job_status;
    const currentStep = reqData.job?.current_step;

    // If request is fully approved, all stages are completed (Green Tick)
    if (reqStatus === 'approved') return 'completed';

    // Step 0: Intake
    if (stepIndex === 0) return 'completed';


    // Step 1: Blueprint
    if (stepIndex === 1) {
      if (bpStatus === 'approved' || ['in_progress', 'validated', 'packaged', 'approved'].includes(reqStatus)) {
        return 'completed';
      }
      if (bpStatus === 'draft' || reqStatus === 'blueprint_review' || currentStep === 'Blueprint') {
        return 'active';
      }
      if (jobStatus === 'failed' && currentStep === 'Blueprint') return 'failed';
      return 'pending';
    }

    // Step 2: Generation
    if (stepIndex === 2) {
      if (['validated', 'packaged', 'approved'].includes(reqStatus) || (bpStatus === 'approved' && ['Validation', 'Packaging', 'Finished'].includes(currentStep))) {
        return 'completed';
      }
      if (bpStatus === 'approved' && (reqStatus === 'in_progress' || currentStep === 'Generation')) {
        return 'active';
      }
      if (jobStatus === 'failed' && currentStep === 'Generation') return 'failed';
      return 'pending';
    }

    // Step 3: Validation
    if (stepIndex === 3) {
      if (hasValErrors) return 'failed';
      if (['validated', 'packaged', 'approved'].includes(reqStatus)) return 'completed';
      if (currentStep === 'Validation') return 'active';
      if (jobStatus === 'failed' && currentStep === 'Validation') return 'failed';
      return 'pending';
    }

    // Step 4: Packages
    if (stepIndex === 4) {
      if (hasValErrors) return 'failed';
      if (['packaged', 'approved'].includes(reqStatus)) return 'completed';
      if (currentStep === 'Packaging') return 'active';
      if (jobStatus === 'failed' && currentStep === 'Packaging') return 'failed';
      return 'pending';
    }

    // Step 5: Review
    if (stepIndex === 5) {
      if (reqStatus === 'approved') return 'completed';
      if (reqStatus === 'rework') return 'failed';
      if (reqStatus === 'packaged') return 'active';
      return 'pending';
    }

    return 'pending';
  };

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-border-light">
      {steps.map((step, idx) => {
        const stageStatus = getStageStatus(idx);
        const isCurrent = idx === currentIndex;

        return (
          <div key={step.path} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${stageStatus === 'completed' ? 'bg-green-500 text-white shadow-sm' : ''}
              ${stageStatus === 'failed' ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.4)]' : ''}
              ${stageStatus === 'active' ? 'bg-primary-orange text-white ring-4 ring-orange-100 animate-pulse' : ''}
              ${stageStatus === 'pending' ? 'bg-gray-200 text-gray-500' : ''}
            `}>
              {stageStatus === 'completed' && (
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {stageStatus === 'failed' && (
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              {(stageStatus === 'active' || stageStatus === 'pending') && (idx + 1)}
            </div>

            <span className={`text-sm ${isCurrent ? 'font-bold text-gray-900' : 'text-gray-500'} ${stageStatus === 'failed' ? 'text-red-600 font-semibold' : ''}`}>
              {step.label}
            </span>

            {idx < steps.length - 1 && (
              <div className={`w-8 h-px mx-2 transition-colors ${
                stageStatus === 'completed' ? 'bg-green-500' : stageStatus === 'failed' ? 'bg-red-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

