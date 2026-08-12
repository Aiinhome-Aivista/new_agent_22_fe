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
export const generateBlueprint = (requestId) => api.post('/blueprint/generate', { request_id: requestId }).then(res => res.data);
export const approveBlueprint = (id) => api.put(`/blueprint/${id}/approve`).then(res => res.data);
export const reworkBlueprint = (id, comments) => api.put(`/blueprint/${id}/rework`, { comments }).then(res => res.data);
export const getBlueprint = (requestId) => api.get(`/blueprint/request/${requestId}`).then(res => res.data);

// Generation
export const getGeneratedFiles = (reqId) => api.get(`/generate/request/${reqId}/files`).then(res => res.data);

// Validation
export const getValidationResults = (reqId) => api.get(`/validation/request/${reqId}`).then(res => res.data);

// Packages & DevOps
export const getPackages = () => api.get('/packages/').then(res => res.data);
export const generateDevopsScripts = (reqId, envName) => api.post('/packages/generate-scripts', { request_id: reqId, env_name: envName }).then(res => res.data);
export const triggerPipeline = (reqId, envName) => api.post('/packages/trigger-pipeline', { request_id: reqId, env_name: envName }).then(res => res.data);

// Reviews
export const getReviewQueue = () =>api.get('/review/queue').then(res => res.data);
export const addReview = (data) => api.post('/review/', data).then(res => res.data);
export const getReviews = (reqId) => api.get(`/review/request/${reqId}`).then(res => res.data);

// Workflow
export const runWorkflow = (reqId, draftMode = false) => api.post('/workflow/run', { request_id: reqId, draft_mode: draftMode }).then(res => res.data);
export const getWorkflowStatus = (jobId) => api.get(`/workflow/status/${jobId}`).then(res => res.data);

// Chat
export const askAdvisor = (sessionId, question, reqId) => api.post('/chat/ask', { session_id: sessionId, question, request_id: reqId }).then(res => res.data);
export const getChatHistory = (sessionId) => api.get(`/chat/history/${sessionId}`).then(res => res.data);

// Audit
export const getAuditLogs = (reqId) => api.get(`/audit/request/${reqId}`).then(res => res.data);

// Dashboard
export const getDashboardMetrics = (role) => api.get(`/dashboard/metrics/${role}`).then(res => res.data);

// Standards
export const getStandards = () => api.get('/standards/').then(res => res.data);
export const saveStandard = (data) => api.post('/standards/', data).then(res => res.data);
export const deleteStandard = (id) => api.delete(`/standards/${id}`).then(res => res.data);

// Environments
export const getEnvironments = () => api.get('/environments/').then(res => res.data);
export const getEnvironment = (envName) => api.get(`/environments/${envName}`).then(res => res.data);
export const updateEnvironment = (envName, data) => api.put(`/environments/${envName}`, data).then(res => res.data);

// Tech Lead
export const getTechLeadValidations = () => api.get('/techlead/validations').then(res => res.data);
export const actionValidation = (id, action) => api.post(`/techlead/validations/${id}/action`, { action }).then(res => res.data);
export const getTechLeadReviews = () => api.get('/techlead/reviews').then(res => res.data);
export const signoffReview = (data) => api.post('/techlead/reviews/signoff', data).then(res => res.data);

export default api;
