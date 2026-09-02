import { useState, useEffect } from 'react';
import { commitPackageToGit, getLatestGitPush } from '../api/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function GitCommitModal({ isOpen, onClose, requestId, onSuccess }) {
  const [gitUrl, setGitUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [targetDirectory, setTargetDirectory] = useState('');
  const [commitMessage, setCommitMessage] = useState('Initial commit from Agent 22 Code Package Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestPush, setLatestPush] = useState(null);
  const [activeTab, setActiveTab] = useState('push');
  
  useEffect(() => {
    if (isOpen && requestId) {
      getLatestGitPush(requestId)
        .then(res => {
          if (res.success && res.data) {
            setLatestPush(res.data);
          } else {
            setLatestPush(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch latest push", err);
          setLatestPush(null);
        });
    } else {
      setLatestPush(null);
    }
  }, [isOpen, requestId]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('push');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gitUrl.trim() || !branch.trim() || !commitMessage.trim()) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await commitPackageToGit({
        request_id: requestId,
        git_url: gitUrl,
        branch,
        target_directory: targetDirectory,
        commit_message: commitMessage
      });
      if (res.success) {
        setLatestPush({
          git_url: gitUrl,
          branch,
          target_directory: targetDirectory,
          commit_message: commitMessage,
          pushed_at: new Date().toLocaleString()
        });
        onSuccess(res.message);
        onClose();
      } else {
        setError(res.message || 'Failed to commit package.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#24292f]/10 rounded-lg text-[#24292f]">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-xl text-gray-800">Push to GitHub</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white">
          <button 
            className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${activeTab === 'push' ? 'border-b-2 border-[#24292f] text-[#24292f]' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('push')}
          >
            Push Code
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${activeTab === 'history' ? 'border-b-2 border-[#24292f] text-[#24292f]' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('history')}
          >
            Latest Push Info
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {error && activeTab === 'push' && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div>
              {latestPush ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Latest Push Details</h4>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                    <div>
                      <span className="block text-gray-500 mb-1">Repository</span>
                      <span className="font-medium text-gray-800 break-all">
                        {latestPush.git_url.split('@').pop()} 
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Branch</span>
                      <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-800">
                        {latestPush.branch}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Folder</span>
                      <span className="font-medium text-gray-800 break-all">
                        {latestPush.target_directory || '/ (Root)'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Date & Time</span>
                      <span className="font-medium text-gray-800">
                        {(() => {
                          const dateStr = latestPush.pushed_at;
                          if (!dateStr) return '';
                          let cleanStr = dateStr;
                          if (typeof cleanStr === 'string') {
                            if (cleanStr.includes('GMT')) cleanStr = cleanStr.replace(' GMT', '');
                            if (cleanStr.endsWith('Z')) cleanStr = cleanStr.slice(0, -1);
                          }
                          const d = new Date(cleanStr);
                          if (isNaN(d.getTime())) return dateStr;
                          
                          const yyyy = d.getFullYear();
                          const mm = String(d.getMonth() + 1).padStart(2, '0');
                          const dd = String(d.getDate()).padStart(2, '0');
                          const timeStr = d.toLocaleTimeString('en-US');
                          
                          return `${yyyy}/${mm}/${dd}, ${timeStr}`;
                        })()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-gray-500 mb-1">Comment</span>
                      <span className="font-medium text-gray-800 italic">
                        "{latestPush.commit_message}"
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  <p>No previous pushes found for this package.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'push' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://<token>@github.com/user/repo.git"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include authentication (e.g. PAT) in the URL if required by the remote repository.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Target Directory <span className="font-normal text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={targetDirectory}
                  onChange={(e) => setTargetDirectory(e.target.value)}
                  placeholder="e.g., packages/my-service (leaves root by default)"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Commit Message
                </label>
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border"
                  required
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'push' ? (
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#24292f] hover:bg-[#1f2328] rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Committing...
                </>
              ) : (
                'Commit & Push'
              )}
            </button>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
