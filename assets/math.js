/* SPDX-License-Identifier: GPL-3.0-or-later
   Math Dojo: optional KaTeX rendering, always escapes non-LaTeX content.
   Supported in JSON: expressionLatex, questionLatex, option.latex, hintLatex,
   explanationLatex; also \\(inline\\), \\[display\\] in text. */
(function(){'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function mathHTML(latex,display){
   if(window.katex){try{return window.katex.renderToString(String(latex),{displayMode:!!display,throwOnError:true,trust:false,strict:'ignore',maxExpand:1000,maxSize:20});}catch(e){return `<span class="math-error" title="Проверь LaTeX">${esc(latex)}</span>`;}}
   return `<code class="math-fallback">${esc(latex)}</code>`;
 }
 function textHTML(text){const raw=String(text??''),matcher=/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g;let last=0,res='',m;
   while((m=matcher.exec(raw))){res+=esc(raw.slice(last,m.index)).replace(/²/g,'<sup>2</sup>').replace(/³/g,'<sup>3</sup>');res+=mathHTML(m[1]??m[2]??m[3],m[1]!=null);last=matcher.lastIndex;}
   return res+esc(raw.slice(last)).replace(/²/g,'<sup>2</sup>').replace(/³/g,'<sup>3</sup>');
 }
 const registered=new Map();
 function render(el,text,latex,display=false){if(!el)return;registered.set(el,{text,latex,display});el.innerHTML=latex?mathHTML(latex,display):textHTML(text);}
 function repaint(){for(const [el,v] of registered){if(el.isConnected)render(el,v.text,v.latex,v.display);else registered.delete(el);}}
 function loadKatex(){if(window.katex)return;const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/katex.min.css';stylesheet.integrity='sha384-WwGtaC6ywCHxA5cstpj/3+xIZvTez8dq2IcBQaXRkenHZ7FVVq1ZROtURwfbtTlG';stylesheet.crossOrigin='anonymous';document.head.append(stylesheet);const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/katex@0.19.1/dist/katex.min.js';script.integrity='sha384-a1WQdjRj162i159OYq041X6I4K8NenkrI09LlPmiHg0YOb7CR+wJOraXwK9abpnE';script.crossOrigin='anonymous';script.onload=repaint;document.head.append(script);}
 loadKatex();
 window.MathDojoMath={render,mathHTML,textHTML};
})();
