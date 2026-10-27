const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function element(){return {value:'',textContent:'',children:[],listeners:{},classList:{add(){},remove(){},toggle(){}},append(...children){this.children.push(...children)},replaceChildren(){this.children=[]},addEventListener(type,fn){this.listeners[type]=fn},reportValidity(){return true},scrollIntoView(){},focus(){},querySelectorAll(){return this.children.filter(child=>child.type==='button')}}}
(async()=>{for(const clima of [false,true])for(const blocked of [false,true]){
const source=fs.readFileSync(clima?'servicos/conecta7x7/climaprime/assets/climaprime.js':'servicos/conecta7x7/assets/conecta.js','utf8');
const elements=new Map(),requests=[],order=[],opened=[];let complete,opens=0;
const $=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};
vm.runInNewContext(source,{matchMedia:()=>({matches:true}),window:{open:()=>{opens++;order.push('open');return blocked?null:{opener:{},location:{replace:url=>opened.push(url)}}}},document:{querySelector:$,createElement:element,createTextNode:text=>({textContent:text})},console,AbortController,setTimeout,clearTimeout,fetch:(url,options)=>{order.push('fetch');requests.push({...options,payload:JSON.parse(options.body)});return new Promise(resolve=>complete=resolve)}});
const submit=value=>{$('#answer').value=value;$('#chat-form').listeners.submit({preventDefault(){}})};
const choose=text=>$('#chat-actions').children.find(e=>e.textContent===text).listeners.click();
if(clima){choose('Manutenção');choose('Comercial');$('#neighborhood').value='Centro';submit('São Paulo');choose('O quanto antes');submit('Maria')}else{submit('Maria');submit('maria@example.com');choose('Apenas eu')}
assert.equal(opens,0);assert.equal(requests.length,0);choose('Enviar e abrir WhatsApp ↗');
assert.deepEqual(order,['open','fetch']);assert.equal(requests.length,1);assert.equal(requests[0].keepalive,true);
// Even a second programmatic click while pending must not duplicate either action.
choose('Enviar e abrir WhatsApp ↗');assert.equal(opens,1);assert.equal(requests.length,1);
complete({ok:false});await new Promise(setImmediate);choose('Tentar registrar novamente ↗');
assert.equal(opens,1,'Retry must not reopen WhatsApp');assert.equal(requests.length,2);assert.equal(requests[0].payload.requestId,requests[1].payload.requestId);assert.equal(requests[0].payload.conecta,true);if(clima)assert.equal(requests[0].payload.climaprime,true);
complete({ok:true});await new Promise(setImmediate);
if(blocked){assert.equal($('#chat-actions').children.length,1);assert.equal($('#chat-actions').children[0].textContent,'Abrir WhatsApp ↗');assert.match($('#chat-actions').children[0].href,/^https:\/\/wa.me\//)}else{assert.equal($('#chat-actions').children.length,0);assert.equal(opened.length,1);const wa=new URL(opened[0]);assert(wa.searchParams.get('text').includes('Maria'));assert(wa.searchParams.get('text').includes(clima?'Manutenção':'maria@example.com'))}
console.log(`PASS: ${clima?'ClimaPrime':'Conecta'} / popup ${blocked?'blocked':'opened'} — one click, synchronous opening, payload, duplicate prevention, retry and fallback`);
}})().catch(error=>{console.error(error);process.exitCode=1});
