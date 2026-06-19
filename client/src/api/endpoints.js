import api from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (payload) => api.patch('/auth/profile', payload),
  changePassword: (payload) => api.patch('/auth/password', payload),
  deleteAccount: () => api.delete('/auth/account')
};

export const resumeApi = {
  analyze: (file) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/resume/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
};

export const learningApi = {
  path: () => api.get('/learning-path'),
  lesson: (skill) => api.post('/lesson/generate', { skill }),
  askTutor: (payload) => api.post('/tutor/ask', payload),
  tutorHistory: (skill) => api.get(`/tutor/history/${encodeURIComponent(skill)}`),
  quiz: (skill) => api.post('/quiz/generate', { skill }),
  submitQuiz: (payload) => api.post('/quiz/submit', payload),
  progress: () => api.get('/progress'),
  complete: (skill) => api.post('/progress/complete', { skill }),
  bookmarks: () => api.get('/bookmarks'),
  bookmark: (lessonId) => api.post('/bookmarks/toggle', { lessonId }),
  saveNote: (payload) => api.put('/notes', payload),
  getNote: (skill) => api.get(`/notes/${encodeURIComponent(skill)}`)
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  tracks: () => api.get('/admin/tracks')
};
