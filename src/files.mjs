import {inspectFeed} from './audit.mjs';
export function makeProject(source,baseURL,Parser=globalThis.DOMParser){inspectFeed(source,baseURL,Parser);return {schema:'feedbrief-project-v1',source,baseURL};}
export function parseProject(text,Parser=globalThis.DOMParser){
 if(typeof text!=='string'||text.length>250000)throw new Error('Project JSON must be at most 250,000 text units.');
 let value;try{value=JSON.parse(text);}catch{throw new Error('Could not read project JSON. Current work was preserved.');}
 if(!value||value.schema!=='feedbrief-project-v1'||typeof value.source!=='string'||typeof value.baseURL!=='string')throw new Error('Expected a Feedbrief v1 project with XML source and baseURL.');
 return makeProject(value.source,value.baseURL,Parser);
}
export const jsonReport=snapshot=>JSON.stringify({schema:'feedbrief-report-v1',...snapshot},null,2)+'\n';
function fence(text){let length=2;for(const match of text.matchAll(/`+/g))length=Math.max(length,match[0].length);const mark='`'.repeat(length+1);return mark+'text\n'+text+'\n'+mark;}
export function markdownReport(snapshot){
 const out=['# Feedbrief','',snapshot.scope,'','Format: '+snapshot.format,'','## Feed','',fence('Title: '+snapshot.feed.title+'\nIdentifier: '+snapshot.feed.id+'\nUpdated: '+snapshot.feed.updated+'\nDescription/subtitle: '+snapshot.feed.description+'\nSelected link: '+(snapshot.feed.link.url||snapshot.feed.link.raw||'(none)')),''];
 for(const entry of snapshot.entries)out.push('## Entry '+entry.index,'',fence('Title: '+entry.title+'\nIdentifier: '+entry.id+'\n'+entry.dateField+': '+entry.date+'\nPublished: '+entry.published+'\nSelected link ('+entry.link.status+'): '+(entry.link.url||entry.link.raw||'(none)')+'\nExtracted text:\n'+entry.summary),'');
 out.push('## All review receipts','',fence(snapshot.findings.map(f=>(f.entry?'Entry '+f.entry:'Feed')+' | '+f.level+' | '+f.code+' | '+f.message).join('\n')||'No findings from the selected checks. This is not a conformance verdict.'),'');
 return out.join('\n');
}
