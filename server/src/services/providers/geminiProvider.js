import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseJsonFromText } from "../../utils/jsonUtils.js";

const modelName = "gemini-1.5-flash";

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

/* -----------------------------
   GEMINI MODEL
----------------------------- */

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const genAI =
      new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
      );

    return genAI.getGenerativeModel({
      model: modelName,
    });
  } catch {
    return null;
  }
};

/* -----------------------------
   GENERIC JSON GENERATOR
----------------------------- */

const generateJson = async (
  prompt,
  fallback
) => {
  const model = getModel();

  if (!model) {
    return fallback;
  }

  try {
    const result =
      await model.generateContent(
        prompt
      );

    const text =
      result.response.text();

    return parseJsonFromText(
      text,
      fallback
    );
  } catch {
    return fallback;
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
      fallbackResume
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
      fallbackLesson(skill)
    ),

  askTutor: async ({
    skill,
    question,
    history,
  }) => {
    const model = getModel();

    if (!model) {
      return `Let's simplify ${skill}. Start with the basic purpose, try a small project, and practice one concept at a time.`;
    }

    try {
      const transcript =
        history
          ?.map(
            (msg) =>
              `${msg.role}: ${msg.content}`
          )
          .join("\n") || "";

      const result =
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

      return result.response.text();
    } catch {
      return `Unable to contact Gemini. Please try again later.`;
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
      fallbackQuiz(skill)
    ),
};
