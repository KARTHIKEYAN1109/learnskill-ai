const findJsonCandidate = (value) => {
  const firstObject = value.indexOf('{');
  const firstArray = value.indexOf('[');
  const start = [firstObject, firstArray].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? -1;
  if (start === -1) return null;

  const stack = [];
  let inString = false;
  let escaped = false;

  for (let index = start; index < value.length; index += 1) {
    const char = value[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(char);
      continue;
    }

    if (char === '}' || char === ']') {
      const open = stack.pop();
      const validPair = (open === '{' && char === '}') || (open === '[' && char === ']');
      if (!validPair) return null;
      if (stack.length === 0) return value.slice(start, index + 1);
    }
  }

  return null;
};

export const parseJsonFromText = (text, fallback = null) => {
  if (!text) return fallback;
  const cleaned = String(text)
    .replace(/^\uFEFF/, '')
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim();

  const candidates = [
    cleaned,
    findJsonCandidate(cleaned)
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate extracted from the model response.
    }
  }

  return fallback;
};
