/* SPDX-License-Identifier: GPL-3.0-or-later — interface for orientation pilot */
(()=>{
'use strict';
const lib=window.MathDojoOrientation;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const math=s=>(typeof window!=='undefined'&&window.MathDojoMath)?window.MathDojoMath.textHTML(s):esc(s).replace(/²/g,'<sup>2</sup>');
const params=new URLSearchParams(location.search);
let topic=lib.topics[params.get('topic')]?params.get('topic'):'calculations';
let questions=[],position=0,selected=null,solved=false,attempts=0,helped=false,first=0,needs=[],phaseStats={};
function view(name){for(const id of ['intro','practice','results'])$(id).classList.toggle('hidden',id!==name);}
function curatedLink(){ $('curated-link').href='strategy_library.html?topic='+encodeURIComponent(topic); $('try-curated').href='strategy_library.html?topic='+encodeURIComponent(topic); }
function modeButtons(){const root=$('topic-buttons');root.replaceChildren();for(const [id,t] of Object.entries(lib.topics)){const b=document.createElement('button');b.type='button';b.className='topic-option'+(id===topic?' current':'');b.textContent=t.title;b.setAttribute('aria-pressed',String(id===topic));b.addEventListener('click',()=>{topic=id;modeButtons();$('subject-detail').textContent=lib.topics[topic].intro;$('regular-link').href=lib.topics[topic].regular;$('regular-link').textContent='Обычная тренировка: '+lib.topics[topic].title;curatedLink();});root.append(b);}}
function firstScreen(){modeButtons();curatedLink();$('subject-detail').textContent=lib.topics[topic].intro;$('regular-link').href=lib.topics[topic].regular;$('regular-link').textContent='Обычная тренировка: '+lib.topics[topic].title;view('intro');}
function start(){questions=lib.session(topic,10);position=0;first=0;needs=[];phaseStats={};view('practice');render();}
function notice(message,kind){$('feedback').className='feedback '+kind;$('feedback').textContent=message;}
function render(){const q=questions[position];attempts=0;helped=false;solved=false;selected=null;
 $('progress-label').textContent=`Вопрос ${position+1} из ${questions.length}`;$('progress-help').textContent=lib.phases[q.phase];$('progress-fill').style.width=`${position/questions.length*100}%`;
 $('stage-title').textContent=lib.phases[q.phase];if(window.MathDojoMath){window.MathDojoMath.render($('prompt'),q.question,q.questionLatex);window.MathDojoMath.render($('formula'),q.math,q.mathLatex);}else{$('prompt').textContent=q.question;$('formula').innerHTML=math(q.math);}
 const list=$('variants');list.replaceChildren();for(const opt of q.options){const b=document.createElement('button');b.type='button';b.className='choice';b.setAttribute('aria-pressed','false');b.dataset.id=opt.id;
 const label=document.createElement('span');if(window.MathDojoMath)window.MathDojoMath.render(label,opt.label,opt.latex);else label.innerHTML=math(opt.label);b.append(label);
 b.addEventListener('click',()=>{if(solved)return;selected=opt.id;[...list.children].forEach(el=>{el.classList.remove('wrong');const chosen=el===b;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen));});});list.append(b);}
 $('feedback').className='feedback hidden';$('feedback').textContent='';$('explanation').classList.add('hidden');$('explanation').textContent='';$('hint-message').classList.add('hidden');$('reveal').classList.add('hidden');$('hint').disabled=false;$('skip').classList.remove('hidden');$('next').textContent='Проверить выбор';$('regular-after').classList.add('hidden');$('regular-after').href=lib.topics[topic].regular;
 }
function complete(ok){if(solved)return;const q=questions[position];solved=true;if(ok&&attempts===1&&!helped)first++;else needs.push({q:q.math,phase:q.phase});
 if(!phaseStats[q.phase])phaseStats[q.phase]={total:0,independent:0};phaseStats[q.phase].total++;if(ok&&attempts===1&&!helped)phaseStats[q.phase].independent++;
 for(const child of $('variants').children){child.disabled=true;if(child.dataset.id===q.correct)child.classList.add('correct');}
 if(window.MathDojoMath)window.MathDojoMath.render($('explanation'),q.explain,q.explainLatex);else $('explanation').textContent=q.explain;$('explanation').classList.remove('hidden');$('hint').disabled=true;$('reveal').classList.add('hidden');$('skip').classList.add('hidden');$('next').textContent=position===questions.length-1?'К результатам':'Следующий вопрос';$('regular-after').classList.remove('hidden');
 if(!ok)notice('Открой разбор и сравни его со своим ходом мысли.','neutral');}
function check(){if(solved){position++;if(position>=questions.length)end();else render();return;}
 if(selected===null){notice('Сначала выбери один из вариантов. Можно воспользоваться подсказкой.','neutral');return;}
 const q=questions[position];attempts++;const picked=q.options.find(o=>o.id===selected);
 if(picked.id===q.correct){notice('Подходит. Теперь посмотри, почему именно это действие оправдано.','good');complete(true);return;}
 notice(picked.feedback,'bad');// feedback is specific to the selected misconception; the learner may retry
 $('reveal').classList.remove('hidden');
 [...$('variants').children].forEach(el=>el.classList.toggle('wrong',el.dataset.id===selected));
}
function reveal(){if(solved)return;complete(false);}
function hint(){if(solved)return;helped=true;if(window.MathDojoMath)window.MathDojoMath.render($('hint-message'),questions[position].hint,questions[position].hintLatex);else $('hint-message').textContent=questions[position].hint;$('hint-message').classList.remove('hidden');}
function end(){view('results');$('progress-fill').style.width='100%';$('total-independent').textContent=`${first} из ${questions.length}`;
 const phases=Object.entries(phaseStats).map(([key,v])=>({key,title:lib.phases[key],...v}));
 const priorities=phases.filter(v=>v.independent<v.total).sort((a,b)=> (a.independent/a.total)-(b.independent/b.total));
 $('results-lead').textContent='Это пробный режим ориентировки в задачах. Здесь важно не число баллов, а то, в какой момент понадобилась помощь.';
 $('results-notes').replaceChildren();if(priorities.length===0){const p=document.createElement('p');p.textContent='Все вопросы решены самостоятельно с первой попытки. Попробуй теперь обычные задания без вариантов действий.';$('results-notes').append(p);}else{
 const title=document.createElement('strong');title.textContent='Что полезно потренировать';$('results-notes').append(title);
 for(const item of priorities){const p=document.createElement('p');p.textContent=`${item.title}: самостоятельно ${item.independent} из ${item.total}.`;$('results-notes').append(p);}}
 $('try-regular').href=lib.topics[topic].regular;
}
$('start').addEventListener('click',start);$('next').addEventListener('click',check);$('hint').addEventListener('click',hint);$('reveal').addEventListener('click',reveal);$('skip').addEventListener('click',reveal);$('repeat').addEventListener('click',start);$('back-to-start').addEventListener('click',firstScreen);
$('return-to-setup').addEventListener('click',firstScreen);
document.addEventListener('keydown',e=>{if($('practice').classList.contains('hidden')||solved||e.altKey||e.ctrlKey||e.metaKey)return;if(['1','2','3','4'].includes(e.key)){const b=$('variants').children[Number(e.key)-1];if(b)b.click();}else if(e.key==='Enter')check();});
firstScreen();
})();
