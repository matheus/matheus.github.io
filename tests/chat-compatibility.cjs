const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const source=fs.readFileSync('conversation-v3.js','utf8');
function element(){return {value:'',textContent:'',children:[],listeners:{},classList:{add(){},remove(){}},append(child){this.children.push(child)},replaceChildren(){this.children=[]},addEventListener(type,fn){this.listeners[type]=fn},reportValidity(){return true},scrollIntoView(){},focus(){},setAttribute(){},querySelectorAll(){return this.children}}}
(async()=>{
for(const [name,crypto] of [['without randomUUID',{getRandomValues:webcrypto.getRandomValues.bind(webcrypto)}],['without crypto',undefined]]){
const elements=new Map(),requests=[];let ok=false;
const select=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};
vm.runInNewContext(source,{crypto,matchMedia:()=>({matches:true}),window:{},document:{querySelector:select,createElement:element},console,AbortController,setTimeout,clearTimeout,fetch:async(url,options)=>{requests.push({url,...options});return {ok}}});
assert.match(select('#answer-label').textContent,/Como posso/);
for(const value of ['Maria','maria@example.com','Minha empresa']){select('#answer').value=value;select('#chat-form').listeners.submit({preventDefault(){}})}
select('#chat-actions').children[0].listeners.click();assert.match(select('#answer-label').textContent,/Conecta/);
assert.equal(select('#chat-actions').children[0].href,'/servicos/conecta.html');assert.equal(select('#chat-actions').children[0].target,'_blank');assert(fs.existsSync('servicos/conecta.html'));
select('#chat-actions').children[1].listeners.click();assert.match(select('#messages').textContent,/Maria/);
assert.equal(requests.length,0,'No transmission before confirmation');
assert.equal(select('#chat-actions').children[0].textContent,'Confirmar e enviar ↗');
select('#chat-actions').children[0].listeners.click();await new Promise(setImmediate);
assert.match(select('#answer-label').textContent,/tentar/);
const payload=JSON.parse(requests[0].body);
assert.equal(payload.name,'Maria');assert.equal(payload.email,'maria@example.com');assert.equal(payload.company,'Minha empresa');assert.equal(payload.consent,true);assert(payload.transcript.length>5);assert.equal(requests[0].method,'POST');assert.match(requests[0].url,/^https:\/\/hook.us2.make.com\//);
ok=true;select('#chat-actions').children[0].listeners.click();await new Promise(setImmediate);
assert.match(select('#messages').textContent,/contato foi recebido/);
assert.equal(JSON.parse(requests[1].body).requestId,payload.requestId,'Retry preserves deduplication ID');
select('#restart').listeners.click();assert.match(select('#answer-label').textContent,/Como posso/);assert.equal(select('#answer').value,'');console.log('PASS: '+name+' — full flow, explicit confirmation, payload, failed send, retry, success and reset');}
assert(!source.includes('randomUUID('));
assert.match(fs.readFileSync('index.html','utf8'),/defer src="\.\/conversation-v3.js\?v=service-link-1"/);
})().catch(error=>{console.error(error);process.exitCode=1});
