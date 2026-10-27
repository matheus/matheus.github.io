const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root={dataset:{},classList:{toggle(){}},getAnimations:()=>[],querySelector:()=>({classList:{toggle(){}}})};
const nodes={'#conecta-demo':root,'#demo-question':{},'#demo-answer':{classList:{toggle(){}}}};
const media={matches:false,addEventListener:(_,fn)=>media.change=fn};const events={};const pending=new Map();let next=0,visibility;
const document={hidden:false,querySelector:s=>nodes[s]||null,addEventListener:(event,handler)=>events[event]=handler};
class Observer{constructor(callback){visibility=callback}observe(){}}
vm.runInNewContext(fs.readFileSync('servicos/conecta7x7/assets/demo.js','utf8'),{document,window:{IntersectionObserver:Observer},IntersectionObserver:Observer,matchMedia:()=>media,requestAnimationFrame:fn=>{pending.set(++next,fn);return next},cancelAnimationFrame:id=>pending.delete(id)});
const frame=time=>{const item=pending.entries().next().value;assert(item,'Expected an animation frame');pending.delete(item[0]);item[1](time)};
assert.equal(pending.size,0);visibility([{isIntersecting:true}]);frame(0);frame(8125);assert.equal(root.dataset.scene,'done');frame(9999);assert.equal(root.dataset.scene,'done');frame(10000);assert.equal(root.dataset.scene,'website');frame(18125);assert.equal(root.dataset.scene,'done');frame(20000);assert.equal(root.dataset.scene,'website');
visibility([{isIntersecting:false}]);assert.equal(pending.size,0);visibility([{isIntersecting:true}]);frame(30000);assert.equal(root.dataset.scene,'website');frame(32375);assert.equal(root.dataset.scene,'dialog');document.hidden=true;events.visibilitychange();assert.equal(pending.size,0);document.hidden=false;events.visibilitychange();frame(40000);media.matches=true;media.change();assert.equal(root.dataset.scene,'done');assert.equal(pending.size,0);media.matches=false;media.change();frame(50000);assert.equal(root.dataset.scene,'website');
const html=fs.readFileSync('servicos/conecta7x7/index.html','utf8');assert(!/id="demo-(caption|pause|replay|status|progress-fill)"/.test(html));assert(!html.includes('Apresente sua empresa. Entenda o interesse. Continue no WhatsApp.'));
console.log('PASS: continuous 10-second loops, offscreen/background pause, resume, static reduced-motion state, removed captions and controls');
