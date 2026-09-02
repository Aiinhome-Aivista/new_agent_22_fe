import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Requirements
export const getRequests = (params = {}) => {
  if (params.track_id === 'ALL') {
    delete params.track_id;
  } else if (!params.track_id) {
    const activeTrackStr = localStorage.getItem('agent22_active_track');
    if (activeTrackStr) {
      try {
        const activeTrack = JSON.parse(activeTrackStr);
        if (activeTrack && activeTrack.id) {
          params.track_id = activeTrack.id;
        }
      } catch (e) {}
    }
  }
  return api.get('/requirements/', { params }).then(res => res.data);
};
export const getRequest = (id) => api.get(`/requirements/${id}`).then(res => res.data);
export const createRequest = (data) => api.post('/requirements/', data).then(res => res.data);
export const submitChatIntake = (data) => api.post('/requirements/intake-chat', data).then(res => res.data);

// Patterns
export const getPatterns = (reqId) => api.get(`/patterns/request/${reqId}`).then(res => res.data);

// Auth endpoints
export const loginUser = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const getPersonas = () => api.get('/auth/personas').then(res => res.data);

// Blueprint
export const generateBlueprint = (requestId) => api.post('/blueprint/generate', { request_id: requestId }).then(res => res.data);
export const approveBlueprint = (id) => api.put(`/blueprint/${id}/approve`).then(res => res.data);
export const reworkBlueprint = (id, comments) => api.put(`/blueprint/${id}/rework`, { comments }).then(res => res.data);
export const getBlueprint = (requestId) => api.get(`/blueprint/request/${requestId}`).then(res => res.data);

// Generation
export const getGeneratedFiles = (reqId) => api.get(`/generate/request/${reqId}/files`).then(res => res.data);
export const analyzeGeneratedFiles = (reqId, force=false) => api.post(`/generate/request/${reqId}/analyze-needs-work`, { force }).then(res => res.data);

// Validation
export const getValidationResults = (reqId) => api.get(`/validation/request/${reqId}`).then(res => res.data);
export const fixValidation = (reqId, ruleName, message) => api.post('/validation/fix', { request_id: reqId, rule_name: ruleName, message }).then(res => res.data);

// Packages
export const getPackages = () => api.get('/packages/').then(res => res.data);
export const commitPackageToGit = (data) => api.post('/packages/commit', data).then(res => res.data);
export const getLatestGitPush = (requestId) => api.get(`/packages/latest-push/${requestId}`).then(res => res.data);

// Reviews
export const getReviewQueue = () =>api.get('/review/queue').then(res => res.data);
export const addReview = (data) => api.post('/review/', data).then(res => res.data);
export const getReviews = (reqId) => api.get(`/review/request/${reqId}`).then(res => res.data);

// Workflow
export const runWorkflow = (reqId, draftMode = false) => api.post('/workflow/run', { request_id: reqId, draft_mode: draftMode }).then(res => res.data);
export const getWorkflowStatus = (jobId) => api.get(`/workflow/status/${jobId}`).then(res => res.data);

// Chat
export const askAdvisor = (sessionId, question, reqId, trackId) => api.post('/chat/ask', { session_id: sessionId, question, request_id: reqId, track_id: trackId }).then(res => res.data);
export const getChatHistory = (sessionId) => api.get(`/chat/history/${sessionId}`).then(res => res.data);

// Audit
export const getAuditLogs = (reqId) => api.get(`/audit/request/${reqId}`).then(res => res.data);

// Dashboard
export const getDashboardMetrics = (role, trackId) => api.get(`/dashboard/metrics/${role}`, { params: { track_id: trackId } }).then(res => res.data);

// Standards
export const getStandards = (trackId) => api.get('/standards/', { params: { track_id: trackId } }).then(res => res.data);
export const saveStandard = (data) => api.post('/standards/', data).then(res => res.data);
export const uploadStandard = (formData) => api.post('/standards/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
export const parseFileContent = (formData) => api.post('/standards/parse-file', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
export const generateGithubRules = (formData) => api.post('/standards/generate-github-rules', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
export const deleteStandard = (id) => api.delete(`/standards/${id}`).then(res => res.data);

// Environments
export const getEnvironments = () => api.get('/environments/').then(res => res.data);
export const getEnvironment = (envName) => api.get(`/environments/${envName}`).then(res => res.data);
export const updateEnvironment = (envName, data) => api.put(`/environments/${envName}`, data).then(res => res.data);

// Tech Lead
export const getTechLeadValidations = (trackId) => api.get('/techlead/validations', { params: { track_id: trackId } }).then(res => res.data);
export const actionValidation = (id, action) => api.post(`/techlead/validations/${id}/action`, { action }).then(res => res.data);
export const getTechLeadReviews = (trackId) => api.get('/techlead/reviews', { params: { track_id: trackId } }).then(res => res.data);
export const signoffReview = (data) => api.post('/techlead/reviews/signoff', data).then(res => res.data);
export const getTechLeadReportSummary = (trackId) => api.get('/techlead/reports/summary', { params: { track_id: trackId } }).then(res => res.data);
export const getTechLeadReports = (trackId) => api.get('/techlead/reports', { params: { track_id: trackId } }).then(res => res.data);
export const downloadTechLeadReport = (id, format = 'json') => api.get(`/techlead/reports/download/${id}?format=${format}`, { responseType: 'blob' }).then(res => res.data);

// Projects
export const getProjects = (params) => api.get('/projects/', { params }).then(res => res.data);
export const createProject = (data) => api.post('/projects/', data).then(res => res.data);
export const getProject = (id) => api.get(`/projects/${id}`).then(res => res.data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data).then(res => res.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then(res => res.data);
export const updateTrack = (trackId, data) => api.put(`/projects/tracks/${trackId}`, data).then(res => res.data);
export const deleteTrack = (trackId) => api.delete(`/projects/tracks/${trackId}`).then(res => res.data);

export default api;

