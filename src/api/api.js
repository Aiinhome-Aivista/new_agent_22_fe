import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Requirements
export const getRequests = (status) => api.get('/requirements/', { params: { status } }).then(res => res.data);
export const getRequest = (id) => api.get(`/requirements/${id}`).then(res => res.data);
export const createRequest = (data) => api.post('/requirements/', data).then(res => res.data);

// Patterns
export const getPatterns = (reqId) => api.get(`/patterns/request/${reqId}`).then(res => res.data);

// Auth endpoints
export const loginUser = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const getPersonas = () => api.get('/auth/personas').then(res => res.data);

// Blueprint
export const getBlueprint = (reqId) => api.get(`/blueprint/request/${reqId}`).then(res => res.data);
export const approveBlueprint = (bpId) => api.put(`/blueprint/${bpId}/approve`).then(res => res.data);

// Generation
export const getGeneratedFiles = (reqId) => api.get(`/generate/request/${reqId}/files`).then(res => res.data);

// Validation
export const getValidationResults = (reqId) => api.get(`/validation/request/${reqId}`).then(res => res.data);

// Packages
export const getPackages = () => api.get('/packages/').then(res => res.data);

// Reviews
export const addReview = (data) => api.post('/review/', data).then(res => res.data);
export const getReviews = (reqId) => api.get(`/review/request/${reqId}`).then(res => res.data);

// Workflow
export const runWorkflow = (reqId) => api.post('/workflow/run', { request_id: reqId }).then(res => res.data);
export const getWorkflowStatus = (jobId) => api.get(`/workflow/status/${jobId}`).then(res => res.data);

// Chat
export const askAdvisor = (sessionId, question, reqId) => api.post('/chat/ask', { session_id: sessionId, question, request_id: reqId }).then(res => res.data);
export const getChatHistory = (sessionId) => api.get(`/chat/history/${sessionId}`).then(res => res.data);

// Audit
export const getAuditLogs = (reqId) => api.get(`/audit/request/${reqId}`).then(res => res.data);

export default api;
