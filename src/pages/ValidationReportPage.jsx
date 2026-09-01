import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getValidationResults, fixValidation } from '../api/api';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import StepRequestTable from '../components/StepRequestTable';
import { ArrowLeftIcon, WrenchScrewdriverIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ValidationReportPage() {
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const id = pathId || queryId;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const role = user?.role?.toLowerCase() || 'developer';
  const isTechLead = role === 'techlead' || role === 'tech lead' || role.includes('tech');
  const [results, setResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [fixingRule, setFixingRule] = useState(null);

  const fetchResults = (silent = false) => {
    if (!silent) setLoading(true);
    getValidationResults(id).then(data => {
      setResults(data.data?.results || data.data || []);
      setSummary(data.data?.summary || '');
      if (!silent) setLoading(false);
    }).catch(err => {
      console.error(err);
      if (!silent) setLoading(false);
    });
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchResults();

    // Poll every 5 seconds if results are not yet available
    const intervalId = setInterval(() => {
      getValidationResults(id).then(data => {
        const fetchedResults = data.data?.results || data.data || [];
        if (fetchedResults.length > 0) {
          setResults(fetchedResults);
          setSummary(data.data?.summary || '');
          clearInterval(intervalId);
        }
      }).catch(err => {
        console.error("Polling error:", err);
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    if (results.length === 0) {
      setDisplayedResults([]);
      setIsRevealing(false);
      return;
    }
    
    // If we already have results (e.g. from clicking fix), skip animation
    if (displayedResults.length > 0) {
       setDisplayedResults(results);
       setIsRevealing(false);
       return;
    }
    
    setIsRevealing(true);
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < results.length) {
        setDisplayedResults(prev => {
          const next = [...prev, results[currentIndex]];
          currentIndex++;
          return next;
        });
      } else {
        clearInterval(interval);
        setIsRevealing(false);
      }
    }, 600); // Reveal one rule every 600ms
    
    return () => clearInterval(interval);
  }, [results]);

  const handleFix = async (rule) => {
    if (fixingRule) return;
    setFixingRule(rule.rule_name);
    try {
      await fixValidation(id, rule.rule_name, rule.message);
      fetchResults(true);
    } catch (err) {
      console.error(err);
      alert('Auto-fix failed. Please check the logs.');
    } finally {
      setFixingRule(null);
    }
  };

  if (!id) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-8">
        <StepRequestTable activeStage="validation" />
      </div>
    );
  }

  const hasErrors = results.some(r => r.severity === 'error' && !r.passed);

  return (
    <div className="flex flex-col h-full">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(isTechLead ? '/techlead/dashboard' : '/validation')} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Go Back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Validation Checks</h2>
          </div>
          <button 
            onClick={() => navigate(`/requests/${id}/packages`)} 
            disabled={hasErrors}
            className={`px-6 py-2 rounded font-medium transition-colors ${hasErrors ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-button-orange hover:bg-hover-orange text-white'}`}
          >
            {hasErrors ? 'Fix Errors to Continue' : 'Next: Packages'}
          </button>
        </div>
        
        <div className="grid gap-6">
          {summary && !loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded text-sm shadow-sm">
              <strong className="block mb-2">AI Summary:</strong>
              {summary}
            </div>
          )}
          
          <div className="bg-white rounded shadow border border-border-light overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-border-light">
                  <th className="p-4 font-medium">Rule</th>
                  <th className="p-4 font-medium">Status</th>
                  {/* <th className="p-4 font-medium">Severity</th> */}
                  <th className="p-4 font-medium">Message</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-8">
                      <div className="flex justify-center items-center py-12">
                        <ArrowPathIcon className="w-8 h-8 animate-spin text-orange-400" />
                      </div>
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8">
                      <div className="flex flex-col justify-center items-center gap-3 text-gray-500 py-12">
                        <ArrowPathIcon className="w-8 h-8 animate-spin text-orange-400" />
                        <p className="font-medium text-sm">Waiting for validation results...</p>
                        <p className="text-xs">This may take a few minutes if AI code generation is still in progress.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedResults.map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-900 max-w-xs truncate" title={r.rule_name}>{r.rule_name}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold ${r.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {r.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      {/* <td className="p-4"><StatusBadge status={r.severity} /></td> */}
                      <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={r.message}>{r.message}</td>
                      <td className="p-4 text-right">
                        {!r.passed && (
                          <button
                            onClick={() => handleFix(r)}
                            disabled={fixingRule !== null}
                            className={`flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded text-xs font-bold transition-colors ${fixingRule === r.rule_name ? 'bg-orange-100 text-orange-500 cursor-wait' : fixingRule ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 text-primary-orange hover:bg-primary-orange hover:text-white'}`}
                          >
                            {fixingRule === r.rule_name ? (
                              <>
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                Fixing...
                              </>
                            ) : (
                              <>
                                <WrenchScrewdriverIcon className="w-4 h-4" />
                                Auto Fix
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                {isRevealing && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <ArrowPathIcon className="w-4 h-4 animate-spin text-orange-500" />
                        <span>Validating next rule...</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
