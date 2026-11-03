/* SPDX-License-Identifier: GPL-3.0-or-later
 * Regression checks for the experimental orientation pilot.
 * Run: node tests/verify_orientation.js
 */
'use strict';
const assert=require('node:assert/strict');
const lib=require('../source/orientation/engine.js');
const categories=Object.keys(lib.topics);
assert.deepEqual(categories,['calculations','linear','identities']);
let count=0;
for(const topic of categories){
 const known=new Set();
 for(let i=0;i<5000;i++){
  for(let family=0;family<5;family++){
   const q=lib.create(topic,family);
   known.add(q.family);
   assert.equal(q.topic,topic);
   assert.ok(['read','goal','start','next','finish'].includes(q.phase));
   assert.equal(q.options.length,4);
   assert.equal(new Set(q.options.map(x=>x.label)).size,4);
   assert.equal(new Set(q.options.map(x=>x.id)).size,4);
   assert.equal(q.options.filter(x=>x.id===q.correct).length,1);
   assert.ok(q.explain.length>=18 && q.question.length>15 && q.hint.length>10);
   for(const option of q.options){assert.ok(option.feedback.length>12);assert.ok(!option.feedback.includes('Правильный ответ:'));}
   const m=q.meta;
   if(topic==='linear' && ['remove-constant','finish-with-answer'].includes(q.family))assert.equal(m.a*m.solution+m.b,m.c);
   if(topic==='linear' && q.family==='final-division')assert.equal(m.a*m.solution,m.b);
   if(topic==='identities'){
    const n=m.n;
    if(q.family==='meaning-of-square'||q.family==='minus-square'||q.family==='recognize-square')assert.ok(n>=2 && n<=9);
    if(q.family==='multiply-after-expansion')assert.equal(m.k*(3+n)**2, m.k*9 + (m.k*2*n)*3 + m.k*n*n);
   }
   count++;
  }
 }
 assert.equal(known.size,5);
 for(let i=0;i<100;i++){
  const s=lib.session(topic,10);assert.equal(s.length,10);
  const hist={};s.forEach(q=>hist[q.family]=(hist[q.family]||0)+1);
  assert.ok(Object.values(hist).every(n=>n===2));
 }
 console.log('OK',topic,known.size,'families');
}
console.log('Checked',count,'generated questions, including choices, structure and mathematical invariants');
