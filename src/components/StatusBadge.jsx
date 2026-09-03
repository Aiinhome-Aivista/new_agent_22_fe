export default function StatusBadge({ status, isAutoApproved, req, activeStage }) {
  const colors = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
    validated: 'bg-blue-100 text-blue-700 border-blue-200',
    packaged: 'bg-purple-100 text-purple-700 border-purple-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rework: 'bg-red-100 text-red-700 border-red-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-600 border-blue-200',
    warning: 'bg-amber-50 text-amber-600 border-amber-200',
    error: 'bg-red-50 text-red-600 border-red-200',
    success: 'bg-green-50 text-green-600 border-green-200',
  };

  let c = colors[status] || colors.draft;
  let displayText = status === 'validated' ? 'Approved' : (status ? status.replace('_', ' ') : '');
  
  if (status === 'validated' || status === 'approved') {
    if (isAutoApproved === 1 || isAutoApproved === true) {
      displayText = 'Auto-Approved by Agent';
    } else if (isAutoApproved === 0 || isAutoApproved === false) {
      displayText = 'Approved by Architect';
    }
  }
  
  if (req && activeStage) {
    if (activeStage === 'generation') {
       if (req.job_status === 'failed' && req.current_step === 'Generation') {
           displayText = 'Generation Failed';
           c = colors.error;
       } else if (['validated', 'packaged'].includes(req.status) || ['Validation', 'Packaging', 'Finished'].includes(req.current_step)) {
           displayText = '100% Generated';
           c = colors.success;
       } else if (req.current_step === 'Generation') {
           displayText = 'In Progress';
           c = colors.in_progress;
       }
    } else if (activeStage === 'validation') {
       if (req.error_count > 0 || (req.job_status === 'failed' && req.current_step === 'Validation')) {
           displayText = 'Validation failed';
           c = colors.error;
       } else if (['validated', 'packaged'].includes(req.status) || ['Packaging', 'Finished'].includes(req.current_step)) {
           displayText = 'Validation Passed';
           c = colors.success;
       } else if (req.current_step === 'Validation') {
           displayText = 'In Progress';
           c = colors.in_progress;
       } else if (req.status === 'blueprint_review' || req.current_step === 'Blueprint' || req.current_step === 'Generation' || req.status === 'in_progress') {
           displayText = 'Pending Validation';
           c = colors.draft;
       }
    }
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${c} capitalize whitespace-nowrap`}>
      {displayText}
    </span>
  );
}
