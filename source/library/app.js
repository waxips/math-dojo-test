/* SPDX-License-Identifier: GPL-3.0-or-later — Math Dojo manually curated strategy library */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inlineMath=s=>window.MathDojoMath?window.MathDojoMath.textHTML(s):escapeHtml(s).replace(/²/g,'<sup>2</sup>');
const mathRender=(el,txt,latex)=>window.MathDojoMath?window.MathDojoMath.render(el,txt,latex):el.textContent=txt;
const clone=x=>JSON.parse(JSON.stringify(x));
let bank=clone(window.MathDojoCuratedData), chosen=new Set(), page=0, questions=[], index=0;
let selected=null, solved=false, attempts=0, helped=false, independent=0, stats={}, completed=[];
const urlTopic=new URLSearchParams(location.search).get('topic');
function labelTopic(t){return bank.topics[t]||t;}
function labelSkill(s){return bank.skills[s]||s;}
function labelDifficulty(d){return bank.difficulties[String(d)]||`Уровень ${d}`;}
function view(name){for(const id of ['catalog','practice','results'])$(id).classList.toggle('hidden',name!==id);window.scrollTo?.(0,0);}
function fillSelect(id,entries,previous){const el=$(id);const first=el.options[0]?.cloneNode(true);el.replaceChildren();if(first)el.append(first);for(const [value,title] of entries){const opt=document.createElement('option');opt.value=value;opt.textContent=title;el.append(opt);}el.value=entries.some(([v])=>v===previous)?previous:'all';}
function filterChoices(keep=true){const t=keep?$('filter-topic').value:'all';const s=keep?$('filter-skill').value:'all';const d=keep?$('filter-difficulty').value:'all';
 fillSelect('filter-topic',Object.keys(bank.topics).sort((a,b)=>labelTopic(a).localeCompare(labelTopic(b),'ru')).map(v=>[v,labelTopic(v)]),t);
 fillSelect('filter-skill',Object.keys(bank.skills).sort((a,b)=>labelSkill(a).localeCompare(labelSkill(b),'ru')).map(v=>[v,labelSkill(v)]),s);
 fillSelect('filter-difficulty',[...new Set(bank.questions.map(q=>q.difficulty))].sort((a,b)=>a-b).map(v=>[String(v),labelDifficulty(v)]),d);
}
function getFiltered(){const topic=$('filter-topic').value,skill=$('filter-skill').value,difficulty=$('filter-difficulty').value;
 const s=$('filter-query').value.toLocaleLowerCase('ru').replace(/ё/g,'е').trim();const key=$('filter-sort').value;const desc=key.endsWith('_desc');const field=key.replace('_desc','');
 return bank.questions.filter(q=>(topic==='all'||q.topic===topic)&&(skill==='all'||q.skill===skill)&&(difficulty==='all'||String(q.difficulty)===difficulty)&&(!s||[q.id,q.question,q.expression,labelTopic(q.topic),labelSkill(q.skill)].join(' ').toLocaleLowerCase('ru').replace(/ё/g,'е').includes(s))).sort((a,b)=>{let v;if(field==='difficulty')v=a.difficulty-b.difficulty;else if(field==='topic')v=labelTopic(a.topic).localeCompare(labelTopic(b.topic),'ru')||a.id.localeCompare(b.id);else if(field==='skill')v=labelSkill(a.skill).localeCompare(labelSkill(b.skill),'ru')||a.id.localeCompare(b.id);else v=a.id.localeCompare(b.id,undefined,{numeric:true});return desc?-v:v;});
}
function updateChosen(){const selectedCount=chosen.size;$('chosen-counter').textContent=selectedCount?`Отмечено: ${selectedCount}`:'Ничего не отмечено';}
function renderBank(){const all=getFiltered(),size=Number($('page-size').value);page=Math.max(0,Math.min(page,Math.max(0,Math.ceil(all.length/size)-1)));const rows=all.slice(page*size,(page+1)*size);const root=$('bank-rows');root.replaceChildren();
 if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='Ничего не найдено. Измени фильтры или поисковый запрос.';tr.append(td);root.append(tr);}
 for(const q of rows){const tr=document.createElement('tr');const td1=document.createElement('td'),ch=document.createElement('input');ch.type='checkbox';ch.checked=chosen.has(q.id);ch.setAttribute('aria-label',`Добавить задание ${q.id} в подборку`);ch.addEventListener('change',()=>{if(ch.checked)chosen.add(q.id);else chosen.delete(q.id);updateChosen();});td1.append(ch);tr.append(td1);
 for(const value of [q.id,labelTopic(q.topic),labelSkill(q.skill),labelDifficulty(q.difficulty)]){const td=document.createElement('td');if(value===labelDifficulty(q.difficulty)){const tag=document.createElement('span');tag.className='level-tag';tag.textContent=value;td.append(tag);}else{td.textContent=value;}tr.append(td);}
 const td=document.createElement('td');td.innerHTML=`<strong></strong><span style="display:block;margin-top:4px"></span>`;mathRender(td.querySelector('strong'),q.expression,q.expressionLatex);mathRender(td.querySelector('span'),q.question,q.questionLatex);tr.append(td);root.append(tr);}
 $('page-label').textContent=`${all.length? page*size+1:0}–${Math.min((page+1)*size,all.length)} из ${all.length}`;$('prev-page').disabled=page===0;$('next-page').disabled=(page+1)*size>=all.length;
 $('library-count').textContent=`${bank.questions.length} заданий в библиотеке · показано ${all.length}`;updateChosen();}
function showMessage(s){$('catalog-message').textContent=s;$('catalog-message').classList.toggle('hidden',!s);}
function orderSession(){const all=getFiltered(),map=new Map(bank.questions.map(q=>[q.id,q]));const source=chosen.size?all.filter(q=>chosen.has(q.id)).concat([...chosen].filter(id=>!all.some(q=>q.id===id)).map(id=>map.get(id)).filter(Boolean)):all;
 if(!source.length){showMessage(chosen.size?'Отмеченные задания не найдены. Сними отметки и попробуй ещё раз.':'Ни одного задания не найдено. Измени фильтры.');return null;}
 const rows=source.slice();if($('session-order').value==='mixed'){for(let i=rows.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}}
 const limit=$('session-limit').value;return limit==='all'?rows:rows.slice(0,Number(limit));}
function quickStart(){const topic=$('quick-topic').value;
 const picked=bank.questions.filter(q=>topic==='all'||q.topic===topic);
 if(!picked.length){$('quick-count').textContent='В выбранной теме пока нет вопросов.';return;}
 questions=picked.slice();for(let i=questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]];}
 start(true);
}
function start(useExisting=false){if(!useExisting){const picked=orderSession();if(!picked)return;questions=picked;}else if(!questions.length)return;
 index=0;independent=0;stats={};completed=[];view('practice');renderQuestion();}
function notice(message,kind='neutral'){$('feedback').className=`feedback ${kind}`;$('feedback').textContent=message;}
function renderQuestion(){const q=questions[index];selected=null;solved=false;attempts=0;helped=false;
 $('progress-label').textContent=`Вопрос ${index+1} из ${questions.length}`;$('progress-help').textContent=`${q.id} · ${labelSkill(q.skill)}`;$('progress-fill').style.width=`${100*index/questions.length}%`;
 $('stage-title').textContent=`${labelTopic(q.topic)} · ${labelSkill(q.skill)} · ${labelDifficulty(q.difficulty)}`;mathRender($('prompt'),q.question,q.questionLatex);mathRender($('formula'),q.expression,q.expressionLatex);
 const opts=q.options.slice();for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}
 const list=$('variants');list.replaceChildren();for(const opt of opts){const b=document.createElement('button');b.type='button';b.className='choice';b.dataset.id=opt.id;b.setAttribute('aria-pressed','false');mathRender(b,opt.text,opt.latex);
 b.addEventListener('click',()=>{if(solved)return;selected=opt.id;[...list.children].forEach(node=>{const v=node===b;node.classList.toggle('selected',v);node.classList.remove('wrong');node.setAttribute('aria-pressed',String(v));});});list.append(b);}
 $('feedback').className='feedback hidden';$('feedback').textContent='';$('explanation').textContent='';$('explanation').classList.add('hidden');$('hint-message').textContent='';$('hint-message').classList.add('hidden');$('hint').disabled=false;$('reveal').classList.add('hidden');$('skip').classList.remove('hidden');$('next').textContent='Проверить выбор';/* Student stays in the curated layer; no accidental navigation to the pilot */}
function complete(ok){if(solved)return;solved=true;const q=questions[index],pass=ok&&attempts===1&&!helped;
 if(pass)independent++;const key=q.skill;if(!stats[key])stats[key]={total:0,independent:0};stats[key].total++;if(pass)stats[key].independent++;completed.push({id:q.id,independent:pass});
 for(const b of $('variants').children){b.disabled=true;if(b.dataset.id===q.correct)b.classList.add('correct');}
 mathRender($('explanation'),q.explanation,q.explanationLatex);$('explanation').classList.remove('hidden');$('hint').disabled=true;$('reveal').classList.add('hidden');$('skip').classList.add('hidden');$('next').textContent=index===questions.length-1?'К результатам':'Следующий вопрос';
 if(!ok)notice('Прочитай разбор: он показывает шаг, а не только готовый ответ.');}
function check(){if(solved){index++;if(index===questions.length)end();else renderQuestion();return;}
 if(!selected){notice('Выбери вариант или открой подсказку.');return;}
 const q=questions[index],pick=q.options.find(v=>v.id===selected);attempts++;
 if(selected===q.correct){notice('Этот ход обоснован. Сравни свой довод с разбором.','good');complete(true);}else{notice(pick.feedback,'bad');$('reveal').classList.remove('hidden');for(const el of $('variants').children)el.classList.toggle('wrong',el.dataset.id===selected);}}
function hint(){if(solved)return;helped=true;mathRender($('hint-message'),questions[index].hint,questions[index].hintLatex);$('hint-message').classList.remove('hidden');}
function end(){view('results');$('progress-fill').style.width='100%';$('total-independent').textContent=`${independent} из ${questions.length}`;$('results-lead').textContent='Без подсказок и повторных попыток. Это ориентир для дальнейшей практики, а не оценка способностей.';
 const root=$('results-notes');root.replaceChildren();const misses=Object.entries(stats).filter(([,s])=>s.independent<s.total);if(!misses.length){const p=document.createElement('p');p.textContent='Все вопросы разобраны самостоятельно с первого раза. Проверь теперь эти же навыки в обычных заданиях без вариантов.';root.append(p);}else{const strong=document.createElement('strong');strong.textContent='Где потребовалась поддержка';root.append(strong);for(const [key,s] of misses){const p=document.createElement('p');p.textContent=`${labelSkill(key)}: самостоятельно ${s.independent} из ${s.total}.`;root.append(p);}}
 const heading=document.createElement('p');heading.className='small';heading.textContent='Пройденные задания: '+completed.map(v=>v.id+(v.independent?'':' · с поддержкой')).join(', ');root.append(heading);}
function validBank(raw){if(!raw||!Array.isArray(raw.questions)||!raw.questions.length||!raw.topics||!raw.skills||!raw.difficulties)throw Error('Нужны questions, topics, skills и difficulties.');if(raw.questions.length>5000)throw Error('Слишком большой файл (свыше 5000 заданий).');
 const ids=new Set();for(const q of raw.questions){if(!q||!['id','topic','skill','expression','question','hint','explanation'].every(k=>typeof q[k]==='string'&&q[k].trim().length>0))throw Error('У некоторых заданий отсутствуют обязательные поля.');if(ids.has(q.id))throw Error('Дублирующийся ID: '+q.id);ids.add(q.id);if(!Number.isInteger(q.difficulty)||q.difficulty<1||q.difficulty>5)throw Error('Сложность должна быть целым числом от 1 до 5.');if(!Array.isArray(q.options)||q.options.length<2||q.options.length>4)throw Error('Каждому заданию требуется 2–4 варианта.');const opIds=q.options.map(o=>o.id);if(new Set(opIds).size!==opIds.length||!opIds.includes(q.correct))throw Error('Неправильные IDs вариантов у '+q.id);if(q.options.some(o=>typeof o.text!=='string'||!o.text.trim()||typeof o.feedback!=='string'||!o.feedback.trim()))throw Error('Отсутствуют текст или объяснение у '+q.id);if(!raw.topics[q.topic]||!raw.skills[q.skill])throw Error('Для темы и типа нужны подписи в справочниках ('+q.id+').');}
 return true;}
function downloadJson(){const blob=new Blob([JSON.stringify(bank,null,2)+'\n'],{type:'application/json;charset=utf-8'}),uri=URL.createObjectURL(blob),a=document.createElement('a');a.href=uri;a.download='math-dojo-curated-library.json';a.click();setTimeout(()=>URL.revokeObjectURL(uri),1000);}
async function importJson(file){try{if(!file)return;if(file.size>5*1024*1024)throw Error('Максимальный размер JSON — 5 МБ.');const next=JSON.parse(await file.text());validBank(next);bank=clone(next);chosen.clear();page=0;filterChoices(false);updateQuickTopics();$('filter-query').value='';renderBank();$('import-status').textContent=`Загружено ${bank.questions.length} заданий. Для постоянного обновления репозитория нужно заменить JSON в source/library и пересобрать HTML.`;}catch(err){$('import-status').textContent='Импорт отклонён: '+err.message;}finally{$('import-file').value='';}}
function sortHeader(field){const cur=$('filter-sort').value;$('filter-sort').value=cur===field?field+'_desc':field;page=0;renderBank();}
function updateQuickTopics(preferred){const el=$('quick-topic');const old=preferred||el.value;el.replaceChildren();el.add(new Option('Все темы','all'));for(const topic of Object.keys(bank.topics))el.add(new Option(labelTopic(topic),topic));el.value=bank.topics[old]?old:'all';updateQuickCount();}
function updateQuickCount(){const topic=$('quick-topic').value,n=bank.questions.filter(q=>topic==='all'||q.topic===topic).length;$('quick-count').textContent=`${n} заданий · без повторов, в случайном порядке`;}
function toggleDeveloper(){const el=$('developer-tools');const isHidden=el.classList.toggle('hidden');$('developer-toggle').setAttribute('aria-expanded',String(!isHidden));try{localStorage.setItem('mathdojo_dev',isHidden?'0':'1');}catch(e){}}
function init(){validBank(bank);filterChoices(false);if(urlTopic&&bank.topics[urlTopic]){$('filter-topic').value=urlTopic;}updateQuickTopics(urlTopic);renderBank();try{if(localStorage.getItem('mathdojo_dev')==='1')toggleDeveloper();}catch(e){}
 for(const id of ['filter-topic','filter-skill','filter-difficulty','filter-sort','page-size'])$(id).addEventListener('change',()=>{page=0;renderBank();showMessage('');});$('filter-query').addEventListener('input',()=>{page=0;renderBank();showMessage('');});
 document.querySelectorAll('[data-sort]').forEach(btn=>btn.addEventListener('click',()=>sortHeader(btn.dataset.sort)));
 $('prev-page').onclick=()=>{page--;renderBank();};$('next-page').onclick=()=>{page++;renderBank();};$('select-visible').onclick=()=>{const rows=getFiltered().slice(page*Number($('page-size').value),(page+1)*Number($('page-size').value));for(const q of rows)chosen.add(q.id);renderBank();};$('clear-selected').onclick=()=>{chosen.clear();renderBank();};
 $('quick-start').onclick=quickStart;$('quick-topic').onchange=updateQuickCount;$('developer-toggle').onclick=toggleDeveloper;
 $('start').onclick=()=>start(false);$('next').onclick=check;$('hint').onclick=hint;$('reveal').onclick=()=>complete(false);$('skip').onclick=()=>complete(false);$('back-to-library').onclick=()=>view('catalog');$('repeat').onclick=()=>start(true);$('back-to-catalog').onclick=()=>view('catalog');$('export-json').onclick=downloadJson;$('import-json').onclick=()=>$('import-file').click();$('import-file').onchange=e=>importJson(e.target.files[0]);
 document.addEventListener('keydown',e=>{if($('practice').classList.contains('hidden')||solved||e.altKey||e.ctrlKey||e.metaKey)return;if(['1','2','3','4'].includes(e.key)){const b=$('variants').children[Number(e.key)-1];b?.click();}else if(e.key==='Enter'&&e.target.tagName!=='BUTTON')check();});}
init();
})();
