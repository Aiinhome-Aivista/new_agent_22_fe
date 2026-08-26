import { useEffect, useState } from 'react';
import { getRequests } from '../api/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import RequestTable from '../components/RequestTable';

export default function Dashboard() {
  const { user } = useAuth();
  const { currentTrack } = useProject();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRequests().then(data => {
      let reqList = data.data || [];
      if (currentTrack?.id) {
        reqList = reqList.filter(r => Number(r.track_id) === Number(currentTrack.id));
      }
      setRequests(reqList);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [currentTrack]);

  if (loading) return <Loader />;

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-border-light/60 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border-light/60 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-input-bg rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-sidebar mb-2">My Requests</h2>
              <p className="text-sm text-text-secondary">View the status of your microservice requests, check pipelines, and download generated code.</p>
            </div>
            {user?.role === 'developer' && (
              <button onClick={() => navigate('/request/new')} className="relative z-10 flex items-center gap-2 bg-primary-orange hover:bg-hover-orange text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(255,90,20,0.3)] hover:shadow-[0_6px_20px_rgba(255,90,20,0.4)] transition-all hover:-translate-y-0.5 whitespace-nowrap">
                + New Request
              </button>
            )}
          </div>
        </div>
        <RequestTable requests={requests} role={user?.role || 'developer'} navigate={navigate} />
      </div>
    </div>
  );
}
