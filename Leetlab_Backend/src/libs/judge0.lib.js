import judge0Client from "./judge0Client.js";

export const getJudge0LanguageId = (language) => {
  const map = { PYTHON: 71, JAVA: 62, JAVASCRIPT: 63 };
  return map[language.toUpperCase()];
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const submitBatch = async (submissions) => {
  const { data } = await judge0Client.post(
    "submissions/batch?base64_encoded=false",
    { submissions }
  );
  return data;
};

export const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await judge0Client.get("submissions/batch", {
      params: { tokens: tokens.join(","), base64_encoded: false },
    });
    const results = data.submissions ?? [];
    const done = results.every((r) => r.status.id !== 1 && r.status.id !== 2);
    if (done) return results;
    await sleep(1000);
  }
};

export function getLanguageName(languageId) {
  const names = { 74: "TypeScript", 63: "JavaScript", 71: "Python", 62: "Java" };
  return names[languageId] || "Unknown";
}
