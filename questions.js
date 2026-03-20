/* ================================================================
   ThinkToWake — questions.js
   90+ static questions across Math, English, Logic, Science, Geography
   + Dynamic math generator for infinite non-repeating problems
   ================================================================ */

const questionBank = {

  math: [
    // Easy
    { question: "7 + 8 = ?",       options: ["13","14","15","16"],       answer: "15",  level: "easy" },
    { question: "15 + 27 = ?",     options: ["40","42","44","46"],       answer: "42",  level: "easy" },
    { question: "56 + 44 = ?",     options: ["98","100","102","104"],    answer: "100", level: "easy" },
    { question: "45 - 18 = ?",     options: ["25","27","29","23"],       answer: "27",  level: "easy" },
    { question: "63 - 29 = ?",     options: ["32","34","36","38"],       answer: "34",  level: "easy" },
    { question: "100 - 37 = ?",    options: ["61","63","65","67"],       answer: "63",  level: "easy" },
    { question: "34 + 58 = ?",     options: ["88","90","92","94"],       answer: "92",  level: "easy" },
    { question: "81 - 46 = ?",     options: ["33","35","37","39"],       answer: "35",  level: "easy" },
    { question: "17 + 35 = ?",     options: ["50","52","54","56"],       answer: "52",  level: "easy" },
    { question: "70 - 24 = ?",     options: ["44","46","48","50"],       answer: "46",  level: "easy" },
    // Medium
    { question: "8 × 7 = ?",       options: ["54","56","58","52"],       answer: "56",  level: "medium" },
    { question: "9 × 6 = ?",       options: ["52","54","56","58"],       answer: "54",  level: "medium" },
    { question: "12 × 3 = ?",      options: ["24","36","30","18"],       answer: "36",  level: "medium" },
    { question: "11 × 11 = ?",     options: ["111","121","131","141"],   answer: "121", level: "medium" },
    { question: "72 ÷ 8 = ?",      options: ["7","8","9","10"],          answer: "9",   level: "medium" },
    { question: "64 ÷ 4 = ?",      options: ["14","16","18","20"],       answer: "16",  level: "medium" },
    { question: "7 × 13 = ?",      options: ["84","88","91","96"],       answer: "91",  level: "medium" },
    { question: "144 ÷ 12 = ?",    options: ["10","11","12","13"],       answer: "12",  level: "medium" },
    { question: "6 × 14 = ?",      options: ["78","80","82","84"],       answer: "84",  level: "medium" },
    { question: "96 ÷ 8 = ?",      options: ["10","11","12","13"],       answer: "12",  level: "medium" },
    // Hard
    { question: "17 × 8 = ?",      options: ["126","132","136","144"],   answer: "136", level: "hard" },
    { question: "225 ÷ 15 = ?",    options: ["13","14","15","16"],       answer: "15",  level: "hard" },
    { question: "23 × 7 = ?",      options: ["151","157","161","167"],   answer: "161", level: "hard" },
    { question: "256 ÷ 16 = ?",    options: ["14","15","16","17"],       answer: "16",  level: "hard" },
    { question: "35 × 12 = ?",     options: ["400","410","420","430"],   answer: "420", level: "hard" },
    { question: "√144 = ?",        options: ["10","11","12","13"],       answer: "12",  level: "hard" },
    { question: "√169 = ?",        options: ["11","12","13","14"],       answer: "13",  level: "hard" },
    { question: "2³ + 3² = ?",     options: ["15","17","19","21"],       answer: "17",  level: "hard" },
    { question: "15% of 200 = ?",  options: ["25","30","35","40"],       answer: "30",  level: "hard" },
    { question: "125 × 4 = ?",     options: ["480","490","500","510"],   answer: "500", level: "hard" }
  ],

  english: [
    // Antonyms — easy
    { question: "Opposite of 'early'?",       options: ["late","fast","soon","quick"],           answer: "late",       level: "easy" },
    { question: "Opposite of 'ancient'?",     options: ["old","new","young","modern"],           answer: "modern",     level: "easy" },
    { question: "Opposite of 'accept'?",      options: ["agree","refuse","allow","permit"],      answer: "refuse",     level: "easy" },
    { question: "Opposite of 'artificial'?",  options: ["fake","synthetic","natural","man-made"],answer: "natural",    level: "easy" },
    { question: "Opposite of 'expand'?",      options: ["grow","shrink","widen","spread"],       answer: "shrink",     level: "easy" },
    { question: "Opposite of 'courage'?",     options: ["fear","cowardice","doubt","worry"],     answer: "cowardice",  level: "easy" },
    { question: "Opposite of 'victory'?",     options: ["loss","defeat","draw","fail"],          answer: "defeat",     level: "easy" },
    // Antonyms — medium/hard
    { question: "Opposite of 'transparent'?", options: ["clear","opaque","shiny","glossy"],      answer: "opaque",     level: "medium" },
    { question: "Opposite of 'frugal'?",      options: ["cheap","thrifty","wasteful","careful"], answer: "wasteful",   level: "medium" },
    { question: "Opposite of 'benevolent'?",  options: ["kind","generous","malevolent","caring"],answer: "malevolent", level: "hard" },
    // Synonyms — easy
    { question: "Synonym of 'happy'?",        options: ["sad","angry","joyful","tired"],         answer: "joyful",     level: "easy" },
    { question: "Synonym of 'brave'?",        options: ["cowardly","fearless","weak","timid"],   answer: "fearless",   level: "easy" },
    { question: "Synonym of 'begin'?",        options: ["end","start","stop","finish"],          answer: "start",      level: "easy" },
    { question: "Synonym of 'quiet'?",        options: ["loud","silent","noisy","busy"],         answer: "silent",     level: "easy" },
    { question: "Synonym of 'angry'?",        options: ["calm","furious","happy","tired"],       answer: "furious",    level: "easy" },
    { question: "Synonym of 'large'?",        options: ["small","tiny","huge","narrow"],         answer: "huge",       level: "easy" },
    { question: "Synonym of 'rapid'?",        options: ["slow","swift","lazy","careful"],        answer: "swift",      level: "easy" },
    // Synonyms — medium/hard
    { question: "Synonym of 'clever'?",       options: ["dull","foolish","intelligent","careless"],answer: "intelligent",level: "medium" },
    { question: "Synonym of 'melancholy'?",   options: ["happy","joyful","sad","excited"],       answer: "sad",        level: "medium" },
    { question: "Synonym of 'ephemeral'?",    options: ["permanent","eternal","brief","lasting"],answer: "brief",      level: "hard" },
    // Word meaning
    { question: "'Nocturnal' means active…?", options: ["at dawn","at dusk","at night","at noon"],answer: "at night",  level: "medium" },
    { question: "'Arid' describes what climate?", options: ["wet","cold","dry","windy"],         answer: "dry",        level: "medium" },
    { question: "'Verbose' means…?",          options: ["brief","concise","wordy","silent"],     answer: "wordy",      level: "hard" },
    { question: "'Lethargic' means…?",        options: ["energetic","sluggish","alert","excited"],answer: "sluggish",  level: "hard" }
  ],

  logic: [
    // Easy
    { question: "Next: 2, 4, 6, 8, ?",              options: ["9","10","11","12"],      answer: "10",  level: "easy" },
    { question: "Next: 5, 10, 15, 20, ?",            options: ["22","24","25","30"],     answer: "25",  level: "easy" },
    { question: "Next: 1, 3, 5, 7, ?",              options: ["8","9","10","11"],        answer: "9",   level: "easy" },
    { question: "Next: 10, 20, 30, 40, ?",           options: ["45","48","50","55"],     answer: "50",  level: "easy" },
    { question: "Complete: Mon, Wed, Fri, ?",        options: ["Sat","Sun","Tue","Thu"], answer: "Sun", level: "easy" },
    { question: "Complete: Spring → Summer → ? → Winter", options: ["Fall","Autumn","July","October"], answer: "Fall", level: "easy" },
    // Medium
    { question: "Next: 1, 1, 2, 3, 5, ?",           options: ["6","7","8","9"],         answer: "8",   level: "medium" },
    { question: "Next: 1, 4, 9, 16, ?",              options: ["20","25","30","36"],     answer: "25",  level: "medium" },
    { question: "Next: A, C, E, G, ?",              options: ["H","I","J","K"],          answer: "I",   level: "medium" },
    { question: "Next: 3, 6, 12, 24, ?",             options: ["36","42","48","54"],     answer: "48",  level: "medium" },
    { question: "Next: 2, 6, 18, 54, ?",             options: ["108","144","162","180"], answer: "162", level: "medium" },
    { question: "Next: 100, 91, 82, 73, ?",          options: ["60","62","64","66"],     answer: "64",  level: "medium" },
    { question: "Next: 1, 2, 4, 8, 16, ?",           options: ["24","28","32","36"],     answer: "32",  level: "medium" },
    { question: "Next: Z, Y, X, W, ?",              options: ["A","B","U","V"],          answer: "V",   level: "medium" },
    // Hard
    { question: "Next: 0, 1, 4, 9, 16, 25, ?",      options: ["30","35","36","49"],     answer: "36",  level: "hard" },
    { question: "Next: 1, 8, 27, 64, ?",             options: ["100","121","125","144"], answer: "125", level: "hard" },
    { question: "Next: 2, 3, 5, 7, 11, ?",           options: ["12","13","14","15"],     answer: "13",  level: "hard" },
    { question: "Missing: 1, ?, 9, 27, 81",          options: ["2","3","4","6"],         answer: "3",   level: "hard" },
    { question: "Next: 0, 1, 1, 2, 3, 5, 8, ?",     options: ["11","12","13","14"],     answer: "13",  level: "hard" }
  ],

  science: [
    { question: "Closest planet to the Sun?",              options: ["Venus","Earth","Mercury","Mars"],          answer: "Mercury",      level: "easy" },
    { question: "Chemical symbol for water?",              options: ["WA","HO","H2O","OHH"],                    answer: "H2O",          level: "easy" },
    { question: "What gas do plants absorb?",              options: ["Oxygen","Nitrogen","CO2","Helium"],        answer: "CO2",          level: "easy" },
    { question: "How many bones in the adult human body?", options: ["196","206","216","226"],                   answer: "206",          level: "easy" },
    { question: "pH of pure water?",                       options: ["5","6","7","8"],                          answer: "7",            level: "easy" },
    { question: "Speed of light ≈ ? km/s",                options: ["100,000","300,000","500,000","700,000"],   answer: "300,000",      level: "medium" },
    { question: "Atomic number of Carbon?",                options: ["4","6","8","12"],                         answer: "6",            level: "medium" },
    { question: "Loudness is measured in?",                options: ["Hertz","Watts","Decibels","Lumens"],       answer: "Decibels",     level: "medium" },
    { question: "Force = mass × ?",                       options: ["speed","velocity","weight","acceleration"],answer: "acceleration", level: "medium" },
    { question: "Which part of the cell contains DNA?",    options: ["Ribosome","Nucleus","Vacuole","Membrane"],answer: "Nucleus",      level: "medium" },
    { question: "Unit of electrical resistance?",          options: ["Volt","Ampere","Ohm","Watt"],              answer: "Ohm",          level: "medium" },
    { question: "Which planet has the most moons?",        options: ["Jupiter","Saturn","Uranus","Neptune"],     answer: "Saturn",       level: "hard" },
    { question: "What is the powerhouse of the cell?",     options: ["Nucleus","Ribosome","Mitochondria","Golgi"],answer: "Mitochondria",level: "easy" }
  ],

  geography: [
    { question: "Capital of Japan?",                         options: ["Seoul","Beijing","Tokyo","Bangkok"],      answer: "Tokyo",     level: "easy" },
    { question: "Largest continent?",                        options: ["Africa","Americas","Asia","Europe"],     answer: "Asia",      level: "easy" },
    { question: "Longest river in the world?",               options: ["Amazon","Congo","Yangtze","Nile"],       answer: "Nile",      level: "easy" },
    { question: "Capital of Australia?",                     options: ["Sydney","Melbourne","Canberra","Perth"], answer: "Canberra",  level: "easy" },
    { question: "Which ocean is the largest?",               options: ["Atlantic","Indian","Arctic","Pacific"],  answer: "Pacific",   level: "easy" },
    { question: "Sahara Desert is in which continent?",      options: ["Asia","Australia","Africa","S.America"], answer: "Africa",    level: "easy" },
    { question: "Mount Everest is in which mountain range?", options: ["Andes","Rockies","Alps","Himalayas"],    answer: "Himalayas", level: "easy" },
    { question: "Currency of Japan?",                        options: ["Won","Yuan","Yen","Baht"],               answer: "Yen",       level: "easy" },
    { question: "Capital of Brazil?",                        options: ["São Paulo","Rio","Brasília","Salvador"], answer: "Brasília",  level: "medium" },
    { question: "Deepest lake in the world?",                options: ["Caspian","Superior","Baikal","Titicaca"],answer: "Baikal",    level: "medium" },
    { question: "Which country has the most natural lakes?", options: ["USA","Russia","Brazil","Canada"],        answer: "Canada",    level: "medium" },
    { question: "Country with the most time zones?",         options: ["USA","China","Russia","India"],          answer: "Russia",    level: "hard" }
  ]
};

/* ----------------------------------------------------------------
   Dynamic math question generator — infinite unique problems
   ---------------------------------------------------------------- */
function generateDynamicMath(difficulty) {
  const ops   = difficulty === "easy" ? ["+", "-"]
              : difficulty === "hard" ? ["+", "-", "×", "÷"]
              : ["+", "-", "×"];
  const op    = ops[Math.floor(Math.random() * ops.length)];
  const range = difficulty === "easy" ? 20 : difficulty === "hard" ? 99 : 50;

  let a, b, answer, question;

  if (op === "+") {
    a = Math.floor(Math.random() * range) + 1;
    b = Math.floor(Math.random() * range) + 1;
    answer = a + b;
    question = `${a} + ${b} = ?`;
  } else if (op === "-") {
    a = Math.floor(Math.random() * range) + 1;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
    question = `${a} - ${b} = ?`;
  } else if (op === "×") {
    const maxF = difficulty === "hard" ? 15 : 12;
    a = Math.floor(Math.random() * maxF) + 2;
    b = Math.floor(Math.random() * maxF) + 2;
    answer = a * b;
    question = `${a} × ${b} = ?`;
  } else {
    const q = Math.floor(Math.random() * 12) + 2;
    b       = Math.floor(Math.random() * 12) + 2;
    a       = q * b;
    answer  = q;
    question = `${a} ÷ ${b} = ?`;
  }

  // Build 3 plausible wrong options
  const wrongs = new Set();
  const deltas = [1, 2, 3, 5, 10, -1, -2, -3, -5, 4, -4];
  for (const d of deltas) {
    const w = answer + d;
    if (w > 0 && w !== answer) wrongs.add(w);
    if (wrongs.size >= 3) break;
  }
  let bump = 1;
  while (wrongs.size < 3) {
    wrongs.add(answer + bump * (wrongs.size % 2 === 0 ? 1 : -1));
    bump++;
  }

  const options = [String(answer), ...[...wrongs].slice(0, 3).map(String)];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { question, options, answer: String(answer), category: "math", source: "dynamic", level: difficulty };
}

/* ----------------------------------------------------------------
   getRandomQuestion — main exported function
   ---------------------------------------------------------------- */
function getRandomQuestion(excludeHashes = [], difficulty = "medium") {
  const allCategories = Object.keys(questionBank);
  const category = allCategories[Math.floor(Math.random() * allCategories.length)];

  // Filter by difficulty
  let pool = questionBank[category].filter(q => {
    if (difficulty === "easy")  return q.level === "easy";
    if (difficulty === "hard")  return q.level === "hard" || q.level === "medium";
    return q.level === "easy" || q.level === "medium";
  });
  if (pool.length === 0) pool = questionBank[category];

  // Remove already-asked
  const fresh = pool.filter(q => !excludeHashes.includes(hashQuestion(q)));

  // If math bank exhausted, generate a fresh dynamic problem
  if (fresh.length === 0 && category === "math") {
    const dyn = generateDynamicMath(difficulty);
    const dynHash = dyn.question + "|" + dyn.answer;
    if (!excludeHashes.includes(dynHash)) excludeHashes.push(dynHash);
    return dyn;
  }

  const finalPool = fresh.length > 0 ? fresh : pool;
  const picked    = finalPool[Math.floor(Math.random() * finalPool.length)];
  const h         = hashQuestion(picked);
  if (!excludeHashes.includes(h)) excludeHashes.push(h);

  return {
    category,
    question: picked.question,
    options:  [...picked.options],
    answer:   picked.answer,
    source:   "local"
  };
}

function hashQuestion(q) {
  return q.question + "|" + q.answer;
}
