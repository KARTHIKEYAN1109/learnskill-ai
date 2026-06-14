import '../../config/env.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseJsonFromText } from "../../utils/jsonUtils.js";

const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";

const buildMeta = ({ calledGemini = false, fallback = false, operation, reason = null } = {}) => ({
  provider: 'gemini',
  model: modelName,
  operation,
  apiKeyLoaded: Boolean(getApiKey()),
  calledGemini,
  fallback,
  reason
});

const aiResult = (data, meta) => ({ data, ai: meta });

const getApiKey = () => process.env.GEMINI_API_KEY?.trim();

const classifyGeminiError = (error) => {
  const status = error?.status || error?.response?.status;
  const code = error?.code || error?.cause?.code;
  const message = String(error?.message || '').toLowerCase();

  if (status === 400) return 'invalid_request';
  if (status === 401 || status === 403) return 'auth_failed';
  if (status === 404) return 'model_not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'gemini_unavailable';
  if (code === 'ENOTFOUND' || code === 'ECONNRESET' || code === 'ETIMEDOUT' || message.includes('fetch failed')) {
    return 'network_error';
  }

  return 'request_failed';
};

/* -----------------------------
   FALLBACK DATA
----------------------------- */

const fallbackResume = {
  skillsFound: ["JavaScript", "React", "Git"],
  missingSkills: [
    "Docker",
    "AWS",
    "System Design",
    "Kubernetes",
    "CI/CD",
  ],
  recommendedTrack: "Full-Stack Cloud Engineer",
  skillGapScore: 68,
  estimatedLearningTime: "10-12 weeks",
  prioritySkills: [
    "Docker",
    "AWS",
    "System Design",
    "Kubernetes",
    "CI/CD",
  ],
};

const fallbackLesson = (skill) => ({
  title: `${skill} Foundations`,
  explanation: `${skill} is a practical skill you build by understanding the core concepts and applying them in real projects.`,
  example: `Build a simple project using ${skill} and practice the workflow.`,
  exercise: `Create notes for ${skill} and implement one beginner-friendly task.`,
  nextTopic: `${skill} Advanced Concepts`,
});

const fallbackQuiz = (skill) => ({
  questions: [
    {
      question: `What is the main goal of learning ${skill}?`,
      options: [
        "Understand the fundamentals",
        "Avoid practice",
        "Memorize everything",
        "Ignore projects",
      ],
      answer: "Understand the fundamentals",
    },
    {
      question: `Why should beginners practice ${skill}?`,
      options: [
        "To gain hands-on experience",
        "To avoid learning",
        "To skip concepts",
        "To remove all bugs",
      ],
      answer: "To gain hands-on experience",
    },
  ],
});

const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const validators = {
  resume_analysis: (value) =>
    value &&
    isStringArray(value.skillsFound) &&
    isStringArray(value.missingSkills) &&
    hasText(value.recommendedTrack) &&
    Number.isFinite(value.skillGapScore) &&
    value.skillGapScore >= 0 &&
    value.skillGapScore <= 100 &&
    hasText(value.estimatedLearningTime) &&
    isStringArray(value.prioritySkills),

  lesson_generation: (value) =>
    value &&
    hasText(value.title) &&
    hasText(value.explanation) &&
    hasText(value.example) &&
    hasText(value.exercise) &&
    hasText(value.nextTopic),

  quiz_generation: (value) =>
    value &&
    Array.isArray(value.questions) &&
    value.questions.length > 0 &&
    value.questions.every((question) =>
      hasText(question.question) &&
      isStringArray(question.options) &&
      question.options.length === 4 &&
      hasText(question.answer) &&
      question.options.includes(question.answer)
    )
};

/* -----------------------------
   GEMINI MODEL
----------------------------- */

const getModel = () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { model: null, reason: 'missing_api_key' };
  }

  try {
    const genAI =
      new GoogleGenerativeAI(
        apiKey
      );

    return {
      model: genAI.getGenerativeModel({
        model: modelName,
      }),
      reason: null
    };
  } catch {
    return { model: null, reason: 'model_init_failed' };
  }
};

/* -----------------------------
   GENERIC JSON GENERATOR
----------------------------- */

const generateJson = async (
  prompt,
  fallback,
  operation
) => {
  const { model, reason } = getModel();

  if (!model) {
    return aiResult(fallback, buildMeta({ operation, fallback: true, reason }));
  }

  try {
    const response =
      await model.generateContent(
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        }
      );

    const text =
      response.response.text();

    const parsed = parseJsonFromText(
      text,
      null
    );

    if (!parsed) {
      return aiResult(fallback, buildMeta({ operation, calledGemini: true, fallback: true, reason: 'invalid_json' }));
    }

    if (!validators[operation]?.(parsed)) {
      return aiResult(fallback, buildMeta({ operation, calledGemini: true, fallback: true, reason: 'invalid_schema' }));
    }

    return aiResult(parsed, buildMeta({ operation, calledGemini: true }));
  } catch (error) {
    return aiResult(fallback, buildMeta({ operation, calledGemini: true, fallback: true, reason: classifyGeminiError(error) }));
  }
};

/* -----------------------------
   PROVIDER METHODS
----------------------------- */

export const geminiProvider = {
  analyzeResume: async (
    resumeText
  ) =>
    generateJson(
      `
Analyze this resume.

Return STRICT JSON ONLY:

{
  "skillsFound": [],
  "missingSkills": [],
  "recommendedTrack": "",
  "skillGapScore": 0,
  "estimatedLearningTime": "",
  "prioritySkills": []
}

Resume:

${resumeText}
`,
      fallbackResume,
      'resume_analysis'
    ),

  generateLesson: async (
    skill
  ) =>
    generateJson(
      `
Teach ${skill} to a beginner.

Return STRICT JSON ONLY:

{
  "title":"",
  "explanation":"",
  "example":"",
  "exercise":"",
  "nextTopic":""
}

Rules:
- Beginner friendly
- Practical
- Short explanation
- No markdown
`,
      fallbackLesson(skill),
      'lesson_generation'
    ),

  askTutor: async ({
    skill,
    question,
    history,
  }) => {
    const { model, reason } = getModel();

    if (!model) {
      return aiResult(
        `Let's simplify ${skill}. Start with the basic purpose, try a small project, and practice one concept at a time.`,
        buildMeta({ operation: 'tutor_chat', fallback: true, reason })
      );
    }

    try {
      const transcript =
        history
          ?.map(
            (msg) =>
              `${msg.role}: ${msg.content}`
          )
          .join("\n") || "";

      const response =
        await model.generateContent(`
You are LearnSphere AI Tutor.

Skill:
${skill}

Chat History:
${transcript}

Question:
${question}

Rules:
- Beginner friendly
- Numbered points
- Maximum 8 points
- No markdown
- Give one small practice task
`);

      const answer = response.response.text();

      if (!hasText(answer)) {
        return aiResult(
          `Unable to contact Gemini. Please try again later.`,
          buildMeta({ operation: 'tutor_chat', calledGemini: true, fallback: true, reason: 'empty_response' })
        );
      }

      return aiResult(answer, buildMeta({ operation: 'tutor_chat', calledGemini: true }));
    } catch (error) {
      return aiResult(
        `Unable to contact Gemini. Please try again later.`,
        buildMeta({ operation: 'tutor_chat', calledGemini: true, fallback: true, reason: classifyGeminiError(error) })
      );
    }
  },

  generateQuiz: async (
    skill
  ) =>
    generateJson(
      `
Generate a quiz for ${skill}.

Return STRICT JSON ONLY:

{
  "questions":[
    {
      "question":"",
      "options":["","","",""],
      "answer":""
    }
  ]
}

Generate 5 MCQs.
`,
      fallbackQuiz(skill),
      'quiz_generation'
    ),
};
