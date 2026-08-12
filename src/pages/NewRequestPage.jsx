import { useState, useRef } from 'react';
import { createRequest, runWorkflow } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function NewRequestPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    request_name: '',
    application_id: '',
    package_name: '',
    source_topics: '',
    target_topics: '',
    consumer_group: '',
    state_store_needed: false,
    error_topic_policy: 'DLQ',
    schema_hints: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (draftMode) => {
    if (!formRef.current.reportValidity()) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await createRequest(formData);
      const reqId = res.data.request_id;
      localStorage.setItem('lastGenerationRequestId', reqId);
      // Start workflow
      await runWorkflow(reqId, draftMode);
      navigate(`/progress?id=${reqId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 max-w-3xl mx-auto w-full">
        <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="bg-white p-6 rounded shadow border border-border-light space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Name</label>
              <input required name="request_name" value={formData.request_name} onChange={handleChange} className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application ID *</label>
              <input required name="application_id" value={formData.application_id} onChange={handleChange} className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
              <input required name="package_name" value={formData.package_name} onChange={handleChange} className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Group</label>
              <input name="consumer_group" value={formData.consumer_group} onChange={handleChange} className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none" />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Topics *</label>
                <input required name="source_topics" value={formData.source_topics} onChange={handleChange} className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none" placeholder="e.g., input-topic-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Topics</label>
                <input name="target_topics" value={formData.target_topics} onChange={handleChange} className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none" placeholder="e.g., output-topic-1" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input type="checkbox" id="state_store_needed" name="state_store_needed" checked={formData.state_store_needed} onChange={handleChange} className="w-4 h-4 text-primary-orange focus:ring-primary-orange border-gray-300 rounded" />
            <label htmlFor="state_store_needed" className="text-sm text-gray-700">Requires State Store (Stateful processing)</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Error Topic Policy</label>
            <select name="error_topic_policy" value={formData.error_topic_policy} onChange={handleChange} className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none">
              <option value="DLQ">Dead Letter Queue (DLQ)</option>
              <option value="IGNORE">Ignore Errors</option>
              <option value="RETRY">Retry Policy</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Logic / Schema Hints</label>
            <textarea name="schema_hints" value={formData.schema_hints} onChange={handleChange} rows="4" className="w-full bg-input-bg border border-border-light rounded p-2 focus:border-border-orange outline-none" placeholder="Describe transformation rules..."></textarea>
          </div>
          
          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => handleSubmit(true)} 
              disabled={loading} 
              className="bg-white border border-border-orange text-button-orange hover:bg-orange-50 px-6 py-2 rounded font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Processing...' : 'Submit for Review (Manual)'}
            </button>
            <button 
              type="button" 
              onClick={() => handleSubmit(false)} 
              disabled={loading} 
              className="bg-button-orange hover:bg-hover-orange text-white px-6 py-2 rounded font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Processing...' : 'Run Full Pipeline with AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
