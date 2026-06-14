import { geminiProvider } from './providers/geminiProvider.js';

const providers = {
  gemini: geminiProvider
};

const activeProvider = () => providers[process.env.AI_PROVIDER || 'gemini'] || geminiProvider;

const aiService = {
  analyzeResume: (resumeText) => activeProvider().analyzeResume(resumeText),
  generateLesson: (skill) => activeProvider().generateLesson(skill),
  askTutor: (payload) => activeProvider().askTutor(payload),
  generateQuiz: (skill) => activeProvider().generateQuiz(skill)
};

export default aiService;
