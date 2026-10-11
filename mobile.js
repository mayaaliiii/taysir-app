(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const curView=()=>{const v=$('.view.active-view');return v?v.id.replace('view-',''):'dashboard'};
let restoring=false,skip=false,afterSkip=null,exitT=0,lastView=curView(),sheet=null,hadModal=false;
const modalRoot=$('#modal-root');
const modalOpen=()=>modalRoot&&modalRoot.children.length>0;
history.replaceState({t:'root'},'');history.pushState({t:'v',v:curView()},'');

function exitToast(){let e=$('.tz-exit');if(!e){e=document.createElement('div');e.className='tz-exit';e.textContent='اضغط رجوع مرة ثانية للخروج';document.body.appendChild(e)}void e.offsetWidth;e.classList.add('on');clearTimeout(exitT);exitT=setTimeout(()=>e.classList.remove('on'),2200)}
function goView(v){const b=$(`.nav-item[data-view="${v}"]`);if(b&&curView()!==v){restoring=true;b.click();setTimeout(()=>restoring=false,60)}}
function backSilently(cb){skip=true;afterSkip=cb||null;history.back()}

/* نوافذ سفلية */
function openSheet(html,mount){if(sheet)sheet.remove();const b=document.createElement('div');b.className='tz-sheet-back';b.innerHTML=`<div class="tz-sheet"><i class="tz-grab"></i>${html}</div>`;b.addEventListener('click',e=>{if(e.target===b)closeSheet()});document.body.appendChild(b);sheet=b;history.pushState({t:'s'},'');mount&&mount(b)}
function closeSheet(cb){if(!sheet)return;sheet.remove();sheet=null;if(history.state&&history.state.t==='s')backSilently(cb);else cb&&cb()}

/* زر الرجوع */
addEventListener('popstate',e=>{
  if(skip){skip=false;const f=afterSkip;afterSkip=null;f&&f();return}
  if(sheet){sheet.remove();sheet=null;return}
  if(modalOpen()){modalRoot.innerHTML='';hadModal=false;return}
  const s=e.state||{};
  if(s.t==='root'){goView('dashboard');exitToast();return}
  if(s.t==='v')goView(s.v);
});
new MutationObserver(()=>{const v=curView();$$('.nav-more').forEach(b=>b.classList.toggle('active',['companies','ai','settings'].includes(v)));if(v===lastView)return;lastView=v;if(!restoring)history.pushState({t:'v',v},'')}).observe($('.main-content'),{subtree:true,attributes:true,attributeFilter:['class']});
if(modalRoot)new MutationObserver(()=>{const m=modalOpen();if(m&&!hadModal&&!sheet)history.pushState({t:'o'},'');if(!m&&hadModal&&history.state&&history.state.t==='o')backSilently();hadModal=m}).observe(modalRoot,{childList:true});

/* تبويب «المزيد» */
const nav=$('.nav');
if(nav){const more=document.createElement('button');more.type='button';more.className='nav-item nav-more';more.innerHTML='<span>⋯</span> المزيد';nav.appendChild(more);
more.onclick=()=>openSheet('<h3 class="tz-h">المزيد</h3>'+[['companies','◇','الشركات والعلامات'],['ai','✦','مساعد التيسير الذكي'],['settings','⚙','الإعدادات']].map(x=>`<button class="tz-opt" data-v="${x[0]}"><b>${x[1]}</b>${x[2]}</button>`).join(''),b=>$$('.tz-opt',b).forEach(o=>o.onclick=()=>closeSheet(()=>{const n=$(`.nav-item[data-view="${o.dataset.v}"]`);n&&n.click()})))}

/* اختيار المنتج بشكل احترافي */
const sel=$('#ai-product-select');
if(sel){sel.style.display='none';const f=document.createElement('button');f.type='button';f.className='tz-field';sel.after(f);
const label=()=>{const o=sel.options[sel.selectedIndex];f.innerHTML=`<span>${esc(sel.value&&o?o.textContent:'اختر منتجاً… أو اتركه للمساعد')}</span><i>⌄</i>`};label();
new MutationObserver(label).observe(sel,{childList:true});
f.onclick=()=>{const ps=[...sel.options].filter(o=>o.value);openSheet('<h3 class="tz-h">اختر منتجاً</h3><input class="tz-search" type="search" placeholder="ابحث باسم المنتج…"><button class="tz-opt" data-id=""><b>✦</b>اترك المساعد يختار من البضاعة</button>'+ps.map(o=>`<button class="tz-opt tz-p" data-id="${esc(o.value)}">${esc(o.textContent)}</button>`).join(''),b=>{
 $('.tz-search',b).oninput=e=>{const q=e.target.value.trim();$$('.tz-p',b).forEach(x=>x.style.display=x.textContent.includes(q)?'':'none')};
 $$('.tz-opt',b).forEach(o=>o.onclick=()=>closeSheet(()=>{sel.value=o.dataset.id;sel.dispatchEvent(new Event('change',{bubbles:true}));label()}))})}}

/* بطاقة الدولار: اضغط لتعديل السعر يدوياً */
document.addEventListener('click',e=>{if(e.target.closest('.rate-lite'))goView('settings')});
})();
