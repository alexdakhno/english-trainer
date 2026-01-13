/***********************
 * PWA (тільки якщо http/https)
 ***********************/
if (
  "serviceWorker" in navigator &&
  location.protocol !== "file:"
) {
  navigator.serviceWorker.register("sw.js");
}

/***********************
 * CONFIG
 ***********************/
const WORDS_PER_ROUND = 5;
const STORAGE_KEY = "english_trainer_words";
const STREAK_TO_LEARN = 10;

/***********************
 * STATE
 ***********************/
let level = 1;
let mode = "test"; // test | result
let round = [];

/***********************
 * INIT WORDS
 ***********************/
let words =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) ||
  WORDS.map(w => ({
    ...w,
    streak: 0,
    learned: false
  }));

/***********************
 * ELEMENTS
 ***********************/
const wordsEl = document.getElementById("words");
const learnedEl = document.getElementById("learned");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const formEl = document.getElementById("game");
const btnEl = formEl.querySelector(".btn");

/***********************
 * HELPERS
 ***********************/
function normalize(str) {
  return str.toLowerCase().trim();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function updateStats() {
  learnedEl.textContent =
    words.filter(w => w.learned).length + " learned";

  levelEl.textContent = "Level " + level;

  streakEl.textContent =
    "Max streak " +
    Math.max(0, ...words.map(w => w.streak));
}

/***********************
 * GAME LOGIC
 ***********************/
function pickWords() {
  return words
    .filter(w => !w.learned && w.level <= level)
    .sort(() => 0.5 - Math.random())
    .slice(0, WORDS_PER_ROUND);
}

function render() {
  wordsEl.innerHTML = "";
  round = pickWords();

  round.forEach((word, index) => {
    const direction = Math.random() < 0.5 ? "en" : "ua";

    const row = document.createElement("div");
    row.className = "word-row";
    row.dataset.direction = direction;
    row.word = word;

    row.innerHTML = `
      <div class="word">
        ${direction === "en" ? word.en : word.ua[0]}
      </div>
      <input type="text" data-index="${index}" autocomplete="off" />
      <div class="answer"></div>
    `;

    wordsEl.appendChild(row);
  });

  btnEl.textContent = "Перевірити";
  mode = "test";
  updateStats();
}

function checkAnswers() {
  document.querySelectorAll(".word-row").forEach(row => {
    const input = row.querySelector("input");
    const answerEl = row.querySelector(".answer");
    const word = row.word;
    const direction = row.dataset.direction;

    const userAnswer = normalize(input.value);

    const correctAnswers =
      direction === "en"
        ? word.ua.map(normalize)
        : [normalize(word.en)];

    if (correctAnswers.includes(userAnswer)) {
      input.classList.add("correct");
      word.streak++;

      if (word.streak >= STREAK_TO_LEARN) {
        word.learned = true;
      }
    } else {
      input.classList.add("wrong");
      word.streak = 0;

      answerEl.textContent =
        "✔ " +
        (direction === "en"
          ? word.ua.join(", ")
          : word.en);
    }

    input.disabled = true;
  });

  save();
  btnEl.textContent = "Далі";
  mode = "result";
}

/***********************
 * EVENTS
 ***********************/
formEl.addEventListener("submit", e => {
  e.preventDefault();

  if (mode === "test") {
    checkAnswers();
  } else {
    render();
  }
});

/***********************
 * START
 ***********************/
render();
