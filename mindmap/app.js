const $ = (selector) => document.querySelector(selector);
const source = $('#source'), themeSource = $('#themeSource'), canvas = $('#mapCanvas');
const defaults = {
  content: `Como criar vídeos que ensinam\n  A ideia central\n    Uma promessa clara\n    Um público específico [destaque]\n  O roteiro\n    Comece pelo problema\n    Construa a solução\n    Termine com próximo passo\n  A gravação\n    Áudio antes da imagem\n    Energia e ritmo\n  Publicação\n    Título que entrega valor\n    Miniatura simples`,
  theme: `nome: Aurora\nfundo: "#0b1020"\nsuperficie: "#131b31"\ntexto: "#f2f5ff"\nlinha: "#5162a6"\nacento: "#8b5cf6"\ndestaque: "#f59e0b"\nfonte: "Manrope"`
};
const presets = {
  aurora: defaults.theme,
  oceano: `nome: Oceano\nfundo: "#061a29"\nsuperficie: "#0c2a3d"\ntexto: "#e8fbff"\nlinha: "#3a8ba8"\nacento: "#19b5a5"\ndestaque: "#ffbd59"\nfonte: "Manrope"`,
  papel: `nome: Papel\nfundo: "#f6f0e5"\nsuperficie: "#fffaf1"\ntexto: "#25302b"\nlinha: "#aeb8a2"\nacento: "#527a5b"\ndestaque: "#df8e3d"\nfonte: "Manrope"`
};
let nodes = [], activeIndex = 0, laserOn = false, saveTimer, collapsed = new Set();
let baseScale = 1, zoom = 1, panX = 0, panY = 0, dragStart = null, ignoreNodeClickUntil = 0;

function yaml(text) { const obj = {}; text.split(/\r?\n/).forEach(line => { const match = line.match(/^\s*([^:#]+):\s*(.*?)\s*$/); if (match) obj[match[1].trim().toLowerCase()] = match[2].replace(/^['"]|['"]$/g, ''); }); return obj; }
function parseMap(text) { const list = []; text.split(/\r?\n/).forEach((raw, order) => { if (!raw.trim() || raw.trim().startsWith('#')) return; const spaces = raw.match(/^\s*/)[0].replace(/\t/g,'  ').length; let label = raw.trim().replace(/^-\s*/, ''); const highlight = /\s*\[destaque\]\s*$/i.test(label); label = label.replace(/\s*\[destaque\]\s*$/i,''); list.push({label, depth:Math.floor(spaces/2), highlight, order}); }); return list; }
function applyTheme() { const t = yaml(themeSource.value); const root = document.documentElement; const map = {fundo:'--bg', superficie:'--surface', texto:'--text', linha:'--line', acento:'--accent', destaque:'--highlight', fonte:'--font'}; Object.entries(map).forEach(([key,variable]) => { if(t[key]) root.style.setProperty(variable,t[key]); }); }
function render() {
  applyTheme(); nodes = parseMap(source.value);
  if(activeIndex >= nodes.length) activeIndex = Math.max(0,nodes.length-1);
  if (!nodes.length) { canvas.replaceChildren(); updateProgress(); return; }
  const stack = [];
  nodes.forEach((node, index) => {
    node.children = [];
    while (stack.length && nodes[stack[stack.length - 1]].depth >= node.depth) stack.pop();
    node.parent = stack.length ? stack[stack.length - 1] : -1;
    if (node.parent >= 0) nodes[node.parent].children.push(index);
    stack.push(index);
  });
  const rootIndex = nodes.findIndex(node => node.parent === -1);
  const root = nodes[rootIndex < 0 ? 0 : rootIndex];
  const isVisible = index => { for (let parent = nodes[index].parent; parent >= 0; parent = nodes[parent].parent) if (collapsed.has(parent)) return false; return true; };
  const visibleChildren = index => nodes[index].children.filter(isVisible);
  // Estrutura de leitura: o assunto central inicia à esquerda e todos os ramos avançam à direita.
  root.children.forEach(index => assignSide(index, 1));
  function assignSide(index, side) { nodes[index].side = side; nodes[index].children.forEach(child => assignSide(child, side)); }
  function leafCount(index) { const children = visibleChildren(index); return children.length ? children.reduce((sum, child) => sum + leafCount(child), 0) : 1; }
  const leaves = root.children.reduce((sum, index) => sum + leafCount(index), 0);
  const height = Math.max(560, leaves * 88 + 180);
  const depth = Math.max(...nodes.map(node => node.depth));
  const width = Math.max(900, depth * 250 + 500);
  const centerX = 190, cursors = { '-1': 110, '1': 110 };
  root.x = centerX; root.y = height / 2;
  function position(index) {
    const node = nodes[index];
    const children = visibleChildren(index);
    if (!children.length) { node.y = cursors[node.side]; cursors[node.side] += 88; }
    else { children.forEach(position); node.y = nodes[children[0]].y + (nodes[children.at(-1)].y - nodes[children[0]].y) / 2; }
    node.x = centerX + node.depth * 250;
  }
  root.children.forEach(position);
  const tree = document.createElement('div'); tree.className = 'tree'; tree.style.width = `${width}px`; tree.style.height = `${height}px`;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.classList.add('connections'); svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.setAttribute('width', width); svg.setAttribute('height', height);
  nodes.forEach((node, index) => { if (node.parent < 0 || !isVisible(index)) return; const parent = nodes[node.parent], direction = node.x > parent.x ? 1 : -1; const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', `M ${parent.x} ${parent.y} C ${parent.x + direction * 92} ${parent.y}, ${node.x - direction * 92} ${node.y}, ${node.x} ${node.y}`); svg.append(path); });
  tree.append(svg);
  nodes.forEach((node,index) => { if (!isVisible(index)) return; const branch=node.children.length>0; const el=document.createElement('div'); el.className=`node ${node.highlight?'highlight':''} ${branch?'branch':''} ${collapsed.has(index)?'collapsed':''} ${index===activeIndex?'active':''}`; el.dataset.index=index; el.style.left=`${node.x}px`; el.style.top=`${node.y}px`; el.innerHTML=`<span class="node-label">${escapeHtml(node.label)}</span>`; el.addEventListener('click',()=>{if(performance.now()<ignoreNodeClickUntil)return; branch ? toggleCollapse(index) : setActive(index)}); tree.append(el); });
  canvas.replaceChildren(tree); updateProgress(); requestAnimationFrame(fitMap);
}
function escapeHtml(value) { return value.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function setActive(index) { if (!nodes.length) return; activeIndex=Math.max(0,Math.min(index,nodes.length-1)); const ancestors = new Set(); for(let parent=nodes[activeIndex].parent; parent >= 0; parent=nodes[parent].parent) ancestors.add(parent); document.querySelectorAll('.node').forEach(el => { const i=Number(el.dataset.index); el.classList.toggle('active',i===activeIndex); el.classList.toggle('dim',i!==activeIndex && !ancestors.has(i)); }); focusActive(); updateProgress(); persistSoon(); }
function toggleCollapse(index) { if (!nodes[index]?.children.length) return; activeIndex=index; if(collapsed.has(index)) collapsed.delete(index); else collapsed.add(index); render(); persistSoon(); }
function visibleIndexes() { return nodes.map((_, index) => index).filter(index => { for(let parent=nodes[index].parent; parent>=0; parent=nodes[parent].parent) if(collapsed.has(parent)) return false; return true; }); }
function navigate(key) { const current=nodes[activeIndex]; if (!current) return; if (key === 'right') { if(current.children.length && collapsed.has(activeIndex)) return toggleCollapse(activeIndex); if(current.children.length) return setActive(current.children[0]); const list=visibleIndexes(), position=list.indexOf(activeIndex); return setActive(list[Math.min(position+1,list.length-1)]); } if (key === 'left') { if(current.children.length && !collapsed.has(activeIndex)) return toggleCollapse(activeIndex); if(current.parent >= 0) return setActive(current.parent); } const list=visibleIndexes(), position=list.indexOf(activeIndex); setActive(list[Math.max(0,Math.min(list.length-1,position+(key==='down'?1:-1)))]); }
function applyViewport() { const tree=$('.tree'); if(!tree) return; const scale=baseScale*zoom; tree.style.transform=`translate(${panX}px, ${panY}px) scale(${scale})`; $('#zoomLabel').textContent=`${Math.round(scale*100)}%`; }
function fitMap() { const tree=$('.tree'); if(!tree) return; const padding=36; baseScale=Math.max(.18,Math.min(1,(canvas.clientWidth-padding)/tree.offsetWidth,(canvas.clientHeight-padding)/tree.offsetHeight)); if (zoom === 1) { panX=0; panY=0; } applyViewport(); }
function resetZoom() { zoom=1; panX=0; panY=0; applyViewport(); }
function changeZoom(amount) { zoom=Math.max(.65,Math.min(4,zoom+amount)); if(zoom<=1.01){zoom=1;panX=0;panY=0;} applyViewport(); if(zoom>1.01) focusActive(); }
function focusActive() { const tree=$('.tree'), node=nodes[activeIndex]; if(!tree || !node || zoom<=1.01) return; const scale=baseScale*zoom; panX=-(node.x-tree.offsetWidth/2)*scale; panY=-(node.y-tree.offsetHeight/2)*scale; applyViewport(); }
function updateProgress() { const total=nodes.length, now=total?activeIndex+1:0, pct=total?Math.round(now/total*100):0; $('#progressLabel').textContent=`${now} de ${total} tópicos`; $('#progressPercent').textContent=`${pct}%`; $('#progressBar').style.width=`${pct}%`; const current=nodes[activeIndex]; $('#topicPath').textContent=current ? current.label : 'Visão geral'; }
function persistSoon() { clearTimeout(saveTimer); saveTimer=setTimeout(()=>localStorage.setItem('fluxoMental.current', JSON.stringify(state())),400); }
function state() { return {title:$('#mapTitle').value, content:source.value, theme:themeSource.value, activeIndex, collapsed:[...collapsed]}; }
function loadState(data) { $('#mapTitle').value=data.title||'Roteiro sem título'; source.value=data.content||defaults.content; themeSource.value=data.theme||defaults.theme; activeIndex=data.activeIndex||0; collapsed=new Set(data.collapsed||[]); render(); }
function toast(text) { const el=$('#toast'); el.textContent=text; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800); }
function saved() { return JSON.parse(localStorage.getItem('fluxoMental.maps')||'[]'); }
function renderSaved() { const wrap=$('#savedMaps'); wrap.innerHTML=''; saved().forEach((map,i)=>{ const row=document.createElement('div'); row.className='saved-map'; row.innerHTML=`<button data-load="${i}">${escapeHtml(map.title)}</button><button class="delete" data-delete="${i}" title="Excluir">×</button>`; wrap.append(row); }); }
function saveMap() { const maps=saved(), data=state(), i=maps.findIndex(m=>m.title===data.title); if(i>=0) maps[i]=data; else maps.unshift(data); localStorage.setItem('fluxoMental.maps',JSON.stringify(maps)); renderSaved(); toast('Mapa salvo neste navegador'); }
function toggleFocus() { $('#appShell').classList.toggle('focus'); toast($('#appShell').classList.contains('focus')?'Modo foco ativado':'Modo foco desativado'); }
function setup() { const current=localStorage.getItem('fluxoMental.current'); loadState(current?JSON.parse(current):defaults); renderSaved(); source.addEventListener('input',()=>{activeIndex=0;collapsed.clear();render();persistSoon()}); themeSource.addEventListener('input',()=>{applyTheme();persistSoon()}); $('#mapTitle').addEventListener('input',persistSoon); new ResizeObserver(fitMap).observe(canvas); canvas.addEventListener('wheel',event=>{event.preventDefault();changeZoom(event.deltaY<0?.12:-.12);},{passive:false}); canvas.addEventListener('pointerdown',event=>{dragStart={x:event.clientX,y:event.clientY,panX,panY,moved:false};canvas.setPointerCapture(event.pointerId);}); canvas.addEventListener('pointermove',event=>{if(!dragStart)return;const dx=event.clientX-dragStart.x,dy=event.clientY-dragStart.y;if(Math.abs(dx)>3||Math.abs(dy)>3)dragStart.moved=true;if(!dragStart.moved)return;panX=dragStart.panX+dx;panY=dragStart.panY+dy;canvas.classList.add('dragging');applyViewport();}); canvas.addEventListener('pointerup',event=>{if(!dragStart)return;if(dragStart.moved)ignoreNodeClickUntil=performance.now()+150;dragStart=null;canvas.classList.remove('dragging');canvas.releasePointerCapture(event.pointerId);}); canvas.addEventListener('pointercancel',()=>{dragStart=null;canvas.classList.remove('dragging');}); $('#zoomIn').onclick=()=>changeZoom(.18); $('#zoomOut').onclick=()=>changeZoom(-.18); $('#zoomReset').onclick=resetZoom;
 $('#focusToggle').onclick=toggleFocus; $('#editToggle').onclick=()=>$('#appShell').classList.toggle('editing'); $('#newMap').onclick=()=>{ if(confirm('Criar um novo mapa? O mapa atual continuará salvo apenas se você o salvar.')) { loadState({...defaults,title:'Novo roteiro',activeIndex:0}); }}; $('#themeToggle').onclick=()=>$('.settings-panel').classList.toggle('collapsed'); document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{themeSource.value=presets[b.dataset.theme];applyTheme();persistSoon()}); $('#saveMap').onclick=saveMap; $('#mapsToggle').onclick=()=>$('#savedMaps').classList.toggle('open'); $('#savedMaps').onclick=e=>{let i=e.target.dataset.load;if(i!==undefined)loadState(saved()[i]); i=e.target.dataset.delete;if(i!==undefined){const maps=saved();maps.splice(i,1);localStorage.setItem('fluxoMental.maps',JSON.stringify(maps));renderSaved();}};
 $('#exportAll').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,current:state(),maps:saved()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fluxo-mental-backup.json';a.click();URL.revokeObjectURL(a.href);toast('Backup exportado');}; $('#importFile').onchange=e=>{const file=e.target.files[0];if(!file)return; const reader=new FileReader();reader.onload=()=>{try {const data=JSON.parse(reader.result); if(!data.current||!Array.isArray(data.maps))throw Error(); localStorage.setItem('fluxoMental.maps',JSON.stringify(data.maps));loadState(data.current);renderSaved();toast('Backup restaurado');}catch{toast('Arquivo de backup inválido');}};reader.readAsText(file);};
 document.addEventListener('keydown',e=>{const tag=document.activeElement.tagName;if(['TEXTAREA','INPUT'].includes(tag)&&e.key!=='Escape')return; if(e.key==='ArrowRight'){e.preventDefault();navigate('right')} if(e.key==='ArrowLeft'){e.preventDefault();navigate('left')} if(e.key==='ArrowDown'){e.preventDefault();navigate('down')} if(e.key==='ArrowUp'){e.preventDefault();navigate('up')} if(e.key==='+'||e.key==='=')changeZoom(.18); if(e.key==='-')changeZoom(-.18); if(e.key==='0')resetZoom(); if(e.key.toLowerCase()==='f')toggleFocus(); if(e.key.toLowerCase()==='e')$('#appShell').classList.toggle('editing'); if(e.key.toLowerCase()==='l'){laserOn=!laserOn;$('#laser').classList.toggle('on',laserOn);toast(laserOn?'Ponteiro laser ativado':'Ponteiro laser desativado')} if(e.key==='Escape'&&$('#appShell').classList.contains('focus'))toggleFocus();}); document.addEventListener('mousemove',e=>{if(laserOn){const l=$('#laser');l.style.left=e.clientX+'px';l.style.top=e.clientY+'px';}}); }
setup();
