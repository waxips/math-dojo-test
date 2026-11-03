// SPDX-License-Identifier: GPL-3.0-or-later
// Static, repeatable validation of the curated bank. No network, no model-generated keys.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'source/library/questions.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'trainers/strategy_library.html'),'utf8');
assert.equal(data.questions.length,30,'Pilot has exactly 30 editorially approved questions');
assert.deepEqual(Object.fromEntries(Object.keys(data.topics).map(t=>[t,data.questions.filter(q=>q.topic===t).length])),{calculations:10,linear:10,identities:10});
assert.equal(Object.keys(data.topics).length,3);
assert.equal(data.schemaVersion,1);
const ids=new Set(),uniqueCorrect=new Set(),skills=new Set(),levels=new Set();
for(const q of data.questions){
 assert(!ids.has(q.id),`Duplicate ${q.id}`);ids.add(q.id);
 assert(q.question&&q.expression&&q.hint&&q.explanation);
 assert(data.topics[q.topic],`Unknown topic: ${q.topic}`);assert(data.skills[q.skill],`Unknown skill ${q.skill}`);
 assert(Number.isInteger(q.difficulty)&&q.difficulty>=1&&q.difficulty<=3);
 assert(q.options.length>=2&&q.options.length<=4);
 const optionIds=q.options.map(o=>o.id), texts=q.options.map(o=>o.text.trim());
 assert.equal(new Set(optionIds).size,optionIds.length,`${q.id} duplicate option IDs`);
 assert.equal(new Set(texts).size,texts.length,`${q.id} duplicate option texts`);
 assert(optionIds.includes(q.correct),`${q.id} missing correct option`);
 for(const o of q.options)assert(o.feedback.length>16,`${q.id} missing specific distractor explanation`);
 skills.add(q.skill);levels.add(q.difficulty);uniqueCorrect.add(q.correct);
 assert(html.includes(q.id),`${q.id} not embedded`);
}
assert(skills.size>=6);assert(levels.size>=3);assert(uniqueCorrect.size>=4);
for(const file of ['trainers/arithmetic_plus.html','trainers/linear_equations.html','trainers/formulas.html','trainers/how_to_start.html','index.html','COPYING','LICENSE'])assert(fs.existsSync(path.join(root,file)),`Missing ${file}`);
assert(html.includes('window.MathDojoCuratedData='));assert(!html.includes('{{DATA}}'));
console.log('Curated bank passed: 30 questions, 3 topics,',skills.size,'skills, 3 difficulty levels; options and exports validated.');
