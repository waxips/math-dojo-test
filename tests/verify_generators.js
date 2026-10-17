const fs=require('fs'),vm=require('vm'),path=require('path');let src=fs.readFileSync(path.join(__dirname,'..','source','focused','engine.js'),'utf8');src=src.replace(/\}\)\(\);\s*$/, 'globalThis.testFns={makeSquare,makeZero};})();');
const els={};const fake=id=>els[id]??(els[id]={textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){}});
const ctx={document:{getElementById:fake,body:{dataset:{topic:'identities'}}},console};vm.createContext(ctx);vm.runInContext(src,ctx);
let tests=0;
function calcPoly(p,x){
 const m=p.replace(/\s/g,'').replace(/−/g,'-').replace(/\+\-/g,'-');
 let a=/^(\d*)x²/.exec(m);if(!a)throw Error('not poly '+m);a=a[1]?Number(a[1]):1;
 let remain=m.replace(/^\d*x²/,'');let coeff=0,c=0;
 const terms=remain.match(/[+-][^+-]+/g)||[];
 for(const t of terms){if(t.includes('x'))coeff+=Number(t.replace('x',''))|| (t.startsWith('-')?-1:1);else c+=Number(t);}
 return a*x*x+coeff*x+c;
}
for(let i=0;i<4000;i++){
 for(const type of ['makeZero','makeSquare']){
  const q=ctx.testFns[type](i);
  if(q.kind==='choice'){
   if(q.choices.length!==4 || new Set(q.choices).size!==4 || !q.choices.includes(q.correct))throw Error('choice invalid '+JSON.stringify(q));
  }
  if(type==='makeZero'){
   let root=typeof q.correct==='number'?q.correct:Number((q.correct.match(/[−-]?\d+/g)||[]).find(k=>Number(k.replace('−','-'))!==0).replace('−','-'));
   // for mode2 factor with x..., verify sign from expression using numerical candidate, others polynomial
   if(q.math.startsWith('x(')){
    const mm=/x\(x\s*([−+])\s*(\d+)\)/.exec(q.math);
    if(!mm)throw Error('unparsed factor '+q.math);
    const expected=mm[1]==='−'?Number(mm[2]):-Number(mm[2]);
    if(root!==expected)throw Error('bad factor '+JSON.stringify(q));
   } else {
    const parts=q.math.split(' = ');
    const left=calcPoly(parts[0],root),right=parts.length>1&&parts[1]!=='0'?Number(parts[1].replace('x',''))*root:0;
    if(Math.abs(left-right)>1e-7)throw Error('bad root '+JSON.stringify(q)+ ' '+left+' '+right);
   }
  }
  tests++;
 }
}
console.log('Generator mathematical checks',tests,'passed');
