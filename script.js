let current = 0;
let phrases = [];
let filteredPhrases = [];

let level = 1;
let exp = 0;
const maxExp = 25;

const levelSound = new Audio("./audio/levelup.mp3");

// --------------------
// シャッフル
// --------------------
function shuffle(arr) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

// --------------------
// JSON読み込み
// --------------------
async function loadPhrases() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    phrases = shuffle(data);

    filteredPhrases = phrases; // 初期状態は全部
    current = 0;

    initTagFilter(); // ←タグ生成
    updateText();

  } catch (error) {
    console.error(error);
    alert("データ読み込みエラー");
  }
}

// --------------------
// タグフィルタ初期化
// --------------------
function initTagFilter() {

  const select = document.getElementById("tagFilter");

  if (!select) return;

  const tags = [...new Set(phrases.map(p => p.tag))];

  tags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    select.appendChild(option);
  });
}

// --------------------
// タグ変更
// --------------------
document.addEventListener("DOMContentLoaded", function () {

  const select = document.getElementById("tagFilter");

  if (select) {
    select.addEventListener("change", function () {

      const tag = this.value;

      if (tag === "all") {
        filteredPhrases = phrases;
      } else {
        filteredPhrases = phrases.filter(p => p.tag === tag);
      }

      current = 0;
      updateText();
    });
  }
});

// --------------------
// 画面更新
// --------------------
function updateText() {

  if (!filteredPhrases.length) return;

  const frontMeaningEl =
    document.getElementById("frontMeaning");

  const backPhraseEl =
    document.getElementById("backPhrase");

  const backZhuyinEl =
    document.getElementById("backZhuyin");

  const backPinyinEl =
    document.getElementById("backPinyin");

  const backMeaningEl =
    document.getElementById("backMeaning");

  const tagEl =
    document.getElementById("tag");

  const word = filteredPhrases[current];

  tagEl.innerText = word.tag;

  frontMeaningEl.innerText = word.meaning;

  backPhraseEl.innerText = word.text;
  backZhuyinEl.innerText = word.zhuyin;
  backPinyinEl.innerText = word.pinyin;
  backMeaningEl.innerText = word.meaning;

  const savedWords =
    JSON.parse(localStorage.getItem("savedWords")) || [];

  const exists =
    savedWords.some(w => w.text === word.text);

  setSaveButton(exists);

}





// --------------------
// 次へ
// --------------------
document.getElementById("nextBtn").addEventListener("click", function () {

  if (reviewMode) {
    nextReview();
    return;
  }

  // 単語切り替え
  current++;

  if (current >= filteredPhrases.length) {
    current = 0;
  }

  // 経験値追加
  exp++;

  
  // レベルアップ判定
  if (exp >= maxExp) {

  level++;

  exp = 0;

  // レベルアップ音
  levelSound.currentTime = 0;
  levelSound.play();

  // エフェクト
  const bar = document.getElementById("progressBar");

  bar.classList.add("level-up-effect");

  setTimeout(() => {
    bar.classList.remove("level-up-effect");
  }, 2000);

  unlockSticker();
  }

  // カード戻す
  flashcard.classList.remove("flipped");
  flipBtn.textContent = "答えを見る";

  // 更新
  updateText();
  updateProgress();

});


// --------------------
// Levelup
// --------------------
function updateProgress(){

  const levelText =
    document.getElementById("levelText");

  const progressText =
    document.getElementById("progressText");

  const progressFill =
    document.getElementById("progressFill");

  


  levelText.textContent = `Lv.${level}`;

  progressText.textContent =
    `${exp}/${maxExp}`;

  const percent =
    (exp / maxExp) * 100;

  progressFill.style.width =
    `${percent}%`;
}


// --------------------
// 音声再生
// --------------------
document.getElementById("playBtn").addEventListener("click", function () {

  if (!filteredPhrases.length) return;

  speechSynthesis.cancel();

  const word = filteredPhrases[current];

  const utterance = new SpeechSynthesisUtterance(word.text);

  utterance.lang = "zh-CN";

  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.includes("zh"));

  if (voice) {
    utterance.voice = voice;
  }

  speechSynthesis.speak(utterance);
});

// --------------------
// 初期化
// --------------------
document.addEventListener("DOMContentLoaded", function () {
  loadPhrases();
  renderSavedWords();
});

// --------------------
// 保存
// --------------------
document.getElementById("saveBtn").addEventListener("click", function () {

  const word = filteredPhrases[current];

  let savedWords =
    JSON.parse(localStorage.getItem("savedWords")) || [];

  const exists = savedWords.some(w => w.text === word.text);

  // すでに保存済みなら削除（トグル仕様）
  if (exists) {

    savedWords = savedWords.filter(w => w.text !== word.text);

    localStorage.setItem("savedWords", JSON.stringify(savedWords));

    setSaveButton(false); // 色リセット

  } else {

    const newWord = {
      ...word
    };

    savedWords.push(newWord);

    localStorage.setItem("savedWords", JSON.stringify(savedWords));

    setSaveButton(true); // 黄色
  }

  renderSavedWords();
});


// --------------------
// 保存単語定義
// --------------------
function showPhrase(word) {
  document.getElementById("backPhrase").textContent = word.text;
  document.getElementById("backZhuyin").textContent = word.zhuyin;
  document.getElementById("backPinyin").textContent = word.pinyin;
  document.getElementById("backMeaning").textContent = word.meaning;

  document.getElementById("frontMeaning").textContent = word.meaning;
  document.getElementById("tag").textContent = word.tag;
}


// --------------------
// 保存ボタン色変更
// --------------------
function setSaveButton(isSaved) {
  const btn = document.getElementById("saveBtn");

  if (isSaved) {
    btn.style.backgroundColor = "#F5B5B8";
  } else {
    btn.style.backgroundColor = "";
  }
}






// --------------------
// 覚えたボタン処理
// --------------------
document.getElementById("masterBtn")
.addEventListener("click", function(){

  const word = reviewMode
    ? reviewWords[reviewIndex]
    : filteredPhrases[current];

  // savedWords取得
  let savedWords =
    JSON.parse(localStorage.getItem("savedWords")) || [];

  // masteredWords取得
  let masteredWords =
    JSON.parse(localStorage.getItem("masteredWords")) || [];

  // savedWordsから削除
  savedWords =
    savedWords.filter(w => w.text !== word.text);

  // masteredに追加
  masteredWords.push(word);

  // 保存
  localStorage.setItem(
    "savedWords",
    JSON.stringify(savedWords)
  );

  localStorage.setItem(
    "masteredWords",
    JSON.stringify(masteredWords)
  );

  renderSavedWords();

  if(reviewMode){

  reviewWords =
    reviewWords.filter(w => w.text !== word.text);

  if(reviewWords.length === 0){
    alert("復習完了");
    exitReviewMode();
    return;
  }

  if(reviewIndex >= reviewWords.length){
    reviewIndex = 0;
  }

  showReviewWord();
}

});

// --------------------
// 復習
// --------------------
let reviewMode = false;
let reviewIndex = 0;
let reviewWords = [];

// --------------------
// 復習単語取得
// --------------------
function getReviewWords() {
  return JSON.parse(localStorage.getItem("savedWords")) || [];
}


// --------------------
// 復習スタート
// --------------------
document.getElementById("reviewCard").addEventListener("click", function () {

  reviewWords = getReviewWords();

  if (reviewWords.length === 0) {
    alert("復習する単語がありません");
    return;
  }

  reviewMode = true;
  reviewIndex = 0;

  showReviewWord();
});

// --------------------
// 復習終了
// --------------------
function showReviewWord() {

  const word = reviewWords[reviewIndex];

  if (!word) return;

  showPhrase(word);

  const savedWords = JSON.parse(localStorage.getItem("savedWords")) || [];
  const exists = savedWords.some(w => w.text === word.text);

  setSaveButton(exists);
}

function exitReviewMode() {
  reviewMode = false;
  reviewIndex = 0;
  setSaveButton(false);
  updateText(); // ←これ
}


function nextReview() {

  if (reviewMode) {

    reviewIndex++;

    if (reviewIndex >= reviewWords.length) {
      alert("復習完了");
      exitReviewMode();
      return;
    }

    showReviewWord();
    return;
  }

  current++;

  if (current >= filteredPhrases.length) {
    current = 0;
  }

  flashcard.classList.remove("flipped");
  flipBtn.textContent = "答えを見る";

  updateText();
}

// --------------------
// 保存一覧
// --------------------
function renderSavedWords() {

  const savedList = document.getElementById("savedList");
  savedList.innerHTML = "";

  const savedWords =
    JSON.parse(localStorage.getItem("savedWords")) || [];

  savedWords.forEach(function (word) {

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="saved-row">

        <span class="col-word">${word.text}</span>
        <span class="col-zhuyin">${word.zhuyin}</span>
        <span class="col-pinyin">${word.pinyin}</span>
        <span class="col-meaning">${word.meaning}</span>

        <button class="delete-btn" data-text="${word.text}">
          🗑
        </button>

      </div>
    `;

    savedList.appendChild(li);
  });
}


// --------------------
// 削除
// --------------------
document.getElementById("savedList").addEventListener("click", function (e) {

  if (!e.target.classList.contains("delete-btn")) return;

  const text = e.target.dataset.text;

  let savedWords =
    JSON.parse(localStorage.getItem("savedWords")) || [];

  savedWords = savedWords.filter(word => word.text !== text);

  localStorage.setItem("savedWords", JSON.stringify(savedWords));

  renderSavedWords();
});

// --------------------
// 音
// --------------------
const sound = new Audio("./audio/click.mp3");

const buttons = [
  document.getElementById("flipBtn"),
  document.getElementById("playBtn"),
  document.getElementById("nextBtn"),
  document.getElementById("saveBtn"),
  document.getElementById("masterBtn"),
  document.getElementById("reviewCard")
];

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    sound.currentTime = 0;
    sound.play();
  });
});

// --------------------
// Flipcard
// --------------------
const flashcard = document.getElementById("flashcard");
const flipBtn = document.getElementById("flipBtn");

flipBtn.addEventListener("click", () => {
  flashcard.classList.toggle("flipped");

  if (flashcard.classList.contains("flipped")) {
    flipBtn.textContent = "単語に戻る";
  } else {
    flipBtn.textContent = "答えを見る";
  }
});

let currentLevel = 1;

const stickers = document.querySelectorAll(".sticker");
const levelText = document.getElementById("level");
const unlockText = document.getElementById("unlockText");
const button = document.getElementById("levelUpBtn");


//ステッカー解放
function updateStickers(){

  // 偶数レベルごとに1個解放
  const unlockedCount = Math.floor(currentLevel / 2);

  stickers.forEach((sticker,index)=>{

    if(index < unlockedCount){
      sticker.classList.remove("locked");
      sticker.classList.add("unlocked");
    }else{
      sticker.classList.add("locked");
      sticker.classList.remove("unlocked");
    }

  });

  if(unlockedCount < 12){
    const nextLevel = (unlockedCount + 1) * 2;
    unlockText.textContent = `Lv${nextLevel}で次のステッカー解放`;
  }else{
    unlockText.textContent = "🎉 コンプリート！";
  }
}

button.addEventListener("click",()=>{

  currentLevel++;
  levelText.textContent = currentLevel;

  updateStickers();

});

updateStickers();

function unlockSticker() {

  const stickers = document.querySelectorAll(".sticker");

  const unlockedCount = Math.floor(level / 2);

  stickers.forEach((sticker, index) => {

    if (index < unlockedCount) {
      sticker.classList.remove("locked");
      sticker.classList.add("unlocked");
    }

  });
}
