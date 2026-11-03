/* SPDX-License-Identifier: GPL-3.0-or-later */
(()=>{
'use strict';
const $=id=>document.getElementById(id),pick=a=>a[Math.floor(Math.random()*a.length)],ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
const norm=n=>String(n).replace(/-/g,'−');
const signed=(n)=>n>=0?` + ${n}`:` − ${-n}`;
const clean=(a,n)=>a===1?'x²':`${a}x²`;
const poly=(a,b,c=0)=>clean(a)+ (b===0?'':(b>0?` + ${b===1?'':b}x`:` − ${b===-1?'':-b}x`))+(c?signed(c):'');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const markup=s=>(typeof window!=='undefined'&&window.MathDojoMath)?window.MathDojoMath.textHTML(s):esc(s).replace(/²/g,'<sup>2</sup>').replace(/³/g,'<sup>3</sup>');
const choices=(correct,bad)=>{
 const opts=[correct,...bad.filter(x=>x!==correct)].filter((x,i,a)=>a.indexOf(x)===i);
 if(opts.length<4)throw Error('Недостаточно разных вариантов: '+correct);
 return shuffle(opts.slice(0,4));
};
const makeSquare=(i)=>{
 const n=ri(2,8),sg=pick([-1,1]),m=2*n*sg;
 const br=`(x ${sg<0?'−':'+'} ${n})²`,right=poly(1,m,n*n);
 const mode=i%4;
 if(mode===0)return {kind:'choice',question:'Как правильно раскрыть скобки?',math:`${br} = …`,correct:right,choices:choices(right,[poly(1,sg*n,n*n),poly(1,-m,n*n),poly(1,m,n),poly(1,0,n*n)]),hint:'Квадрат суммы или разности — это два одинаковых множителя. Средний член появляется дважды.',explain:`${br} = ${right}. При раскрытии скобок смешанное произведение возникает два раза.`};
 if(mode===1)return {kind:'input',question:'Какой коэффициент стоит перед x после раскрытия скобок?',math:br,correct:m,hint:`В записи (x ± ${n})² средний член равен ±2 · ${n} · x.`,explain:`${br} = ${right}. Коэффициент при x равен ${norm(m)}.`};
 if(mode===2){const expr=`(x − ${n})(x + ${n})`,ans=poly(1,0,-n*n);return {kind:'choice',question:'Как выглядит произведение после раскрытия скобок?',math:`${expr} = …`,correct:ans,choices:choices(ans,[poly(1,0,n*n),poly(1,2*n,-n*n),poly(1,0,-n),poly(1,2*n,n*n)]),hint:'Смешанные члены +nx и −nx уничтожают друг друга.',explain:`${expr} = x² − ${n*n}. Члены +${n}x и −${n}x сокращаются.`};}
 return {kind:'input',question:'Чему равен свободный член после раскрытия скобок?',math:br,correct:n*n,hint:'Свободный член — квадрат числа внутри скобок. Его знак всегда положительный.',explain:`${br} = ${right}. Свободный член равен ${n*n}.`};
};
const makeZero=(i)=>{
 const r=pick([...Array.from({length:6},(_,i)=>i+1),...Array.from({length:6},(_,i)=>-i-1)]),a=ri(1,5),b=-a*r;
 const expr=poly(a,b),signedR=norm(r),pair=r<0?`${signedR} и 0`:`0 и ${signedR}`;
 const mode=i%4;
 if(mode===0)return {kind:'input',question:'Найди корень, отличный от нуля.',math:`${expr} = 0`,correct:r,hint:`Вынеси x: x(${a===1?'x':a+'x'} ${b>0?'+ '+b:'− '+Math.abs(b)}) = 0.`,explain:`x(${a===1?'x':a+'x'} ${b>0?'+ '+b:'− '+Math.abs(b)}) = 0. Первый корень 0, второй ${signedR}.`};
 if(mode===1)return {kind:'choice',question:'Выбери оба корня уравнения.',math:`${expr} = 0`,correct:pair,choices:choices(pair,[`0 и ${norm(-r)}`,`${norm(r)} и ${norm(-r)}`,`${norm(r-1)} и ${norm(r+1)}`,`0 и ${norm(r+1)}`]),hint:'Вынеси x и приравняй к нулю каждый множитель. Один корень уже известен: 0.',explain:`${expr} = x(${a===1?'x':a+'x'} ${b>0?'+ '+b:'− '+Math.abs(b)}) = 0. Корни: ${pair}.`};
 if(mode===2){const k=ri(1,6),op=r<0?'+':'−',expr2=`x(x ${op} ${Math.abs(r)}) = 0`;
 return {kind:'input',question:'Какой корень, кроме нуля?',math:expr2,correct:r,hint:'Произведение равно нулю, когда хотя бы один множитель равен нулю.',explain:`x = 0 или x ${op} ${Math.abs(r)} = 0. Поэтому второй корень ${signedR}.`};}
 const d=ri(2,7),c=b+d,expr3=`${poly(a,c)} = ${d}x`;
 return {kind:'choice',question:'Какая пара чисел решает уравнение?',math:expr3,correct:pair,choices:choices(pair,[`0 и ${norm(-r)}`,`0 и ${norm(r+1)}`,`${norm(-r)} и ${norm(r)}`,`0 и ${norm(r-1)}`]),hint:`Сначала перенеси ${d}x в левую часть, затем вынеси общий множитель.`,explain:`После переноса: ${expr} = 0. Корни: ${pair}.`};
};
const all={identities:{title:'Формулы сокращённого умножения',lead:'Раскрываем скобки и узнаём знакомые структуры. Здесь важнее видеть, откуда появляются слагаемые, чем заучивать шаблон.',tip:'Каждый член одной скобки умножается на каждый член другой. Коэффициент 2 в (a + b)² возникает потому, что произведение ab встречается дважды.',sample:'(x + 3)² = x² + 6x + 9',generator:makeSquare},zero:{title:'Нулевое произведение',lead:'Научимся решать уравнения вида ax² + bx = 0 через вынесение x за скобки — без деления на возможный ноль.',tip:'Если a · b = 0, хотя бы один множитель равен нулю. Сначала преврати выражение в произведение, потом исследуй оба случая.',sample:'x² − 4x = x(x − 4) = 0',generator:makeZero}};
const topic=all[document.body.dataset.topic]||all.identities;
$('page-title').textContent=topic.title;$('page-lead').textContent=topic.lead;$('principle').textContent=topic.tip;$('example').innerHTML=markup(topic.sample);
let items=[],index=0,first=0,attempts=0,selected=null,done=false,miss=[];
function screens(screen){for(const id of ['intro','exercise','complete'])$(id).classList.toggle('hidden',id!==screen);}
const params=(typeof location!=='undefined'&&typeof URLSearchParams!=='undefined')?new URLSearchParams(location.search):{get:()=>null};const requestedCount=Number(params.get('count'));const sessionCount=Number.isInteger(requestedCount)&&requestedCount>=1&&requestedCount<=100?requestedCount:6;
function start(){// Respect the generated answer types: choose a compatible task for the scheduled format
 items=Array.from({length:sessionCount},(_,i)=>{let q;for(let k=0;k<9;k++){q=topic.generator(i+k);if(q.kind===(i%2===0?'input':'choice'))break;}if(q.kind!==(i%2===0?'input':'choice'))throw Error('Нет подходящего формата');return q;});
 index=0;first=0;miss=[];screens('exercise');render();}
function render(){const q=items[index];done=false;attempts=0;selected=null;$('number').textContent=`Задание ${index+1} из ${items.length}`;$('score').textContent=`${first} без ошибок`;$('fill').style.width=(100*index/items.length)+'%';if(typeof window!=='undefined'&&window.MathDojoMath){window.MathDojoMath.render($('question'),q.question,q.questionLatex);window.MathDojoMath.render($('math'),q.math,q.mathLatex);}else{$('question').textContent=q.question;$('math').innerHTML=markup(q.math);}$('choices').innerHTML='';$('choices').classList.toggle('hidden',q.kind!=='choice');$('answer').classList.toggle('hidden',q.kind!=='input');$('answer').value='';$('answer').disabled=false;$('feedback').className='feedback hidden';$('feedback').textContent='';$('explain').classList.add('hidden');$('hint-text').classList.add('hidden');$('reveal').classList.add('hidden');$('submit').textContent='Проверить';$('hint').disabled=false;$('skip').classList.remove('hidden');
 if(q.kind==='choice'){for(const opt of q.choices){const b=document.createElement('button');b.type='button';b.className='choice';b.dataset.value=opt;b.innerHTML=markup(opt);b.onclick=()=>{if(done)return;selected=opt;[...$('choices').children].forEach(el=>el.classList.toggle('selected',el===b));};$('choices').appendChild(b);}}
}
function readInput(){const raw=$('answer').value.trim().replace(/−/g,'-').replace(',','.');return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)?Number(raw):NaN;}
function setFeedback(msg,kind){$('feedback').textContent=msg;$('feedback').className='feedback '+kind;}
function resolve(ok,skipped=false){const q=items[index];done=true;if(ok&&attempts===1)first++;else miss.push(q.math);$('score').textContent=`${first} без ошибок`;$('answer').disabled=true;[...$('choices').children].forEach(el=>{el.disabled=true;if(el.dataset.value===String(q.correct))el.classList.add('correct');});if(typeof window!=='undefined'&&window.MathDojoMath)window.MathDojoMath.render($('explain'),q.explain,q.explainLatex);else $('explain').textContent=q.explain;$('explain').classList.remove('hidden');setFeedback(ok?'Верно. Теперь посмотри, почему ответ получается именно таким.':(skipped?'Ответ и объяснение ниже.':'Разберём правильный ответ.'),ok?'good':'neutral');$('submit').textContent=index===items.length-1?'К итогам':'Следующее задание';$('hint').disabled=true;$('reveal').classList.add('hidden');$('skip').classList.add('hidden');}
function check(){if(done){if(++index>=items.length)return finish();render();return;}const q=items[index];const answer=q.kind==='choice'?selected:readInput();if(answer===null||Number.isNaN(answer)){setFeedback(q.kind==='choice'?'Выбери один вариант.':'Введи число. Для отрицательных чисел используй минус.', 'neutral');return;}attempts++;if(answer===q.correct){resolve(true);return;}setFeedback('Пока не совпало. Попробуй найти ошибку в ходе вычисления.','bad');$('reveal').classList.remove('hidden');if(q.kind==='choice'){[...$('choices').children].forEach(el=>el.classList.toggle('wrong',el.dataset.value===String(answer)));}}
function finish(){screens('complete');$('final-number').textContent=`${first} / ${items.length}`;$('final-detail').textContent=first===items.length?'Все задачи решены с первой попытки. Можно перейти к следующей теме.':`С первой попытки решено ${first} из ${items.length}. Сложные примеры стоит разобрать ещё раз — именно они подскажут, что закрепить.`;$('review').innerHTML=miss.length?'<strong>На что обратить внимание</strong>'+miss.slice(0,4).map(s=>`<div>${markup(s)}</div>`).join(''):'<strong>Уверенное выполнение</strong>Ты прошёл всю серию без ошибок.';}
$('start').onclick=start;$('again').onclick=start;$('home').onclick=()=>screens('intro');$('submit').onclick=check;$('hint').onclick=()=>{if(typeof window!=='undefined'&&window.MathDojoMath)window.MathDojoMath.render($('hint-text'),items[index].hint,items[index].hintLatex);else $('hint-text').textContent=items[index].hint;$('hint-text').classList.remove('hidden');};$('reveal').onclick=()=>resolve(false);$('skip').onclick=()=>resolve(false,true);$('answer').addEventListener('keydown',e=>{if(e.key==='Enter')check();});
if(params.get('autostart')==='1')start();
})();
