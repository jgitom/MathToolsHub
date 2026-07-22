
let selectedLevel="easy",round=0,score=0,lives=3,correctCount=0,correctAnswer=null,soundOn=true,locked=false;
const $=id=>document.getElementById(id);
const startScreen=$("startScreen"),playScreen=$("playScreen"),endScreen=$("endScreen");
const scoreEl=$("score"),livesEl=$("lives"),levelLabel=$("levelLabel"),roundLabel=$("roundLabel"),progressBar=$("progressBar");
const questionEl=$("question"),answers=$("answers"),feedback=$("feedback"),tip=$("tip"),soundBtn=$("soundBtn");
const stars=$("stars"),finalMessage=$("finalMessage"),certificateScore=$("certificateScore");

document.querySelectorAll(".level-card").forEach(card=>card.addEventListener("click",()=>{
  document.querySelectorAll(".level-card").forEach(c=>c.classList.remove("selected"));
  card.classList.add("selected");selectedLevel=card.dataset.level;levelLabel.textContent=GAME.levels[selectedLevel].label;
}));
$("startBtn").addEventListener("click",startGame);$("restartBtn").addEventListener("click",startGame);
$("playAgainBtn").addEventListener("click",startGame);$("homeBtn").addEventListener("click",showHome);
soundBtn.addEventListener("click",()=>{soundOn=!soundOn;soundBtn.textContent=soundOn?"🔊 Sound On":"🔇 Sound Off"});

function startGame(){
  round=0;score=0;lives=3;correctCount=0;locked=false;
  if(GAME.onStart)GAME.onStart();updateStats();startScreen.classList.add("hidden");endScreen.classList.add("hidden");playScreen.classList.remove("hidden");nextRound();
}
function showHome(){playScreen.classList.add("hidden");endScreen.classList.add("hidden");startScreen.classList.remove("hidden")}
function nextRound(){
  const config=GAME.levels[selectedLevel];
  if(round>=config.rounds||lives<=0){finishGame();return}
  round++;locked=false;feedback.textContent="";feedback.className="feedback";
  const result=GAME.buildRound(selectedLevel);
  correctAnswer=result.answer;questionEl.textContent=result.question;tip.textContent=result.tip||GAME.defaultTip;
  renderAnswers(result.choices);roundLabel.textContent=`Round ${round} / ${config.rounds}`;progressBar.style.width=`${(round/config.rounds)*100}%`;
}
function renderAnswers(choices){
  answers.innerHTML="";
  shuffle([...new Set(choices.map(String))]).forEach(value=>{
    const b=document.createElement("button");b.className="answer-btn";b.textContent=value;b.addEventListener("click",()=>checkAnswer(value));answers.appendChild(b);
  });
}
function checkAnswer(selected){
  if(locked)return;locked=true;document.querySelectorAll(".answer-btn").forEach(b=>b.disabled=true);
  const ok=GAME.isCorrect?GAME.isCorrect(selected,correctAnswer):String(selected)===String(correctAnswer);
  if(ok){score+=selectedLevel==="hard"?15:10;correctCount++;feedback.textContent=randomChoice(GAME.success);feedback.classList.add("correct");if(GAME.onCorrect)GAME.onCorrect();playSuccess()}
  else{lives--;feedback.textContent=`Good try! The correct answer is ${GAME.displayAnswer?GAME.displayAnswer(correctAnswer):correctAnswer}.`;feedback.classList.add("wrong");if(GAME.onWrong)GAME.onWrong();playTone(180,.22)}
  updateStats();setTimeout(nextRound,1200);
}
function finishGame(){
  if(GAME.onFinish)GAME.onFinish();playScreen.classList.add("hidden");endScreen.classList.remove("hidden");
  const total=GAME.levels[selectedLevel].rounds,accuracy=Math.round(correctCount/Math.max(1,total)*100);
  if(accuracy>=80){stars.textContent="⭐⭐⭐";finalMessage.textContent=GAME.end[0]}else if(accuracy>=50){stars.textContent="⭐⭐";finalMessage.textContent=GAME.end[1]}else{stars.textContent="⭐";finalMessage.textContent=GAME.end[2]}
  certificateScore.textContent=`Final Score: ${score} points • ${accuracy}% accuracy`;playSuccess();
}
function updateStats(){scoreEl.textContent=score;livesEl.textContent=lives>0?"❤️".repeat(lives):"💔";levelLabel.textContent=GAME.levels[selectedLevel].label}
function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function randomChoice(a){return a[Math.floor(Math.random()*a.length)]}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function playSuccess(){if(!soundOn)return;playTone(523,.11);setTimeout(()=>playTone(659,.11),110);setTimeout(()=>playTone(784,.17),220)}
function playTone(f,d){if(!soundOn)return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A(),o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.setValueAtTime(.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d);o.addEventListener("ended",()=>c.close())}
