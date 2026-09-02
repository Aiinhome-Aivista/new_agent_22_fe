export default function StatusBadge({ status, isAutoApproved }) {
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
  };

  const c = colors[status] || colors.draft;
  
  let displayText = status === 'validated' ? 'Approved' : (status ? status.replace('_', ' ') : '');
  
  if (status === 'validated' || status === 'approved') {
    if (isAutoApproved === 1 || isAutoApproved === true) {
      displayText = 'Auto-Approved by Agent';
    } else if (isAutoApproved === 0 || isAutoApproved === false) {
      displayText = 'Approved by Architect';
    }
  }
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${c} capitalize`}>
      {displayText}
    </span>
  );
}
