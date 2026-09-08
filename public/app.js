import {sortModels} from './model-order.js';
const main = document.querySelector('#main');
const dialog = document.querySelector('#art-dialog');
const tray = document.querySelector('#selection-tray');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const shapes = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  compare:'<rect x="3" y="4" width="7" height="16" rx="2"/><rect x="14" y="4" width="7" height="16" rx="2"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
  back:'<path d="M19 12H5m5-5-5 5 5 5"/>',
  replay:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  expand:'<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
  link:'<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(2 0)"/>',
  leaf:'<path d="M20 4c-9-1-16 3-15 9s9 7 12 1c2-4 2-7 3-10ZM4 21l10-12"/>',
  river:'<path d="M7 3c12 5-11 7 1 12s0 6 0 6M16 3c12 5-11 7 1 12s0 6 0 6"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${shapes[name] || shapes.grid}</svg>`;
const effortName = level => ({default:'默认',unspecified:'未标注',none:'无思考',minimal:'Minimal',low:'Low',medium:'Medium',high:'High',xhigh:'XHigh',max:'Max',ultra:'Ultra'}[level] || level || '默认');
const effort = sample => sample.reasoning || 'default';
const modelKey = sample => JSON.stringify([sample.provider || '其他', sample.model]);
const unique = values => [...new Set(values)];
const effortOrder=['default','unspecified','none','minimal','low','medium','high','xhigh','max','ultra'];
const orderedEfforts=values=>unique(values).sort((a,b)=>(effortOrder.includes(a)?effortOrder.indexOf(a):999)-(effortOrder.includes(b)?effortOrder.indexOf(b):999));
let data;
const PAGE_SIZE=12;
const state = { mode:'gallery', topic:null, query:'', provider:'all', selected:new Set(), panels:[], promptOpen:false, cardSamples:new Map(), page:1, pageCount:1 };
let replaySerial = 0, toastTimer;

function toast(message) {
  const node = document.querySelector('#toast'); node.textContent = message; node.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('visible'), 2300);
}
function assetURL(sample, fresh = false) {
  const url = new URL(sample.src, document.baseURI);
  if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) throw new Error('Use a local asset path.');
  if (fresh) url.searchParams.set('replay', `${Date.now()}-${++replaySerial}`);
  return url.href;
}
function image(sample, eager = false) {
  return `<img src="${esc(assetURL(sample))}" alt="${esc(sample.model)} · ${esc(state.topic.title)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" data-art-id="${esc(sample.id)}">`;
}
function wireImages(scope = main) {
  scope.querySelectorAll('img[data-art-id]').forEach(img => {
    img.addEventListener('error', () => {
      const fallback = document.createElement('div'); fallback.className = 'art-error';
      fallback.innerHTML = `${icon('file')}<span>这份作品暂时无法预览</span>`;
      img.replaceWith(fallback);
    }, {once:true});
  });
}
function sampleById(id) { return state.topic.samples.find(sample => sample.id === id); }
function sampleLabel(sample) {
  const siblings=state.topic.samples.filter(s=>modelKey(s)===modelKey(sample) && effort(s)===effort(sample));
  return `样本 ${siblings.findIndex(s=>s.id===sample.id)+1}`;
}
function baseline(topic = state.topic) { return topic.samples.filter(s => s.home===true || (s.home!==false && ['default','unspecified'].includes(effort(s)))); }
function topicHref(mode, topicId, ids) {
  const params = new URLSearchParams({topic:topicId});
  if (ids?.length) params.set('samples',ids.join(','));
  return `#/${mode === 'compare' ? 'compare' : ''}?${params}`;
}
function options(values, current) { return values.map(([value,name]) => `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(name)}</option>`).join(''); }
function route() {
  const hash = location.hash.slice(1) || '/';
  const [pathname, search = ''] = hash.split('?');
  const params = new URLSearchParams(search);
  const topic = data.topics.find(t => t.id === params.get('topic')) || data.topics[0];
  if (state.topic?.id !== topic.id) { state.selected.clear(); state.cardSamples.clear(); state.query=''; state.provider='all'; state.promptOpen=false; state.page=1; }
  state.topic = topic; state.mode = pathname === '/compare' ? 'compare' : 'gallery';
  if (dialog.open) dialog.close();
  document.querySelector('#nav-gallery').classList.toggle('active',state.mode === 'gallery');
  document.querySelector('#nav-compare').classList.toggle('active',state.mode === 'compare');
  document.querySelector('#nav-gallery').href = topicHref('gallery',topic.id);
  document.querySelector('#nav-compare').href = topicHref('compare',topic.id);
  document.title = `${state.mode === 'compare' ? '并排比较' : topic.title} · 观模`;
  if (state.mode === 'compare') {
    const fromURL = (params.get('samples') || '').split(',').filter(id => sampleById(id)).slice(0,4);
    const base = baseline(); const fallback = base.length ? base : topic.samples;
    state.panels = fromURL.length ? fromURL : unique([fallback[0]?.id, fallback.at(-1)?.id].filter(Boolean));
    renderCompare();
  } else renderGallery();
  renderTray();
}
function promptHTML() { return `<section id="prompt-panel" class="prompt-panel"${state.promptOpen ? '' : ' hidden'}><div class="prompt-head"><span>这道题的提示词</span><button class="text-button" data-action="copy-prompt">复制原文 ${icon('file')}</button></div><pre>${esc(state.topic.prompt || state.topic.title)}</pre></section>`; }

function renderGallery() {
  const all = data.topics.flatMap(topic => topic.samples);
  main.innerHTML = `<section class="hero"><div><div class="eyebrow">A SMALL COLLECTION OF MACHINE IMAGINATION</div><h1>同一道题，不同想象。</h1><p>切换思考深度，或将感兴趣的作品放在一起比较。</p></div><div class="hero-side"><div class="stat"><strong>${data.topics.length.toString().padStart(2,'0')}</strong><span>道绘画题目</span></div><div class="stat"><strong>${unique(all.map(modelKey)).length.toString().padStart(2,'0')}</strong><span>个模型 / 来源</span></div><div class="stat"><strong>${all.length.toString().padStart(2,'0')}</strong><span>份 SVG 作品</span></div></div></section>
    <div class="topic-nav" aria-label="选择题目">${data.topics.map((topic,i) => `<button class="topic-button${topic.id === state.topic.id ? ' active' : ''}" data-topic="${esc(topic.id)}" aria-pressed="${topic.id === state.topic.id}">${icon(topic.icon || (i ? 'leaf' : 'grid'))}<span>${esc(topic.title)}</span><span class="count">${baseline(topic).length}</span></button>`).join('')}</div>
    <div class="topic-heading"><h2>${esc(state.topic.title)} <span class="pill">可切换思考深度</span></h2><div class="topic-links"><button class="text-button" data-action="prompt" aria-expanded="${state.promptOpen}" aria-controls="prompt-panel">${icon('file')} 看提示词</button><a class="text-button advanced-link" href="${topicHref('compare',state.topic.id)}">高级比较 ${icon('arrow')}</a></div></div>
    ${promptHTML()}
    <div class="toolbar"><label class="search-box">${icon('search')}<input id="model-search" type="search" placeholder="搜索模型或提供方" aria-label="搜索模型或提供方" value="${esc(state.query)}"></label><select id="provider-filter" class="filter-select" aria-label="提供方">${options([['all','全部提供方'],...unique(baseline().map(s=>s.provider || '其他')).map(v=>[v,v])],state.provider)}</select><button class="button replay-button" data-action="replay">${icon('replay')} 全部重播</button><span class="toolbar-summary" id="result-count"></span></div>
    <div class="gallery-grid" id="gallery-grid"></div><nav id="gallery-pagination" class="pagination" aria-label="作品分页" hidden></nav><div class="browse-note"><span>点击作品放大查看，点击右下角「＋」加入对比。</span><a href="${topicHref('compare',state.topic.id)}">并排比较与更多样本 ${icon('arrow')}</a></div>`;
  document.querySelector('#model-search').addEventListener('input',event => { state.query=event.target.value; state.page=1; renderCards(); });
  document.querySelector('#provider-filter').addEventListener('change',event => { state.provider=event.target.value; state.page=1; renderCards(); });
  renderCards();
}
function renderCards() {
  const needle = state.query.trim().toLocaleLowerCase();
  const base = baseline();
  const samples = base.filter(sample => (state.provider === 'all' || (sample.provider || '其他') === state.provider) && `${sample.model} ${sample.provider || ''}`.toLocaleLowerCase().includes(needle));
  state.pageCount=Math.max(1,Math.ceil(samples.length/PAGE_SIZE));
  state.page=Math.min(Math.max(1,state.page),state.pageCount);
  const start=(state.page-1)*PAGE_SIZE;
  const visible=samples.slice(start,start+PAGE_SIZE);
  document.querySelector('#result-count').innerHTML = samples.length ? `<strong>${start+1}–${start+visible.length}</strong> / ${samples.length} 份作品` : '0 份作品';
  document.querySelector('#gallery-grid').innerHTML = samples.length ? visible.map((sample,index) => cardHTML(sample,index)).join('') : `<div class="empty-state"><h3>${base.length ? '没有找到匹配的作品' : '这个题目还没有默认强度的作品'}</h3><p>${base.length ? '换个模型名称，或试试其他提供方。' : '可以到高级比较查看已收录的其它样本。'}</p>${base.length ? '<button class="button" data-action="clear-filters">清除筛选</button>' : `<a class="button" href="${topicHref('compare',state.topic.id)}">高级比较</a>`}</div>`;
  renderPagination();
  wireImages();
}
function renderPagination() {
  const pagination=document.querySelector('#gallery-pagination');
  pagination.hidden=state.pageCount<2;
  if(pagination.hidden){pagination.innerHTML='';return;}
  const pages=unique([1,state.page-1,state.page,state.page+1,state.pageCount]).filter(n=>n>=1 && n<=state.pageCount).sort((a,b)=>a-b);
  const numbers=pages.map((n,i)=>`${i && n-pages[i-1]>1?'<span class="page-gap" aria-hidden="true">…</span>':''}<button class="page-number" data-page="${n}" aria-label="第 ${n} 页"${n===state.page?' aria-current="page"':''}>${n}</button>`).join('');
  pagination.innerHTML=`<button class="button" data-page="${state.page-1}"${state.page===1?' disabled':''}>上一页</button>${numbers}<button class="button" data-page="${state.page+1}"${state.page===state.pageCount?' disabled':''}>下一页</button>`;
}
function cardHTML(base,index=0) {
  const sample=sampleById(state.cardSamples.get(base.id)) || base;
  const levels=orderedEfforts([effort(base),...state.topic.samples.filter(s=>modelKey(s)===modelKey(base)).map(effort)]);
  return `<article class="art-card${state.selected.has(sample.id) ? ' selected' : ''}" data-card-id="${esc(sample.id)}" data-home-id="${esc(base.id)}"><button class="art-frame" data-open="${esc(sample.id)}" aria-label="放大 ${esc(sample.model)} 的作品">${image(sample,index<6)}<span class="expand-hint">${icon('expand')}</span></button><div class="card-meta"><div><div class="model-line"><span class="vendor-dot${sample.provider === 'OpenAI' ? '' : ' other'}"></span><h3>${esc(sample.model)}</h3></div><div class="card-subline"><span>${esc(sample.provider || '其他')}</span><span class="separator">/</span>${levels.length>1 ? `<select class="card-effort" data-card-effort="${esc(base.id)}" aria-label="${esc(sample.model)} 思考深度">${options(levels.map(level=>[level,effortName(level)]),effort(sample))}</select>` : `<span class="effort-tag">${esc(effortName(effort(sample)))}</span>`}</div></div><button class="choose-button" data-choose="${esc(sample.id)}" aria-pressed="${state.selected.has(sample.id)}" aria-label="${state.selected.has(sample.id) ? '取消' : '加入'}对比：${esc(sample.model)}">${icon(state.selected.has(sample.id) ? 'check' : 'plus')}</button></div></article>`;
}
function toggleSelection(id) {
  if (state.selected.has(id)) state.selected.delete(id);
  else { if(state.selected.size>=4) return toast('最多同时比较 4 份作品'); state.selected.add(id); }
  if (state.mode === 'gallery') updateSelectionButtons();
  renderTray();
}
function updateSelectionButtons() {
  main.querySelectorAll('[data-card-id]').forEach(card=>{
    const id=card.dataset.cardId;const selected=state.selected.has(id);const button=card.querySelector('[data-choose]');
    card.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
    button.setAttribute('aria-label',`${selected ? '取消' : '加入'}对比：${sampleById(id).model}`);button.innerHTML=icon(selected ? 'check' : 'plus');
  });
}
function renderTray() {
  const show = state.mode === 'gallery' && state.selected.size>0;
  tray.hidden = !show; document.body.classList.toggle('has-selection',show);
  if (!show) return;
  const selected = [...state.selected].map(sampleById).filter(Boolean);
  tray.innerHTML = `<span class="selection-count">已选 ${selected.length} / 4</span><div class="selection-labels">${selected.map(s=>`<span class="selection-chip">${esc(s.model)} · ${esc(effortName(effort(s)))}</span>`).join('')}</div><button class="text-button" data-action="clear-selection">清空</button><a class="button primary" href="${topicHref('compare',state.topic.id,selected.map(s=>s.id))}">${icon('compare')} 并排比较</a>`;
}

function syncPanels() {
  history.replaceState(null,'',topicHref('compare',state.topic.id,state.panels));
  renderCompare();
}
function renderCompare() {
  main.innerHTML = `<section class="compare-hero"><a class="back-link" href="${topicHref('gallery',state.topic.id)}">${icon('back')} 返回画廊</a><h1>放在一起，慢慢看。</h1><p>每一栏都可以独立选择模型和思考强度，最多同时展示四份作品。</p></section>
    <div class="compare-tools"><label class="topic-label">题目<select id="compare-topic" class="filter-select">${options(data.topics.map(t=>[t.id,t.title]),state.topic.id)}</select></label><div class="compare-actions"><button class="button" data-action="prompt" aria-expanded="${state.promptOpen}" aria-controls="prompt-panel">${icon('file')} 提示词</button><button class="button" data-action="share">${icon('link')} 复制链接</button><button class="button primary" data-action="replay">${icon('replay')} 同步重播</button></div></div>
    ${promptHTML()}<div class="compare-grid${state.panels.length===1 ? ' one' : ''}">${state.panels.length ? state.panels.map((id,index)=>panelHTML(sampleById(id),index)).join('') : '<div class="empty-state"><h3>这个题目还没有作品</h3><p>换一道题看看，新的作品会陆续加入。</p></div>'}${state.panels.length<4 && state.topic.samples.length>state.panels.length ? `<button class="add-panel" data-action="add-panel">${icon('plus')} 添加一份对照作品 <span>同一模型的不同强度也可以</span></button>` : ''}</div>
    <p class="compare-help">${unique(state.topic.samples.map(effort)).length <= 1 ? '这个题目目前只收录了默认强度的样本。以后新增其它强度，会自动出现在每栏的选项中。' : '思考强度选项来自已收录的数据。可以比较不同模型，也可以选择同一模型的不同强度或重复样本。'}</p>`;
  document.querySelector('#compare-topic').addEventListener('change',e=> { location.hash=topicHref('compare',e.target.value); });
  main.querySelectorAll('[data-panel-model]').forEach(select=>select.addEventListener('change',e=>{
    const index=Number(e.target.dataset.panelModel); const previous=sampleById(state.panels[index]);
    const candidates=state.topic.samples.filter(s=>modelKey(s)===e.target.value);
    const next=candidates.find(s=>effort(s)===effort(previous)) || candidates.find(s=>effort(s)==='default') || candidates[0];
    state.panels[index]=next.id; syncPanels();
  }));
  main.querySelectorAll('[data-panel-effort]').forEach(select=>select.addEventListener('change',e=>{
    const index=Number(e.target.dataset.panelEffort); const current=sampleById(state.panels[index]);
    state.panels[index]=state.topic.samples.find(s=>modelKey(s)===modelKey(current) && effort(s)===e.target.value).id;syncPanels();
  }));
  main.querySelectorAll('[data-panel-variant]').forEach(select=>select.addEventListener('change',e=>{state.panels[Number(e.target.dataset.panelVariant)]=e.target.value;syncPanels();}));
  wireImages();
}
function panelHTML(sample,index) {
  const models=[...new Map(state.topic.samples.map(s=>[modelKey(s),s])).values()];
  const sameModel=state.topic.samples.filter(s=>modelKey(s)===modelKey(sample));
  const levels=orderedEfforts(sameModel.map(effort));
  const variants=sameModel.filter(s=>effort(s)===effort(sample));
  return `<section class="compare-panel"><div class="panel-controls"><label>模型<select data-panel-model="${index}" aria-label="第 ${index+1} 栏模型">${options(models.map(s=>[modelKey(s),`${s.model} · ${s.provider || '其他'}`]),modelKey(sample))}</select></label><label>思考强度<select data-panel-effort="${index}" aria-label="第 ${index+1} 栏思考强度">${options(levels.map(l=>[l,effortName(l)]),effort(sample))}</select></label>${variants.length>1 ? `<label>样本<select data-panel-variant="${index}" aria-label="第 ${index+1} 栏样本">${options(variants.map((s,i)=>[s.id,sampleLabel(s)]),sample.id)}</select></label>` : ''}<button class="icon-button remove-panel" data-remove-panel="${index}" aria-label="移除第 ${index+1} 栏"${state.panels.length===1 ? ' disabled' : ''}>${icon('close')}</button></div><button class="art-frame" data-open="${esc(sample.id)}" aria-label="放大 ${esc(sample.model)} 的作品">${image(sample,true)}</button><div class="panel-footer"><span class="note">${esc(`${effortName(effort(sample))} · ${sampleLabel(sample)}`)}</span><a href="${esc(assetURL(sample))}" download="${esc(sample.id)}.svg">${icon('download')} SVG</a></div></section>`;
}

function openArt(id) {
  const sample=sampleById(id); if(!sample)return;
  dialog.innerHTML=`<div class="dialog-header"><div><h2>${esc(sample.model)}</h2><p>${esc(state.topic.title)} · ${esc(sample.provider || '其他')} · ${esc(effortName(effort(sample)))} · ${esc(sampleLabel(sample))}</p></div><button class="icon-button" data-action="close-dialog" aria-label="关闭大图">${icon('close')}</button></div><div class="dialog-art">${image(sample,true)}</div><div class="dialog-actions"><div><button class="button" data-action="replay-dialog">${icon('replay')} 重播</button><a class="button" href="${esc(assetURL(sample))}" download="${esc(sample.id)}.svg">${icon('download')} 下载 SVG</a>${state.mode==='gallery' ? `<button class="button primary" data-dialog-choose="${esc(sample.id)}">${icon('compare')} 加入对比</button>` : ''}</div></div>`;
  wireImages(dialog); dialog.showModal();
}
function replay(scope) {
  scope.querySelectorAll('img[data-art-id]').forEach(img=>{const s=sampleById(img.dataset.artId);if(s)img.src=assetURL(s,true);});
}
async function copy(text,message) {
  try { await navigator.clipboard.writeText(text); toast(message); }
  catch { toast('复制未成功，请手动复制地址栏或提示词'); }
}

document.addEventListener('change',event=>{
  const select=event.target.closest('[data-card-effort]');if(!select)return;
  const base=sampleById(select.dataset.cardEffort);if(!base)return;
  const next=effort(base)===select.value ? base : state.topic.samples.find(s=>modelKey(s)===modelKey(base) && effort(s)===select.value);
  if(!next)return;
  state.cardSamples.set(base.id,next.id);
  const card=select.closest('.art-card');
  const template=document.createElement('template');template.innerHTML=cardHTML(base);
  const replacement=template.content.firstElementChild;
  card.replaceWith(replacement);wireImages(replacement);
  replacement.querySelector('[data-card-effort]').focus({preventScroll:true});
});

document.addEventListener('click',event=>{
  const button=event.target.closest('button,a');if(!button)return;
  if(button.dataset.page!==undefined){
    const page=Number(button.dataset.page);
    if(button.disabled || page===state.page || page<1 || page>state.pageCount)return;
    state.page=page;renderCards();
    const heading=main.querySelector('.topic-heading h2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});
    return;
  }
  if(button.dataset.topic){location.hash=topicHref('gallery',button.dataset.topic);return;}
  if(button.dataset.open){openArt(button.dataset.open);return;}
  if(button.dataset.choose){toggleSelection(button.dataset.choose);return;}
  if(button.dataset.dialogChoose){const id=button.dataset.dialogChoose;if(!state.selected.has(id))toggleSelection(id);dialog.close();return;}
  if(button.dataset.removePanel!==undefined){state.panels.splice(Number(button.dataset.removePanel),1);syncPanels();return;}
  switch(button.dataset.action){
    case 'prompt': state.promptOpen=!state.promptOpen;document.querySelector('#prompt-panel').hidden=!state.promptOpen;main.querySelector('[data-action=prompt]').setAttribute('aria-expanded',String(state.promptOpen));break;
    case 'copy-prompt':copy(state.topic.prompt || state.topic.title,'提示词已复制');break;
    case 'replay':replay(main);toast('已重新播放当前作品');break;
    case 'replay-dialog':replay(dialog);break;
    case 'close-dialog':dialog.close();break;
    case 'clear-selection':state.selected.clear();updateSelectionButtons();renderTray();break;
    case 'clear-filters':state.query='';state.provider='all';state.page=1;renderGallery();break;
    case 'add-panel':if(state.panels.length<4){const next=state.topic.samples.find(s=>!state.panels.includes(s.id)) || state.topic.samples[0];state.panels.push(next.id);syncPanels();}break;
    case 'share':history.replaceState(null,'',topicHref('compare',state.topic.id,state.panels));copy(location.href,'比较链接已复制');break;
  }
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
window.addEventListener('hashchange',route);
fetch('data.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('Data unavailable');return response.json();}).then(value=>{
  if(!value.topics?.length)throw new Error('No topics');data=value;
  sortModels(data);
  const count=data.topics.reduce((n,t)=>n+t.samples.length,0);
  document.querySelector('#footer-count').textContent=`${data.topics.length} 个题目 / ${count} 份作品 · 人工收录`;
  route();
}).catch(error=>{main.innerHTML=`<section class="empty-state"><h3>暂时无法打开画廊</h3><p>请检查 data.json 是否存在且格式正确，再刷新页面。</p><button class="button" id="reload">重新加载</button></section>`;document.querySelector('#reload').onclick=()=>location.reload();console.error(error);});
