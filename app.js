import {RELEASES,DOCUMENTS,RECORDS,MESSAGES,SECTIONS,AUTHORITY,CONSTRAINTS,CRITERIA,RESPONSE_GUIDANCE} from './case.js';
import {STORAGE_KEY,MAX_TEXT,freshState,validateState,reconcile,wordCount,briefText} from './engine.js';

const $=id=>document.getElementById(id);
const icons={
 folder:'<path d="M3 6h6l2 2h10v11H3z"/><path d="M3 6V4h6l2 2h9v2"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 edit:'<path d="M13 5H5v15h15v-8M10 14l1-4 8-8 3 3-8 8-4 1z"/>',
 cloud:'<path d="M7 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1-1 11z"/>',
 file:'<path d="M6 2h8l5 5v15H6zM14 2v6h5M9 12h7M9 16h7"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>'
};
function icon(name){const span=document.createElement('span');span.className='inline-icon';span.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;return span;}
document.querySelectorAll('[data-icon]').forEach(n=>n.replaceWith(icon(n.dataset.icon)));
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function btn(text,cls,action){const n=el('button',cls,text);n.type='button';n.addEventListener('click',action);return n;}
let state=null,saved=null,section='initial',view='drive',saveTimer,toastTimer,lastWorkingTrigger=null;
const beginButton=$('start-form').querySelector('[type=submit]');

function storageWarning(message){$('storage-warning').textContent=message;$('storage-warning').hidden=!message;}
try {const raw=localStorage.getItem(STORAGE_KEY);if(raw)saved=validateState(JSON.parse(raw));}
catch {storageWarning('Your saved brief could not be reopened. Open a saved copy, or start a new brief.');}
function save(){
 if(!state)return;
 clearTimeout(saveTimer);state.savedAt=Date.now();
 try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('save-status').textContent='Saved';storageWarning('');}
 catch {$('save-status').textContent='Save a copy';storageWarning('Your work could not be saved. Download your brief or save a copy before leaving this page.');}
}
function queueSave(){ $('save-status').textContent='Saving…';clearTimeout(saveTimer);saveTimer=setTimeout(save,250); }
function showStart(){
 const has=!!saved;
 $('resume-controls').hidden=!has;beginButton.hidden=has;
 $('team-name').value=has?saved.team:'';$('team-name').readOnly=has;
 if(has)$('resume-description').textContent=`Your brief for ${saved.team} is ready to reopen.`;
}
showStart();
function enterWorkspace(next){
 state=next;reconcile(state);saved=state;
 section=SECTIONS.filter(s=>state.seen.includes(s.release)).at(-1).id;
 $('welcome').hidden=true;$('app').hidden=false;
 $('sidebar-team').textContent=state.team;$('working-team').textContent=state.team;
 renderDrive();renderInbox();renderWorkingTabs();renderWorkingFields();renderRequest();switchView('drive');save();
 $('drive-heading').tabIndex=-1;$('drive-heading').focus();
}
$('start-form').addEventListener('submit',e=>{e.preventDefault();if(saved){enterWorkspace(saved);return;}const name=$('team-name').value.trim();if(!name){$('welcome-error').textContent='Enter a team name.';$('team-name').focus();return;}enterWorkspace(freshState(name));});
$('resume-button').addEventListener('click',()=>enterWorkspace(saved));
$('new-button').addEventListener('click',()=>{if(!confirm('Start a new brief? Download the current brief or save a copy first if you need to keep it.'))return;saved=null;try{localStorage.removeItem(STORAGE_KEY);}catch{}showStart();$('team-name').focus();});
$('restore-button').addEventListener('click',()=>$('restore-file').click());
$('restore-file').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try {
  if(file.size>1000000)throw Error('Too large');
  const imported=validateState(JSON.parse(await file.text()));
  if(saved&&!confirm('Replace the current saved brief with this copy?'))return;
  $('welcome-error').textContent='';enterWorkspace(imported);
 }catch{$('welcome-error').textContent='This copy could not be opened. Choose a saved Alder workspace file.';}
 finally{e.target.value='';}
});
function availableDocs(){return DOCUMENTS.filter(d=>state.seen.includes(d.release));}
function releaseLabel(id){return RELEASES.find(r=>r.id===id).label;}
function unreadCount(){return state.seen.filter(id=>!state.read.includes(id)).length;}
function renderDrive(){
 const docs=availableDocs();$('file-list').replaceChildren();
 for(const d of docs){
  const row=el('tr');const td=el('td');
  const button=btn('', 'file-link',()=>openDocument(d.id));button.append(icon('file'));
  const title=el('span');title.append(el('span','file-name',d.title),el('span','file-kind',`${d.type} · ${d.records.join(', ')}`));button.append(title);
  if(!state.opened.includes(d.id))button.append(el('span','new-dot'));
  td.append(button);row.append(td,el('td','',d.owner),el('td','file-received',releaseLabel(d.release)));$('file-list').append(row);
 }
 $('file-count').textContent=docs.length;$('drive-total').textContent=docs.length===1?'1 document':`${docs.length} documents`;
 const last=RELEASES.filter(r=>state.seen.includes(r.id)&&r.id!=='brief').at(-1);
 $('latest-records').textContent=`Latest records · ${last.label}`;
}
function renderInbox(){
 const unread=unreadCount();$('inbox-count').textContent=unread;$('mail-badge').textContent=unread;$('mail-badge').hidden=unread===0;
 $('mail-button').setAttribute('aria-label',`Open inbox${unread?`, ${unread} unread message${unread===1?'':'s'}`:''}`);
 $('message-list').replaceChildren();
 for(const m of MESSAGES.filter(m=>state.seen.includes(m.id)).reverse()){
  const read=state.read.includes(m.id);const row=btn('','message-row'+(read?' read':''),()=>openMessage(m.id));
  row.append(el('span',read?'':'new-dot'));
  const content=el('span','mail-content');content.append(el('span','mail-from',m.sender),el('strong','',m.subject),el('span','mail-preview',m.preview));
  row.append(content,el('span','mail-time',releaseLabel(m.id)));$('message-list').append(row);
 }
}
function renderRequest(){
 const id=state.seen.at(-1);const text={morning:'Assess the initial exposure and recommend two immediate actions.',records:'Review the additional records and revise your assessment.',recovery:'Recommend a service route and prepare the board statement.',brief:'Finalize one brief for your team’s submission.'};
 $('task-summary').textContent=text[id];
}
function switchView(next){
 view=next;for(const v of ['drive','inbox','document'])$(v+'-view').hidden=v!==next;
 $('nav-drive').classList.toggle('selected',next!=='inbox');$('nav-inbox').classList.toggle('selected',next==='inbox');
}
$('nav-drive').addEventListener('click',()=>{renderDrive();switchView('drive');});
$('nav-inbox').addEventListener('click',()=>{renderInbox();switchView('inbox');});
$('mail-button').addEventListener('click',()=>{if(innerWidth<1000&&!$('working-panel').hidden)closeWorking();renderInbox();switchView('inbox');$('inbox-heading').tabIndex=-1;$('inbox-heading').focus();});
$('initial-button').addEventListener('click',()=>openDocument('situation'));
$('back-drive').addEventListener('click',()=>{renderDrive();switchView('drive');$('drive-heading').focus();});
$('request-button').addEventListener('click',()=>openMessage(state.seen.at(-1)));
function openDocument(id){
 const d=availableDocs().find(d=>d.id===id);if(!d)return;
 if(innerWidth<1000&&!$('working-panel').hidden)closeWorking();
 if(!state.opened.includes(id)){state.opened.push(id);save();renderDrive();}
 $('document-title').textContent=d.title;$('document-type').textContent=d.type;
 $('document-meta').replaceChildren();
 for(const [label,value] of [['From',d.owner],['Received',releaseLabel(d.release)],['Reference',d.records.join(', ')]]){
  const group=el('div');group.append(el('dt','',label),el('dd','',value));$('document-meta').append(group);
 }
 const body=$('document-body');body.replaceChildren();
 if(d.intro)for(const p of d.intro)body.append(el('p','',p));
 body.append(el('h2','','Available records'));
 for(const id of d.records){
  const record=RECORDS.find(r=>r.id===id);const group=el('section','evidence-record');const heading=el('h3');heading.append(el('span','evidence-id',id),document.createTextNode(record.title));group.append(heading,el('p','',record.body));body.append(group);
 }
 if(d.context){body.append(el('h2','','Authority and working constraints'),el('p','',AUTHORITY),el('p','',CONSTRAINTS),el('h2','','Preparing your brief'),el('p','',RESPONSE_GUIDANCE));}
 if(id==='continuity')body.append(el('h2','','Decision criteria'),el('p','',CRITERIA));
 switchView('document');$('document-title').focus();scrollTo({top:0,behavior:'instant'});
}
function openMessage(id){
 const m=MESSAGES.find(m=>m.id===id&&state.seen.includes(id));if(!m)return;
 if(!state.read.includes(id)){state.read.push(id);save();renderInbox();}
 $('arrival-toast').hidden=true;
 $('mail-subject').textContent=m.subject;$('mail-sender').textContent=`From: ${m.sender} · ${releaseLabel(id)}`;
 $('mail-body').replaceChildren(...m.body.map(p=>el('p','',p)));$('mail-attachments').replaceChildren();
 for(const id of m.docs){const d=DOCUMENTS.find(d=>d.id===id);const b=btn('','attachment',()=>{$('message-dialog').close();openDocument(id);});b.append(icon('file'),document.createTextNode(d.title));$('mail-attachments').append(b);}
 if(!$('message-dialog').open)$('message-dialog').showModal();
}
$('close-message').addEventListener('click',()=>$('message-dialog').close());
$('message-dialog').addEventListener('click',e=>{if(e.target===$('message-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
function renderWorkingTabs(){
 $('section-tabs').replaceChildren();
 for(const s of SECTIONS.filter(s=>state.seen.includes(s.release))){const b=btn(s.label,'section-tab',()=>{section=s.id;renderWorkingTabs();renderWorkingFields();$('working-fields').scrollTop=0;});b.setAttribute('aria-pressed',String(section===s.id));$('section-tabs').append(b);}
}
function renderWorkingFields(){
 const s=SECTIONS.find(s=>s.id===section);const host=$('working-fields');host.replaceChildren(el('p','section-description',s.description),el('p','response-guidance',RESPONSE_GUIDANCE));
 for(const f of s.fields){
  const group=el('div','field-group');const label=el('label','',f.label);label.htmlFor=f.id;const help=el('p','field-help',f.help);help.id=f.id+'-help';
  const input=el('textarea');input.id=f.id;input.name=f.id;input.maxLength=MAX_TEXT;input.rows=f.id==='boardStatement'?7:5;input.value=state.fields[f.id];input.setAttribute('aria-describedby',help.id+(f.id==='boardStatement'?' board-count':''));
  input.addEventListener('input',()=>{state.fields[f.id]=input.value;queueSave();if(f.id==='boardStatement')updateWordCount();});
  group.append(label,help,input);
  if(f.id==='boardStatement'){const counter=el('p','word-count');counter.id='board-count';counter.setAttribute('aria-live','polite');group.append(counter);}
  host.append(group);
 }
 updateWordCount();
}
function updateWordCount(){const c=$('board-count');if(!c)return;const count=wordCount(state.fields.boardStatement);c.textContent=`${count} / 70 words${count>70?' — shorten before submitting':''}`;c.classList.toggle('over',count>70);}
function openWorking(trigger){
 lastWorkingTrigger=trigger||document.activeElement;$('working-panel').hidden=false;$('app').classList.add('working-open');$('nav-brief').setAttribute('aria-expanded','true');$('close-working').focus();
 syncPanelAccess();
}
function closeWorking(){
 $('working-panel').hidden=true;$('app').classList.remove('working-open');$('nav-brief').setAttribute('aria-expanded','false');syncPanelAccess();if(lastWorkingTrigger?.isConnected)lastWorkingTrigger.focus();
}
function syncPanelAccess(){const overlay=innerWidth<1000&&!$('working-panel').hidden;$('working-scrim').hidden=!overlay;document.querySelector('.sidebar').inert=overlay;document.querySelector('.shell').inert=overlay;}
window.addEventListener('resize',syncPanelAccess);
$('working-scrim').addEventListener('click',closeWorking);
$('nav-brief').addEventListener('click',e=>openWorking(e.currentTarget));$('close-working').addEventListener('click',closeWorking);
document.addEventListener('keydown',e=>{
 if($('message-dialog').open||$('history-dialog').open||$('working-panel').hidden)return;
 if(e.key==='Escape')closeWorking();
 if(e.key==='Tab'&&innerWidth<1000){
  const items=[...$('working-panel').querySelectorAll('button,textarea'),$('mail-button'),...$('arrival-toast').querySelectorAll('button')].filter(n=>n.getClientRects().length&&!n.disabled);
  const first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function filename(suffix){return `Alder-${state.team.replace(/[^\p{L}\p{N}._-]+/gu,'-')}-${suffix}`;}
$('download-brief').addEventListener('click',()=>{save();const words=wordCount(state.fields.boardStatement);if(words>70&&!confirm(`The board statement is ${words} words; the limit is 70. Download this draft anyway?`))return;download(briefText(state),filename('brief.txt'),'text/plain;charset=utf-8');});
$('save-copy').addEventListener('click',()=>{save();download(JSON.stringify(state,null,2),filename('workspace.json'),'application/json');});
$('history-button').addEventListener('click',()=>{
 const body=$('history-body');body.replaceChildren();
 if(!state.snapshots.length)body.append(el('p','','No earlier drafts are available yet. Continue your assessment in the working file.'));
 for(const snapshot of state.snapshots){
  const group=el('section','history-draft');group.append(el('h3','',{records:'Before the 8:45 records',recovery:'Before the 9:05 records',brief:'Before the final brief request'}[snapshot.before]));const dl=el('dl');
  for(const s of SECTIONS)for(const f of s.fields)if(snapshot.fields[f.id])dl.append(el('dt','',`${s.label} · ${f.label}`),el('dd','',snapshot.fields[f.id]));
  if(!dl.children.length)group.append(el('p','','No response was recorded at this point.'));else group.append(dl);body.append(group);
 }
 $('history-dialog').showModal();
});
$('close-history').addEventListener('click',()=>$('history-dialog').close());
function showArrival(ids){
 clearTimeout(toastTimer);const latest=ids.at(-1);const m=MESSAGES.find(m=>m.id===latest);const toast=$('arrival-toast');toast.replaceChildren(el('strong','',ids.length>1?`${ids.length} messages received`:m.sender),el('p','',m.subject));
 const actions=el('div');actions.append(btn('Open email','text-button',()=>openMessage(latest)),btn('Dismiss','text-button',()=>{toast.hidden=true;}));toast.append(actions);toast.hidden=false;
 toastTimer=setTimeout(()=>{toast.hidden=true;},14000);
}
function tick(){if(!state)return;const arrivals=reconcile(state);if(!arrivals.length)return;save();renderDrive();renderInbox();renderWorkingTabs();renderRequest();showArrival(arrivals);}
setInterval(tick,1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
window.addEventListener('focus',tick);window.addEventListener('pageshow',tick);window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
