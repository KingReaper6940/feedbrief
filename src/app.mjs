import {installHandoff} from './handoff.mjs';
import {inspectFeed} from './audit.mjs';import {RSS_EXAMPLE,ATOM_EXAMPLE} from './examples.mjs';
const $=id=>document.getElementById(id);
let current=null,page=0;
export function clip(value,limit=400){if(value.length<=limit)return value;let end=limit;if(end>0){const unit=value.charCodeAt(end-1);if(unit>=0xd800&&unit<=0xdbff)end--;}return value.slice(0,end)+' … ['+(value.length-end)+' text units not shown; full value in exports]';}
export const getCurrent=()=>current;
export function clear(){document.dispatchEvent(new CustomEvent('feedbrief:clear'));current=null;$('results').hidden=true;$('downloads').replaceChildren();$('save-project').disabled=true;$('status').textContent='Source changed. Inspect again to refresh the readout.';}
function element(tag,value,className){const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(className)e.className=className;return e;}
function renderEntries(){
 if(!current)return;
 const query=$('search').value.trim().toLowerCase(),filter=$('filter').value;
 const entries=current.entries.filter(e=>{
  const findings=current.findings.filter(f=>f.entry===e.index);
  return (!query||[e.title,e.id,e.link.raw,e.link.url||''].some(v=>v.toLowerCase().includes(query)))&&(filter==='all'||filter==='review'&&findings.some(f=>f.level==='review')||filter==='duplicates'&&findings.some(f=>f.code==='duplicate-id')||filter==='missing-id'&&!e.id);
 });
 const pages=Math.max(1,Math.ceil(entries.length/10));page=Math.min(page,pages-1);$('entries').replaceChildren();
 for(const entry of entries.slice(page*10,page*10+10)){
  const findings=current.findings.filter(f=>f.entry===entry.index),reviews=findings.filter(f=>f.level==='review').length;
  const card=element('article',undefined,'entry'),top=element('div',undefined,'entry-top');top.append(element('span','ENTRY '+String(entry.index).padStart(2,'0')),element('span',reviews+' review · '+(findings.length-reviews)+' notes','badge'));
  card.append(top,element('h3',clip(entry.title||'Untitled entry',180)));
  const dl=element('dl');for(const [label,value]of [['Identifier',entry.id||'Not supplied'],[entry.dateField+' · supplied text',entry.date||'Not supplied'],['Selected link · '+entry.link.status,entry.link.url||entry.link.raw||'Not supplied']])dl.append(element('dt',label),element('dd',clip(value,400)));
  card.append(dl,element('p','Extracted text · markup is never rendered','literal'),element('p',clip(entry.summary||'No summary/description/content text extracted.',700),'summary'));
  const details=element('details');details.append(element('summary','Review receipts ('+findings.length+')'));const ul=element('ul');
  if(!findings.length)ul.append(element('li','No findings from these selected checks. This is not a conformance verdict.'));
  for(const finding of findings)ul.append(element('li',finding.level+' · '+finding.code+' · '+finding.message));
  details.append(ul);card.append(details);$('entries').append(card);
 }
 if(!entries.length)$('entries').append(element('p','No entries match this view. The exports still contain the full inspection.','empty'));
 $('page').textContent=entries.length+' entries · page '+(page+1)+' / '+pages;$('previous').disabled=page===0;$('next').disabled=page>=pages-1;
}
export function inspect(){
 clear();page=0;
 try{
  current=inspectFeed($('source').value,$('base').value);$('results').hidden=false;
  $('format').textContent=current.format+' / PASTED SNAPSHOT';$('feed-title').textContent=clip(current.feed.title||'Untitled feed',180);$('feed-description').textContent=clip(current.feed.description,400);$('feed-link').textContent=clip(current.feed.link.url||current.feed.link.raw||'No selected feed link',400);
  $('entry-count').textContent=current.entries.length;$('duplicate-count').textContent=current.duplicateIDs.length;$('review-count').textContent=current.findings.filter(f=>f.level==='review').length;$('note-count').textContent=current.findings.filter(f=>f.level==='note').length;
  $('findings').replaceChildren();for(const f of current.findings.slice(0,100))$('findings').append(element('li',(f.entry?'Entry '+f.entry:'Feed')+' · '+f.level+' · '+f.code+' · '+f.message));
  $('findings-summary').textContent='Review receipts ('+current.findings.length+')';$('findings-limit').textContent=current.findings.length>100?(current.findings.length-100)+' findings omitted here; exports contain every finding.':'All selected-check findings shown.';
  $('status').textContent='Readout ready. '+current.entries.length+' entries inspected; selected checks only.';renderEntries();document.dispatchEvent(new CustomEvent('feedbrief:ready'));
 }catch(error){current=null;$('results').hidden=true;$('status').textContent=error.message;}
}
for(const id of ['source','base'])$(id).addEventListener('input',clear);
$('inspect').addEventListener('click',inspect);
for(const id of ['search','filter'])$(id).addEventListener(id==='search'?'input':'change',()=>{page=0;renderEntries();});
$('previous').addEventListener('click',()=>{page--;renderEntries();});$('next').addEventListener('click',()=>{page++;renderEntries();});
function example(source){$('source').value=source;$('base').value='';$('search').value='';$('filter').value='all';inspect();}
$('rss-example').addEventListener('click',()=>example(RSS_EXAMPLE));$('atom-example').addEventListener('click',()=>example(ATOM_EXAMPLE));
export function start(){example(RSS_EXAMPLE);}
installHandoff({getCurrent,inspect});
start();
