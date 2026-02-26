const questionBank = {
  math: [
    { question: "7 + 8 = ?", options: ["13", "14", "15", "16"], answer: "15" },
    { question: "12 × 3 = ?", options: ["24", "36", "30", "18"], answer: "36" },
    { question: "15 + 27 = ?", options: ["40", "42", "44", "46"], answer: "42" },
    { question: "8 × 7 = ?", options: ["54", "56", "58", "52"], answer: "56" },
    { question: "45 - 18 = ?", options: ["25", "27", "29", "23"], answer: "27" },
    { question: "9 × 6 = ?", options: ["52", "54", "56", "58"], answer: "54" },
    { question: "100 - 37 = ?", options: ["61", "63", "65", "67"], answer: "63" },
    { question: "11 × 11 = ?", options: ["111", "121", "131", "141"], answer: "121" },
    { question: "72 ÷ 8 = ?", options: ["7", "8", "9", "10"], answer: "9" },
    { question: "56 + 44 = ?", options: ["98", "100", "102", "104"], answer: "100" }
  ],

  english: [
    { question: "Opposite of 'early'?", options: ["late", "fast", "soon", "quick"], answer: "late" },
    { question: "Synonym of 'happy'?", options: ["sad", "angry", "joyful", "tired"], answer: "joyful" },
    { question: "Opposite of 'ancient'?", options: ["old", "new", "young", "modern"], answer: "modern" },
    { question: "Synonym of 'brave'?", options: ["cowardly", "fearless", "weak", "timid"], answer: "fearless" },
    { question: "Opposite of 'accept'?", options: ["agree", "refuse", "allow", "permit"], answer: "refuse" },
    { question: "Synonym of 'begin'?", options: ["end", "start", "stop", "finish"], answer: "start" },
    { question: "Opposite of 'artificial'?", options: ["fake", "synthetic", "natural", "man-made"], answer: "natural" },
    { question: "Synonym of 'quiet'?", options: ["loud", "silent", "noisy", "busy"], answer: "silent" }
  ],

  logic: [
    { question: "What comes next: 2, 4, 6, ?", options: ["7", "8", "9", "10"], answer: "8" },
    { question: "What comes next: 1, 1, 2, 3, 5, ?", options: ["6", "7", "8", "9"], answer: "8" },
    { question: "What comes next: 1, 4, 9, 16, ?", options: ["20", "25", "30", "36"], answer: "25" },
    { question: "What comes next: A, C, E, G, ?", options: ["H", "I", "J", "K"], answer: "I" },
    { question: "Complete: Monday, Wednesday, Friday, ?", options: ["Saturday", "Sunday", "Tuesday", "Thursday"], answer: "Sunday" },
    { question: "What comes next: 3, 6, 12, 24, ?", options: ["36", "42", "48", "54"], answer: "48" },
    { question: "Complete: Spring, Summer, ?, Winter", options: ["Fall", "Autumn", "September", "October"], answer: "Fall" }
  ]
};

// Track asked questions per session to avoid repeats
let askedQuestions = [];

function getRandomQuestion(excludeHashes = []) {
  const categories = Object.keys(questionBank);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const questions = questionBank[randomCategory];
  
  // Filter out already asked questions
  const availableQuestions = questions.filter(q => !excludeHashes.includes(hashQuestion(q)));
  
  // If all questions used, reset and allow repeats
  const questionPool = availableQuestions.length > 0 ? availableQuestions : questions;
  const randomQuestion = questionPool[Math.floor(Math.random() * questionPool.length)];
  
  // Add to exclude list
  const questionHash = hashQuestion(randomQuestion);
  if (!excludeHashes.includes(questionHash)) {
    excludeHashes.push(questionHash);
  }
  
  return {
    category: randomCategory,
    question: randomQuestion.question,
    options: randomQuestion.options,
    answer: randomQuestion.answer
  };
}

// Simple hash function for question deduplication
function hashQuestion(q) {
  return q.question + "|" + q.answer;
}
