
(() => {
"use strict";
const id = window.PROGRAM_ID;
const cfg = window.PROGRAMS[id];
if(!cfg){document.body.innerHTML="<p style='padding:20px'>Program configuration not found.</p>";return;}
document.documentElement.style.setProperty("--accent",cfg.accent);
const key=`learning_quest_${id}`;
const state=readJSON(key,{lessons:[],missions:{},quizScore:null,reflection:"",certificateName:""});
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

$("#programIcon").textContent=cfg.icon;
$("#programNo").textContent=`Programme ${cfg.no}`;
$("#programLevel").textContent=cfg.level;
$("#programTitle").textContent=cfg.title;
$("#programIntro").textContent=cfg.intro;
$("#programFocus").textContent=cfg.focus;
document.title=`${cfg.title} | MathToolsHub`;
$("#objectives").innerHTML=cfg.objectives.map(x=>`<div class="objective"><span class="check">✓</span><span>${esc(x)}</span></div>`).join("");
$("#learnCards").innerHTML=cfg.lessons.map((l,i)=>`
<article class="card">
<h3>${i+1}. ${esc(l.title)}</h3>
<p>${esc(l.body)}</p>
<div class="example"><strong>Example:</strong> ${esc(l.example)}</div>
<div class="lesson-actions">
<span class="lesson-done" id="lessonStatus${i}"></span>
<button class="primary lesson-btn" data-i="${i}" type="button">Mark as learned</button>
</div>
</article>`).join("");
$("#missionList").innerHTML=cfg.missions.map((m,i)=>`
<article class="card mission-card">
<h3>Mission ${i+1}</h3><p>${esc(m.question)}</p>
<div class="options">${m.options.map((o,j)=>`<button class="option mission-option" data-mi="${i}" data-oi="${j}" type="button">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join("")}</div>
<div class="feedback" id="missionFeedback${i}"></div>
</article>`).join("");
$("#quizForm").innerHTML=cfg.quiz.map((q,i)=>`
<fieldset class="quiz-item"><legend>${i+1}. ${esc(q.q)}</legend>
${q.options.map((o,j)=>`<label class="choice"><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join("")}
</fieldset>`).join("");
$("#reflection").value=state.reflection||"";

$$(".nav button").forEach(b=>b.addEventListener("click",()=>showSection(b.dataset.section,b)));
$$(".lesson-btn").forEach(b=>b.addEventListener("click",()=>completeLesson(Number(b.dataset.i))));
$$(".mission-option").forEach(b=>b.addEventListener("click",()=>answerMission(Number(b.dataset.mi),Number(b.dataset.oi))));
$("#submitQuiz").addEventListener("click",submitQuiz);
$("#resetProgram").addEventListener("click",resetProgram);
$("#reflection").addEventListener("input",e=>{state.reflection=e.target.value;save();updateProgress()});
$("#downloadNotes").addEventListener("click",downloadNotes);
$("#printCertificate").addEventListener("click",printCertificate);
$("#certificateName").value=state.certificateName||"";
$("#certificateName").addEventListener("input",e=>{state.certificateName=e.target.value;save()});
$("#homeLink").href="../index.html";

restoreUI();
updateProgress();

function showSection(id,btn){
 $$(".section").forEach(s=>s.classList.toggle("active",s.id===id));
 $$(".nav button").forEach(x=>x.classList.toggle("active",x===btn));
 window.scrollTo({top:0,behavior:"smooth"});
}
function completeLesson(i){
 if(!state.lessons.includes(i))state.lessons.push(i);
 save();restoreUI();updateProgress();
}
function answerMission(mi,oi){
 if(state.missions[mi]!==undefined)return;
 const m=cfg.missions[mi];
 state.missions[mi]=oi;
 const buttons=$$(`[data-mi="${mi}"]`);
 buttons.forEach((b,j)=>{b.disabled=true;if(j===m.answer)b.classList.add("correct");else if(j===oi)b.classList.add("wrong")});
 $(`#missionFeedback${mi}`).textContent=(oi===m.answer?"Correct. ":"Try again next time. ")+m.feedback;
 save();updateProgress();
}
function submitQuiz(){
 let score=0,answered=0;
 cfg.quiz.forEach((q,i)=>{const selected=$(`input[name="q${i}"]:checked`);if(selected){answered++;if(Number(selected.value)===q.answer)score++;}});
 if(answered<cfg.quiz.length){alert("Please answer all quiz questions.");return;}
 state.quizScore=score;
 save();
 const pct=Math.round(score/cfg.quiz.length*100);
 $("#scoreValue").textContent=`${score}/${cfg.quiz.length}`;
 $("#scorePercent").textContent=`${pct}%`;
 const badge=pct>=80?"Mastery Badge":pct>=60?"Progress Badge":"Keep Practising";
 $("#resultBadge").textContent=badge;
 $("#quizResult").style.display="block";
 updateProgress();
}
function restoreUI(){
 state.lessons.forEach(i=>{const s=$(`#lessonStatus${i}`),b=$(`.lesson-btn[data-i="${i}"]`);if(s)s.textContent="Completed ✓";if(b){b.disabled=true;b.textContent="Completed";}});
 Object.entries(state.missions).forEach(([mi,oi])=>{
   const m=cfg.missions[Number(mi)],buttons=$$(`[data-mi="${mi}"]`);
   buttons.forEach((b,j)=>{b.disabled=true;if(j===m.answer)b.classList.add("correct");else if(j===Number(oi))b.classList.add("wrong")});
   const f=$(`#missionFeedback${mi}`);if(f)f.textContent=(Number(oi)===m.answer?"Correct. ":"Review this idea. ")+m.feedback;
 });
 if(state.quizScore!==null){
   const pct=Math.round(state.quizScore/cfg.quiz.length*100);
   $("#scoreValue").textContent=`${state.quizScore}/${cfg.quiz.length}`;
   $("#scorePercent").textContent=`${pct}%`;
   $("#resultBadge").textContent=pct>=80?"Mastery Badge":pct>=60?"Progress Badge":"Keep Practising";
   $("#quizResult").style.display="block";
 }
}
function updateProgress(){
 const parts=cfg.lessons.length+cfg.missions.length+1+1;
 const done=state.lessons.length+Object.keys(state.missions).length+(state.quizScore!==null?1:0)+(state.reflection.trim()?1:0);
 const pct=Math.round(done/parts*100);
 $("#progressBar").style.width=`${pct}%`;
 $("#progressText").textContent=`${pct}% complete`;
 $("#progressDetail").textContent=`${done} of ${parts} learning tasks completed`;
 $("#topStatus").textContent=pct===100?"Programme completed":`${pct}% progress`;
 const eligible=state.quizScore!==null && state.quizScore/cfg.quiz.length>=0.6;
 $("#certificateSection").classList.toggle("active",eligible && $("#certificateSection").classList.contains("active"));
 $("#certificateStatus").textContent=eligible?"Certificate unlocked":"Score at least 60% to unlock certificate";
 $("#printCertificate").disabled=!eligible;
 $("#certificateProgramme").textContent=cfg.title;
 $("#certificateLevel").textContent=cfg.level;
 $("#certificateDate").textContent=new Date().toLocaleDateString();
}
function printCertificate(){
 const name=$("#certificateName").value.trim();
 if(!name){alert("Enter the learner's name first.");return;}
 state.certificateName=name;save();
 $("#certificateLearner").textContent=name;
 $("#certificate").classList.add("show");
 window.print();
}
function downloadNotes(){
 const blob=new Blob([`${cfg.title}\n${"=".repeat(cfg.title.length)}\n\n${state.reflection||""}`],{type:"text/plain;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=`${id}-reflection.txt`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function resetProgram(){
 if(!confirm("Reset all progress for this programme?"))return;
 localStorage.removeItem(key);location.reload();
}
function save(){localStorage.setItem(key,JSON.stringify(state))}
function readJSON(k,f){try{return {...f,...JSON.parse(localStorage.getItem(k)||"{}")}}catch{return f}}
function esc(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
})();
