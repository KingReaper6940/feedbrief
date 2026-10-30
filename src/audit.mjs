import {inspectFields} from './extract.mjs';
export function auditFields(snapshot){
 const findings=[],duplicateIDs=[],duplicateLinks=[];
 const add=(entry,code,message,level='review')=>findings.push({entry,code,level,message});
 const atom=snapshot.format==='Atom 1.0',feed=snapshot.feed;
 if(!feed.title)add(0,'feed-title','Feed title is missing or empty.');
 if(atom){if(!feed.id)add(0,'feed-id','Atom feed id is missing or empty.');if(!feed.updated)add(0,'feed-updated','Atom feed updated value is missing or empty.');}
 else if(!feed.description)add(0,'feed-description','RSS channel description is missing or empty.');
 if(feed.link.status!=='resolved')add(0,'feed-link',feed.link.status==='missing'?'No feed-level alternate/site link was selected.':'Feed-level link was not resolved: '+feed.link.status+'.',atom?'note':'review');
 const ids=new Map(),links=new Map();
 for(const entry of snapshot.entries){
  if(!entry.title)add(entry.index,'entry-title',atom?'Atom entry title is missing or empty.':'No item title; description-only RSS items can be valid.',atom?'review':'note');
  if(!entry.title&&!entry.summary)add(entry.index,'entry-text','No extracted title or summary/description/content text.');
  if(!entry.id)add(entry.index,'entry-id',atom?'Atom entry id is missing or empty.':'No RSS guid; guid is optional, but stable identifiers help readers.',atom?'review':'note');
  if(!entry.date)add(entry.index,'entry-date',atom?'Atom updated value is missing or empty.':'No RSS pubDate; this field is optional.',atom?'review':'note');
  if(entry.link.status!=='resolved')add(entry.index,'entry-link',entry.link.status==='missing'?'No alternate/item link was selected.':'Link was not resolved: '+entry.link.status+'.',entry.link.status==='missing'?'note':'review');
  for(const [field,count]of Object.entries(entry.counts))if(count>1)add(entry.index,'multiple-field','Found '+count+' direct '+field+' elements; readout uses the first.');
  if(entry.id){const group=ids.get(entry.id)||[];group.push(entry.index);ids.set(entry.id,group);}
  if(entry.link.url){const group=links.get(entry.link.url)||[];group.push(entry.index);links.set(entry.link.url,group);}
 }
 for(const [value,entries]of ids)if(entries.length>1){duplicateIDs.push({value,entries});for(const index of entries)add(index,'duplicate-id','Identifier also appears in entries '+entries.filter(n=>n!==index).join(', ')+'.');}
 for(const [value,entries]of links)if(entries.length>1){duplicateLinks.push({value,entries});for(const index of entries)add(index,'duplicate-link','Resolved HTTP link is shared with entries '+entries.filter(n=>n!==index).join(', ')+'.','note');}
 if(!snapshot.entries.length)add(0,'empty-snapshot','No direct entries found; this can be an intentionally empty feed.','note');
 return {...snapshot,findings,duplicateIDs,duplicateLinks,scope:'Selected field-presence, repeated-entry-field, duplicate trimmed-identifier and selected HTTP-link checks only. Not feed conformance, date, content or reader-compatibility validation.'};
}
export function inspectFeed(source,baseURL='',Parser=globalThis.DOMParser){return auditFields(inspectFields(source,baseURL,Parser));}
