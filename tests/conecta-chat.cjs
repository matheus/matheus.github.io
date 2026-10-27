const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('servicos/assets/conecta.js','utf8');
function element(){return {value:'',textContent:'',children:[],listeners:{},classList:{add(){},remove(){}},append(...children){this.children.push(...children)},replaceChildren(){this.children=[]},addEventListener(type,fn){this.listeners[type]=fn},reportValidity(){return true},scrollIntoView(){},focus(){},querySelectorAll(){return this.children.filter(child=>child.type==='button')}}}
(async()=>{for(const employees of ['Apenas eu','De 2 a 5','Mais de 5']){
const elements=new Map(),requests=[];const $=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};
vm.runInNewContext(source,{matchMedia:()=>({matches:true}),window:{},document:{querySelector:$,createElement:element,createTextNode:text=>({textContent:text})},console,AbortController,setTimeout,clearTimeout,fetch:async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true}}});
assert.equal($('#progress').textContent,'01 / 03');
const submit=value=>{$('#answer').value=value;$('#chat-form').listeners.submit({preventDefault(){}})};
submit('   ');assert.equal($('#progress').textContent,'01 / 03');
submit('Maria');assert.equal($('#progress').textContent,'02 / 03');
const contact=employees==='Apenas eu'?'maria@example.com':'+55 16 99999-9999';submit(contact);
assert.equal($('#progress').textContent,'03 / 03');assert.equal($('#chat-form').hidden,true);
assert.deepEqual($('#chat-actions').children.map(button=>button.textContent),['Apenas eu','De 2 a 5','Mais de 5']);
$('#chat-actions').children.find(button=>button.textContent===employees).listeners.click();
assert.equal($('#progress').textContent,'REVISE E CONFIRME');assert($('#chat-context').textContent.includes(employees));assert.equal(requests.length,0);
$('#chat-actions').children[0].listeners.click();await new Promise(setImmediate);
assert.equal(requests.length,1);const payload=requests[0];assert.equal(payload.conecta,true);assert.equal(payload.name,'Maria');assert.equal(payload.contact,contact);assert.equal(payload.employees,employees);assert.equal(payload.transcript.filter(item=>item.role==='user').length,3);assert(!('company' in payload));assert(!('email' in payload));
const url=new URL($('#chat-actions').children[0].href);assert(url.searchParams.get('text').includes(contact));assert(url.searchParams.get('text').includes(employees));
$('#restart').listeners.click();assert.equal($('#progress').textContent,'01 / 03');assert.equal($('#answer').value,'');assert.equal($('#chat-form').hidden,false);
console.log(`PASS: ${employees} — 3 questions, contact, selection, review, webhook payload, WhatsApp and reset`);
}})().catch(error=>{console.error(error);process.exitCode=1});
