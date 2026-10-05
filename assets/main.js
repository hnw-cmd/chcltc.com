'use strict';
const content=window.PORTFOLIO;
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories={...content.creativeCategories,lp:'記事LP・LP',seo:'WordPress・SEO',app:'業務改善アプリ'};
function safeUrl(v){try{const u=new URL(v,location.href);return ['http:','https:','file:'].includes(u.protocol)?u.href:''}catch{return ''}}
function externalUrl(v){try{const u=new URL(v);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}}
const revealedImages=new Set();
let mediaIndex=0;
function media(src,alt,sensitive,mode='card',caption=''){
 const preview=mode!=='detail'&&/^assets\/(?:works\/[^/]+|shipping-orders)\.[a-z0-9]+$/i.test(src||'');
 const displaySrc=preview?'assets/thumbs/'+src.split('/').pop().replace(/\.[^.]+$/,'.webp'):src;
 const key='media-'+(++mediaIndex),url=displaySrc&&safeUrl(displaySrc);
 const video=url&&/\.mp4(?:[?#]|$)/i.test(url);
 const inner=url?(video?`<video src="${esc(url)}" controls playsinline preload="metadata" aria-label="${esc(alt)}"></video>`:`<img src="${esc(url)}" alt="${sensitive?'確認後に表示される制作物':esc(alt)}" data-original-alt="${esc(alt)}" loading="lazy" decoding="async">`):`<div class="media-placeholder"><span>IMAGE</span><p>${esc(alt)}</p><small>画像を追加予定</small></div>`;
 return `<figure class="media media-${esc(mode)} ${sensitive?'is-sensitive':''}" data-media="${key}"><div class="media-frame ${sensitive?'is-concealed':''}"><div class="media-image" ${sensitive?'aria-hidden="true" inert':''}>${inner}</div>${sensitive?`<div class="media-cover"><span>アダルト要素を含みます</span><button type="button" data-reveal="${key}">確認して表示</button></div>`:''}</div>${sensitive?`<button type="button" class="conceal-button" data-conceal="${key}" hidden>画像をぼかす</button>`:''}${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`;
}
function card(w){return `<article class="work-card">${media(w.image,w.title,!!w.sensitive)}<div class="work-meta"><span>${esc(categories[w.category]||'その他')}</span><span>${w.draft?'内容を準備中':esc(w.year)}</span></div><h3><a href="work.html?id=${encodeURIComponent(w.id)}">${esc(w.title)}</a></h3><p>${esc(w.summary)}</p><a class="work-detail-link" href="work.html?id=${encodeURIComponent(w.id)}">詳しく見る</a></article>`}
function imageErrors(){document.querySelectorAll('img:not([data-error-bound])').forEach(img=>{img.dataset.errorBound='true';img.addEventListener('error',()=>{const p=document.createElement('p');p.className='broken';p.textContent='画像を読み込めませんでした。';img.replaceWith(p)},{once:true})})}
function externalLink(url,label,sensitive=false,explicit=false){const u=externalUrl(url);if(!u)return '';return sensitive?`<button type="button" class="text-link external-button" data-external="${esc(u)}" ${explicit?'data-explicit="true"':''}>${esc(label)}（確認して開く）</button>`:`<a class="text-link" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(label)}（別タブ）</a>`}
function skillHtml(skill,i){
 const images=(skill.images||[]).map(img=>media(img.src,img.alt,!!img.sensitive,'skill',img.caption)).join('');
 const related=(skill.categories||[]).map(c=>`<a class="skill-related" href="${c==='lp'?'pages.html?category=article':'works.html?category='+encodeURIComponent(c)}">${esc(categories[c])}の実績</a>`).join('');
 const steps=(skill.process||[]).map((step,n)=>`<li><span class="process-number">${String(n+1).padStart(2,'0')}</span><div><h4>${esc(step.title)}</h4><p>${esc(step.text)}</p></div></li>`).join('');
 const cta=skill.cta?`<a class="button skill-cta" href="${esc(skill.cta.url)}">${esc(skill.cta.label)}</a>`:'';
 return `<details class="skill capability-card" id="skill-${esc(skill.id)}"><summary><span class="skill-number">${String(i+1).padStart(2,'0')}</span><span class="skill-heading"><span class="skill-title">${esc(skill.title)}</span><span class="skill-summary">${esc(skill.summary)}</span><span class="tags">${skill.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</span></span><span class="card-toggle"><span class="when-closed">対応内容を見る</span><span class="when-open">閉じる</span><span class="accordion-icon" aria-hidden="true"></span></span></summary><div class="skill-body"><p class="skill-description">${esc(skill.description)}</p><ol class="capability-process">${steps}</ol>${images?`<div class="capability-example">${images}</div>`:''}<div class="capability-actions">${cta}${related}</div></div></details>`;
}
function renderPerformance(){
 $('#result-cards').innerHTML=content.results.map(r=>`<details class="result-card tone-${esc(r.tone)}" id="result-${esc(r.id)}"><summary><span class="result-label">${esc(r.label)}</span><strong class="result-value">${esc(r.value)}</strong><span class="result-summary">${esc(r.summary)}</span><span class="card-toggle"><span class="when-closed">取り組みを見る</span><span class="when-open">閉じる</span><span class="accordion-icon" aria-hidden="true"></span></span></summary><div class="result-body"><p class="result-period">${esc(r.period)}</p><h3>${esc(r.heading)}</h3>${r.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}${r.figures?`<dl class="ad-summary">${r.figures.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`:''}${r.comparison?`<dl class="result-comparison">${r.comparison.map(c=>`<div><dt>${esc(c.label)}</dt><dd>${esc(c.value)}</dd></div>`).join('')}</dl>`:''}<a class="text-link" href="${esc(r.cta.url)}">${esc(r.cta.label)}</a></div></details>`).join('');
}
if(content){
 document.querySelectorAll('[data-name]').forEach(el=>el.textContent=content.profile.name);
 $('#year').textContent=new Date().getFullYear();
 const email=content.profile.email.trim(),phone=content.profile.phone||'';
 $('#email').innerHTML=`<dl class="contact-list"><div><dt>メールアドレス</dt><dd><a href="mailto:${esc(email)}">${esc(email)}</a></dd></div><div><dt>電話番号</dt><dd><a href="tel:${esc(phone.replace(/[^+0-9]/g,''))}">${esc(phone)}</a></dd></div></dl>`;
 if(document.body.dataset.page==='home'){
  $('#expertise-list').innerHTML=(content.skills||[]).map(skillHtml).join('');
  $('#featured').innerHTML=content.featuredLinks.map(w=>`<article class="work-card featured-card tone-${esc(w.tone)}">${w.image?media(w.image,w.alt,false):'<div class="page-tile"><span>WEB PAGES</span><strong>記事LP / 商品LP<br>Webサイト</strong><span>種類別のURL一覧</span></div>'}<div class="featured-copy"><span class="work-meta">${esc(w.label)}</span><h3>${esc(w.title)}</h3><p>${esc(w.description)}</p><a class="button featured-button" href="${esc(w.url)}">${esc(w.button)}</a></div></article>`).join('');
  $('#profile-lead').textContent=content.profile.lead;
  $('#profile-direction').textContent=content.profile.direction;
  $('#profile-highlights').innerHTML=content.profile.highlights.map(t=>`<span>${esc(t)}</span>`).join('');
  $('#profile-story').innerHTML=(content.profile.story||[]).map(t=>`<p>${esc(t)}</p>`).join('');
  renderPerformance();
  for(const [id,key] of [['intro','intro'],['profile-name','nameJa'],['profile-kana','kana'],['birthday','birthday'],['experience','experience']])$('#'+id).textContent=content.profile[key];
  $('#tools').innerHTML=content.profile.tools.map(t=>`<span class="tool-tag">${esc(t)}</span>`).join('');
  if(content.profile.photo&&safeUrl(content.profile.photo))$('#profile-photo').src=safeUrl(content.profile.photo);
 }
 if(['works','adult'].includes(document.body.dataset.page)){
  const adult=document.body.dataset.page==='adult';
  $('#work-filters').innerHTML=Object.entries({all:'すべて',...content.creativeCategories}).map(([key,label])=>`<button data-filter="${key}" aria-pressed="false">${esc(label)}</button>`).join('');
  function render(filter){
   const works=content.works.filter(w=>!!w.sensitive===adult&&!!w.image&&(filter==='all'||w.category===filter));
   $('#all-works').innerHTML=works.map(card).join('')||'<p class="empty">このカテゴリの公開画像は準備中です。</p>';
   $('#work-count').textContent=`${works.length} 件`;
   document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
   if($('#adult-link'))$('#adult-link').href='adult-works.html'+(filter==='all'?'':'?category='+encodeURIComponent(filter));
   imageErrors();
  }
  const initial=new URLSearchParams(location.search).get('category');render(content.creativeCategories[initial]?initial:'all');
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.filter)));
 }
 if(['pages','adult-pages'].includes(document.body.dataset.page)){
  const adult=document.body.dataset.page==='adult-pages',cats=adult?content.adultLinkCategories:content.linkCategories;
  const entriesForPage=content.pages.filter(p=>!!p.adultPage===adult);
  const keyFor=p=>adult?p.group:p.category;
  $('#page-filters').innerHTML=Object.entries({all:'すべて',...cats}).map(([key,label])=>`<button data-page-filter="${key}" aria-pressed="false">${esc(label)}</button>`).join('');
  function renderPages(filter){
   const entries=Object.entries(cats).filter(([key])=>filter==='all'||key===filter);
   $('#page-list').innerHTML=entries.map(([key,label])=>{
    const items=entriesForPage.filter(p=>keyFor(p)===key&&externalUrl(p.url));
    return `<section class="url-category"><h2>${esc(label)}<span>${items.length}件</span></h2>${items.length?items.map(p=>`<article class="url-row"><div>${p.featured?'<span class="representative-label">代表作</span>':''}<h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><span class="visible-url">${esc(p.url)}</span>${p.sensitive?`<span class="adult-label">${adult?'過激なアダルト表現あり':'アダルト要素あり'}</span>`:''}</div><div>${externalLink(p.url,'ページを見る',!!p.sensitive,adult)}</div></article>`).join(''):'<p class="empty">掲載するURLを準備中です。</p>'}</section>`;
   }).join('');
   $('#page-count').textContent=entriesForPage.filter(p=>(filter==='all'||keyFor(p)===filter)&&externalUrl(p.url)).length+' 件';
   document.querySelectorAll('[data-page-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pageFilter===filter)));
  }
  const initial=new URLSearchParams(location.search).get('category');renderPages(cats[initial]?initial:'all');
  document.querySelectorAll('[data-page-filter]').forEach(b=>b.addEventListener('click',()=>renderPages(b.dataset.pageFilter)));
 }
 if(document.body.dataset.page==='detail'){
  const id=new URLSearchParams(location.search).get('id'),w=content.works.find(w=>w.id===id);
  if(!w){$('#work-detail').innerHTML='<h1>制作物が見つかりません</h1><p>一覧ページから制作物を選んでください。</p>'}else{
   document.title=`${w.title} | 中野 陽規`;
   $('#work-detail').innerHTML=`<span class="eyebrow">${esc(categories[w.category]||'WORK')}</span><h1>${esc(w.title)}</h1><p class="page-lead">${esc(w.summary)}</p>${w.draft?'<p class="notice">画像や制作内容の詳細は準備中です。</p>':''}${w.sensitive?'<p class="content-note">アダルト要素を含む制作物です。画像は一枚ずつ、内容を確認したいものだけ表示できます。</p>':''}<div class="detail-meta">${w.year?`<div><span>制作年</span>${esc(w.year)}</div>`:''}${w.role?`<div><span>担当</span>${esc(w.role)}</div>`:''}${w.tools?`<div><span>ツール</span>${esc(w.tools)}</div>`:''}${w.originalFilename?`<div class="source-name"><span>作品ファイル</span>${esc(w.originalFilename)}</div>`:''}</div><div class="detail-hero">${media(w.image,w.title,!!w.sensitive,'detail')}</div><div class="case-sections">${[['01','制作の目的',w.challenge],['02','担当したこと・工夫',w.approach],['03','結果',w.result]].filter(s=>s[2]).map(s=>`<section class="case-section"><h2><small>${s[0]}</small>${s[1]}</h2><p>${esc(s[2])}</p></section>`).join('')}</div><div class="gallery">${(w.images||[]).map((item,i)=>{const img=typeof item==='string'?{src:item}:item;return media(img.src,img.alt||`${w.title}の詳細画像 ${i+1}`,img.sensitive??!!w.sensitive,'detail',img.caption||'')}).join('')}</div>${w.url?`<p class="back">${externalLink(w.url,'公開ページを見る',!!w.sensitive)}</p>`:''}`;
  }
 }
 imageErrors();
}

// Reveal consent is scoped to the selected image, not the whole page or category.
(function setupMediaConsent(){
 const dialog=$('#content-dialog');if(!dialog)return;
 let pending=null,trigger=null;
 const imageConfirm=dialog.querySelector('[value="confirm"]');
 const externalConfirm=document.createElement('a');
 externalConfirm.className='button';externalConfirm.target='_blank';externalConfirm.rel='noopener noreferrer';
 externalConfirm.textContent='サイトを開く（別タブ）';externalConfirm.hidden=true;
 imageConfirm.after(externalConfirm);
 externalConfirm.addEventListener('click',()=>{dialog.close('external-opened');});
 function request(action,button){
  pending=action;trigger=button;
  $('#content-dialog-message').textContent=action.type==='external'?(action.explicit?'移動先には過激なアダルト表現が含まれます。内容を確認してサイトを開きますか？':'移動先のサイトにはアダルト要素が含まれます。サイトを開きますか？'):'この画像には性的な表現が含まれる場合があります。表示するのは選んだ画像だけです。';
  imageConfirm.textContent='この画像を表示する';
  imageConfirm.hidden=action.type==='external';externalConfirm.hidden=action.type!=='external';
  if(action.type==='external')externalConfirm.href=externalUrl(action.url);else externalConfirm.removeAttribute('href');
  if(typeof dialog.showModal==='function'){dialog.returnValue='';dialog.showModal()}else{if(window.confirm($('#content-dialog-message').textContent))complete();pending=null;}
 }
 function complete(){
  if(!pending)return;
  if(pending.type==='external'){window.open(pending.url,'_blank','noopener,noreferrer');return;}
  const figure=document.querySelector(`[data-media="${pending.key}"]`);if(!figure)return;
  revealedImages.add(pending.key);
  figure.querySelector('.media-frame').classList.remove('is-concealed');
  const body=figure.querySelector('.media-image');body.removeAttribute('aria-hidden');body.removeAttribute('inert');
  const img=body.querySelector('img');if(img)img.alt=img.dataset.originalAlt;
  figure.querySelector('.media-cover').hidden=true;
  const conceal=figure.querySelector('[data-conceal]');conceal.hidden=false;conceal.focus();
 }
 document.addEventListener('click',e=>{
  const reveal=e.target.closest('[data-reveal]');if(reveal){request({type:'image',key:reveal.dataset.reveal},reveal);return;}
  const external=e.target.closest('[data-external]');if(external){request({type:'external',url:external.dataset.external,explicit:external.dataset.explicit==='true'},external);return;}
  const conceal=e.target.closest('[data-conceal]');if(conceal){
   const f=conceal.closest('[data-media]');revealedImages.delete(f.dataset.media);f.querySelector('.media-frame').classList.add('is-concealed');f.querySelector('.media-image').setAttribute('aria-hidden','true');f.querySelector('.media-image').setAttribute('inert','');
   const video=f.querySelector('video');if(video)video.pause();const img=f.querySelector('img');if(img)img.alt='確認後に表示される制作物';f.querySelector('.media-cover').hidden=false;conceal.hidden=true;f.querySelector('[data-reveal]').focus();
  }
 });
 dialog.addEventListener('close',()=>{const confirmed=dialog.returnValue==='confirm';if(confirmed&&pending?.type==='image')complete();if(!confirmed||pending?.type==='external')trigger?.focus();pending=null;});
})();

// Select page-level navigation independently from scroll animations.
(function setupNavigation(){
 const nav=[...document.querySelectorAll('[data-nav]')],page=document.body.dataset.page;
 const header=$('.header');let queued=false;
 function select(key,type='location'){nav.forEach(a=>a.dataset.nav===key?a.setAttribute('aria-current',type):a.removeAttribute('aria-current'));}
 function update(){
  queued=false;
  const line=(header?.getBoundingClientRect().height||100)+48;
  const atBottom=scrollY>0&&Math.ceil(scrollY+innerHeight)>=document.documentElement.scrollHeight-2;
  if(page!=='home'){
   const contact=$('#contact'),inContact=contact&&(contact.getBoundingClientRect().top<=line||atBottom);select(inContact?'contact':'works',inContact?'location':'page');return;
  }
  let current='about';
  const sections=[['about','about'],['results','about'],['selected-works','works'],['expertise','expertise'],['contact','contact']].map(([id,key])=>({el:document.getElementById(id),key})).filter(x=>x.el).sort((a,b)=>a.el.offsetTop-b.el.offsetTop);
  sections.forEach(({el,key})=>{if(el.getBoundingClientRect().top<=line)current=key});
  if(atBottom)current='contact';
  select(current);
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(update)}}
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);window.addEventListener('hashchange',queue);window.addEventListener('pageshow',queue);window.addEventListener('load',queue);
 document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',queue));
 nav.forEach(a=>a.addEventListener('click',()=>select(a.dataset.nav,a.dataset.nav==='works'?'page':'location')));
 if('ResizeObserver' in window)new ResizeObserver(queue).observe(document.body);
 update();
})();

// Motion is progressive enhancement: content stays visible when APIs are unavailable.
(function enablePortfolioMotion(){
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 if(!window.addEventListener)return;
 const active=new Set();
 function animate(el,frames,options){
  if(reduced?.matches||!el?.animate)return;
  const a=el.animate(frames,options);active.add(a);
  a.finished.then(()=>active.delete(a),()=>active.delete(a));
 }
 function refreshMotionPreference(){
  document.body.classList.toggle('motion-enabled',!reduced?.matches);
  if(reduced?.matches){active.forEach(a=>a.cancel());active.clear();}
 }
 refreshMotionPreference();reduced?.addEventListener('change',refreshMotionPreference);
 const intro=document.querySelectorAll('.portfolio-title,.profile-photo,.profile-copy');
 intro.forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:i*75,easing:'cubic-bezier(.22,.7,.3,1)',fill:'backwards'}));
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   observer.unobserve(entry.target);
   animate(entry.target,[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.22,.7,.3,1)'});
  }),{threshold:0.08});
  document.querySelectorAll('.section-heading,.skill,.work-card,.metric,.about-layout,.contact,.case-section').forEach(el=>observer.observe(el));
 }
 document.querySelectorAll('details.skill').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)animate(details.querySelector('.skill-body'),[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'})}));
 const progress=document.querySelector('.reading-progress'),header=document.querySelector('.header');
 let ticking=false;
 function scrollUpdate(){
  const height=document.documentElement.scrollHeight-innerHeight;
  if(progress)progress.style.transform=`scaleX(${height>0?Math.min(1,Math.max(0,scrollY/height)):0})`;
  header?.classList.toggle('is-scrolled',scrollY>16);ticking=false;
 }
 function queueScroll(){if(!ticking){ticking=true;requestAnimationFrame(scrollUpdate)}}
 window.addEventListener('scroll',queueScroll,{passive:true});window.addEventListener('resize',queueScroll);window.addEventListener('load',queueScroll);scrollUpdate();
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('#all-works .work-card').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,delay:Math.min(i,6)*40,easing:'ease-out',fill:'backwards'}));queueScroll();
 }));
})();

(function expandableCards(){
 document.querySelectorAll('.capability-card').forEach(card=>card.addEventListener('toggle',()=>{if(card.open){document.querySelectorAll('.capability-card[open]').forEach(other=>{if(other!==card)other.open=false;});}}));
 document.querySelectorAll('details.profile-more,details.result-card').forEach(d=>d.addEventListener('toggle',()=>window.dispatchEvent(new Event('resize'))));
})();
