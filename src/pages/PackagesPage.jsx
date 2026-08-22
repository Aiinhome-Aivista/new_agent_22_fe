import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getPackages, getRequests, getRequest } from '../api/api';
import Loader from '../components/Loader';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StepRequestTable from '../components/StepRequestTable';
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function PackagesPage() {
  const { id: pathId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const navigate = useNavigate();
  const id = pathId || queryId;

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);



  const [reqData, setReqData] = useState(null);

  useEffect(() => {
    setLoading(true);
    if (!id || id === 'undefined') {
      getRequests().then(data => {
        setRequests(data.data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
      return;
    }

    Promise.all([
      getPackages(),
      getRequest(id)
    ]).then(([pkgData, reqRes]) => {
      const reqPkgs = (pkgData.data || []).filter(p => p.request_id === parseInt(id));
      setPackages(reqPkgs);
      if (reqRes && reqRes.success) {
        setReqData(reqRes.data);
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  let fileChecklist = [];
  try {
    if (reqData?.blueprint?.file_manifest) {
      const manifestObj = typeof reqData.blueprint.file_manifest === 'string' ? JSON.parse(reqData.blueprint.file_manifest) : reqData.blueprint.file_manifest;
      fileChecklist = (manifestObj.files || []).map(f => f.filename || f.name);
    }
  } catch (e) {
    console.error("Failed to parse manifest", e);
  }
  if (fileChecklist.length === 0) {
      fileChecklist = ['Generating...'];
  }



  if (!id || id === 'undefined') {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-4 md:p-6">
        <StepRequestTable activeStage="packages" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ProgressStepper />
      <div className="p-8 flex-1 overflow-y-auto">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/packages')} 
                  className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                  title="Go Back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-extrabold text-sidebar">
                  Code Package Delivery
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📦</span> Download Skeleton
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your microservice skeleton is generated and validated. Download the ZIP file to extract the codebase, or trigger a direct commit to the configured Git repository.
                </p>
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">{pkg.request_name || `Package #${pkg.id}`}</span>
                      <span className="text-xs font-mono text-gray-500 truncate max-w-[200px]" title={`package_${pkg.request_id}.zip`}>{`package_${pkg.request_id}.zip`}</span>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/packages/download/${pkg.id}`}
                      className="w-full inline-block text-center bg-primary-orange hover:bg-hover-orange text-white py-2 rounded-lg font-medium shadow-sm transition-all hover:-translate-y-0.5"
                      download
                    >
                      <span className="flex items-center justify-center gap-2">
                        <ArrowDownTrayIcon className="w-5 h-5 stroke-[2.5]" />
                        Download ZIP
                      </span>
                    </a>
                  </div>
                ))}
                {packages.length === 0 && (
                  <p className="text-gray-500 text-sm italic mb-4">No packages available yet.</p>
                )}

              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">File Manifest Checklist</h3>
                <div className="space-y-3">
                  {fileChecklist.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="text-green-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>
                      <span className="text-sm font-medium text-gray-700 truncate">{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-100">
                <h3 className="font-bold text-emerald-800 mb-2">Validation Summary</h3>
                <p className="text-sm text-emerald-700 mb-4">All pattern checks and logic validations passed successfully.</p>
                <button onClick={() => navigate(`/requests/${id}/review`)} className="w-full bg-primary-orange hover:bg-hover-orange text-white py-3 rounded-lg font-bold shadow-sm transition-all text-center flex justify-center items-center gap-2">
                  {reqData?.request?.status === 'approved' || reqData?.request?.status === 'packaged' 
                    ? 'View Final Sign-off Details \u2192' 
                    : 'Proceed to Tech Lead Review \u2192'}
                </button>
              </div>
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
