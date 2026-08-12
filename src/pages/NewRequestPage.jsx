import { useState, useRef } from 'react';
import { createRequest, runWorkflow } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, ServerStackIcon, Cog6ToothIcon, CpuChipIcon } from '@heroicons/react/24/outline';
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
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="p-4 max-w-9xl mx-auto w-full pb-11">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg border border-orange-200">
            <SparklesIcon className="w-6 h-6 text-primary-orange" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-sidebar tracking-tight">New Architecture Request</h1>
            <p className="text-text-secondary text-sm mt-1">Define your Kafka microservice requirements to generate scaffolding and blueprints.</p>
          </div>
        </div>

        <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="bg-white p-8 rounded-2xl shadow-sm border border-border-light/60 space-y-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          {/* Section 1: Basic Information */}
          <div>
            <h2 className="text-lg font-bold text-sidebar flex items-center gap-2 mb-6 border-b border-border-light/60 pb-3">
               Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-sidebar mb-1.5">Request Name <span className="text-red-500">*</span></label>
                <input required name="request_name" value={formData.request_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none transition-all" placeholder="e.g., Payment Processing Service" />
              </div>
              <div>
                <label className="block text-sm font-bold text-sidebar mb-1.5">Application ID <span className="text-red-500">*</span></label>
                <input required name="application_id" value={formData.application_id} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none transition-all font-mono" placeholder="app.payment.processor" />
              </div>
              <div>
                <label className="block text-sm font-bold text-sidebar mb-1.5">Package Name <span className="text-red-500">*</span></label>
                <input required name="package_name" value={formData.package_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none transition-all font-mono" placeholder="com.digiconfx.payment" />
              </div>
            </div>
          </div>

          {/* Section 2: Kafka Topology */}
          <div>
            <h2 className="text-lg font-bold text-sidebar flex items-center gap-2 mb-6 border-b border-border-light/60 pb-3">
              <ServerStackIcon className="w-5 h-5 text-primary-orange" /> Kafka Topology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-sidebar mb-1.5">Source Topics <span className="text-red-500">*</span></label>
                <input required name="source_topics" value={formData.source_topics} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none transition-all font-mono" placeholder="e.g., txn.events.v1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-sidebar mb-1.5">Target Topics</label>
                <input name="target_topics" value={formData.target_topics} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none transition-all font-mono" placeholder="e.g., txn.processed.v1" />
                <p className="text-xs text-text-secondary mt-1.5">Leave blank if sink connector</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-sidebar mb-1.5">Consumer Group</label>
                <input name="consumer_group" value={formData.consumer_group} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none transition-all font-mono" placeholder="cg-payment-processor" />
              </div>
            </div>
          </div>
          
          {/* Section 3: Processing & Config */}
          <div>
            <h2 className="text-lg font-bold text-sidebar flex items-center gap-2 mb-6 border-b border-border-light/60 pb-3">
              <Cog6ToothIcon className="w-5 h-5 text-primary-orange" /> Processing Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:border-border-orange/50 transition-colors" onClick={() => setFormData(prev => ({...prev, state_store_needed: !prev.state_store_needed}))}>
                <div className="pt-0.5">
                  <input type="checkbox" id="state_store_needed" name="state_store_needed" checked={formData.state_store_needed} onChange={handleChange} className="w-5 h-5 text-primary-orange focus:ring-primary-orange border-gray-300 rounded cursor-pointer" />
                </div>
                <div>
                  <label htmlFor="state_store_needed" className="text-sm font-bold text-sidebar cursor-pointer block">Requires State Store</label>
                  <p className="text-xs text-text-secondary mt-1">Enable for stateful processing (joins, aggregations) using Kafka Streams.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-sidebar mb-1.5">Error Topic Policy</label>
                <div className="relative">
                  <select name="error_topic_policy" value={formData.error_topic_policy} onChange={handleChange} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none transition-all cursor-pointer">
                    <option value="DLQ">Route to Dead Letter Queue (DLQ)</option>
                    <option value="IGNORE">Log and Ignore Errors</option>
                    <option value="RETRY">Retry Policy with Backoff</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section 4: AI Context */}
          <div>
            <h2 className="text-lg font-bold text-sidebar flex items-center gap-2 mb-6 border-b border-border-light/60 pb-3">
              <CpuChipIcon className="w-5 h-5 text-primary-orange" /> AI Context & Business Logic
            </h2>
            <div>
              <label className="block text-sm font-bold text-sidebar mb-1.5">Transformation Rules / Schema Hints</label>
              <textarea name="schema_hints" value={formData.schema_hints} onChange={handleChange} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-border-orange focus:ring-1 focus:ring-border-orange outline-none transition-all resize-none" placeholder="Describe transformation rules... E.g., 'Filter out transactions where amount < 0.'"></textarea>
            </div>
          </div>
          
          <div className="pt-6 border-t border-border-light/60 flex flex-col sm:flex-row justify-end gap-4 items-center">
            <button 
              type="button" 
              onClick={() => handleSubmit(true)} 
              disabled={loading} 
              className="w-full sm:w-auto bg-white border border-border-light text-sidebar hover:bg-slate-50 hover:text-primary-orange px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-sm text-sm"
            >
              {loading ? 'Processing...' : 'Submit Draft (Manual Review)'}
            </button>
            <button 
              type="button" 
              onClick={() => handleSubmit(false)} 
              disabled={loading} 
              className="w-full sm:w-auto bg-button-orange hover:bg-hover-orange text-white px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-sm text-sm"
            >
              {loading ? 'Processing...' : 'Run Full Pipeline with AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
