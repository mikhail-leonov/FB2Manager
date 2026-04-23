const { preprocess } = require("./TextPreprocessor");

function buildSearchQuery(input) {
  if (!input) return "";
  const cleaned = preprocess(input, { language: "auto", useStemming: true });
  return cleaned.split(" ").filter(Boolean).join(" OR ");
}

module.exports = {
  buildSearchQuery
};