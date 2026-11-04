import {CASE_ID,RELEASES,SECTIONS,DOCUMENTS} from './case.js';
export const STORAGE_KEY='alder-morning-outage.v1';
export const FIELD_IDS=SECTIONS.flatMap(s=>s.fields.map(f=>f.id));
export const MAX_TEXT=12000;
export function freshState(team,now=Date.now()){
  return {version:1,caseId:CASE_ID,team:team.trim().slice(0,100),startedAt:now,savedAt:now,seen:['morning'],read:[],opened:[],fields:Object.fromEntries(FIELD_IDS.map(k=>[k,''])),snapshots:[]};
}
export function validateState(raw,now=Date.now()){
  if(!raw||raw.version!==1||raw.caseId!==CASE_ID||typeof raw.team!=='string'||!raw.team.trim()||raw.team.length>100)throw Error('Invalid team');
  if(!Number.isFinite(raw.startedAt)||raw.startedAt<0||raw.startedAt>now+60000||!Number.isFinite(raw.savedAt))throw Error('Invalid date');
  const fields={};
  for(const k of FIELD_IDS){if(typeof raw.fields?.[k]!=='string'||raw.fields[k].length>MAX_TEXT)throw Error('Invalid brief');fields[k]=raw.fields[k];}
  const known=RELEASES.map(r=>r.id);
  const list=(v,allowed)=>{if(!Array.isArray(v)||v.length>30||v.some(x=>typeof x!=='string'||!allowed.includes(x)))throw Error('Invalid list');return [...new Set(v)];};
  const seen=list(raw.seen,known); if(!seen.includes('morning')) throw Error('Missing briefing');
  if(JSON.stringify(seen)!==JSON.stringify(known.slice(0,seen.length)))throw Error('Invalid release order');
  const read=list(raw.read,known);
  if(read.some(id=>!seen.includes(id)))throw Error('Unread release');
  const opened=list(raw.opened,['situation','provider','addresses','export','continuity','response','pilot','dispatch','board']);
  if(opened.some(id=>!seen.includes(DOCUMENTS.find(d=>d.id===id).release)))throw Error('Unavailable document');
  if(!Array.isArray(raw.snapshots)||raw.snapshots.length>3)throw Error('Invalid history');
  const snapshots=raw.snapshots.map(s=>{
    if(!['records','recovery','brief'].includes(s.before)||!Number.isFinite(s.at))throw Error('Invalid history');
    const sf={};for(const k of FIELD_IDS){if(typeof s.fields?.[k]!=='string'||s.fields[k].length>MAX_TEXT)throw Error('Invalid history');sf[k]=s.fields[k];}
    return {before:s.before,at:s.at,fields:sf};
  });
  if(new Set(snapshots.map(s=>s.before)).size!==snapshots.length)throw Error('Duplicate history');
  if(JSON.stringify(snapshots.map(s=>s.before))!==JSON.stringify(seen.slice(1)))throw Error('Inconsistent history');
  return {version:1,caseId:CASE_ID,team:raw.team,startedAt:raw.startedAt,savedAt:raw.savedAt,seen,read,opened,fields,snapshots};
}
export function dueReleases(state,now=Date.now()){
  const elapsed=Math.max(0,now-state.startedAt);
  return RELEASES.filter(r=>r.at<=elapsed).map(r=>r.id);
}
export function reconcile(state,now=Date.now()){
  const arrivals=dueReleases(state,now).filter(id=>!state.seen.includes(id));
  for(const id of arrivals){
    if(id!=='morning'&&!state.snapshots.some(s=>s.before===id))state.snapshots.push({before:id,at:now,fields:{...state.fields}});
    state.seen.push(id);
  }
  return arrivals;
}
export function wordCount(text){return (text.trim().match(/\S+/gu)||[]).length;}
export function escapeHTML(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function briefText(state){
  const lines=['ALDER COMMUNITY SERVICES','The Morning Outage','Internal assurance brief',`Team: ${state.team}`,''];
  for(const section of SECTIONS.filter(s=>state.seen.includes(s.release))){
    lines.push(section.label.toUpperCase(),'');
    for(const f of section.fields)lines.push(f.label, state.fields[f.id]||'[No response recorded]','');
  }
  lines.push(`Board statement: ${wordCount(state.fields.boardStatement)} / 70 words`,'');
  if(state.snapshots.length){
    lines.push('EARLIER DRAFTS','');
    for(const snap of state.snapshots){
      const heading={records:'Before the 8:45 records',recovery:'Before the 9:05 records',brief:'Before the final brief request'}[snap.before];
      lines.push(heading,'');
      for(const section of SECTIONS){
        const filled=section.fields.filter(f=>snap.fields[f.id]);
        if(!filled.length)continue;
        lines.push(section.label);
        for(const f of filled)lines.push(f.label,snap.fields[f.id],'');
      }
      if(!Object.values(snap.fields).some(Boolean))lines.push('[No response recorded at this point]','');
    }
  }
  return lines.join('\n');
}
