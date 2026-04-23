function normalizeText(text) {
  if (!text) return "";

  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

// lightweight pseudo-stemming (safe + stable)
function stemWords(text) {
  return text
    .split(" ")
    .map(w => {
      // very light heuristics
      return w
        .replace(/(ing|ed|s)$/i, "")
        .replace(/(ами|ями|ами|ом|ем|ой|ей)$/i, "");
    })
    .join(" ");
}

function detectLanguage(text) {
  return /[а-яё]/i.test(text) ? "ru" : "en";
}

function preprocess(text, options = {}) {
  const { useStemming = true } = options;

  let cleaned = normalizeText(text);
  if (!cleaned) return "";

  if (!useStemming) return cleaned;

  return stemWords(cleaned);
}

module.exports = {
  preprocess,
  normalizeText,
  stemWords,
  detectLanguage
};