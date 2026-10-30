import {ATOM,XML,children,first,text,parseFeedXML} from './xml.mjs';
export function httpURL(raw,base){
 if(!raw)return {raw:'',url:null,status:'missing'};
 if(/[\u0000-\u0020\u007f]/u.test(raw))return {raw,url:null,status:'invalid',reason:'Whitespace/control characters in URL.'};
 try{const url=new URL(raw,base||undefined);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return {raw,url:null,status:'unsupported',reason:'Only credential-free HTTP(S) URLs are resolved.'};return {raw,url:url.href,status:'resolved'};}
 catch{return {raw,url:null,status:'unresolved',reason:'URL is invalid or relative without a usable base.'};}
}
export function resolveLink(node,raw,baseURL,atom=false){
 if(!raw)return httpURL('');
 let base=baseURL||undefined;
 if(atom&&node){
  const chain=[];for(let e=node;e?.nodeType===1;e=e.parentElement)chain.unshift(e);
  for(const e of chain){const value=e.getAttributeNS(XML,'base');if(value!==null){const result=httpURL(value,base);if(result.status!=='resolved')return {raw,url:null,status:'base',reason:'An xml:base is unsupported, invalid or unresolved.'};base=result.url;}}
 }
 return httpURL(raw,base);
}
const field=(node,name,ns)=>text(first(node,name,ns));
function alternate(node,ns){return children(node,'link',ns).find(e=>!e.hasAttribute('rel')||e.getAttribute('rel')==='alternate')??null;}
export function inspectFields(source,baseURL='',Parser=globalThis.DOMParser){
 if(typeof baseURL!=='string'||baseURL.length>2048)throw new Error('Base URL must be text up to 2,048 units.');
 baseURL=baseURL.trim();
 if(baseURL&&httpURL(baseURL).status!=='resolved')throw new Error('Optional feed URL must be an absolute credential-free HTTP(S) URL.');
 const parsed=parseFeedXML(source,Parser),{channel,namespace:ns,format}=parsed,isAtom=ns===ATOM;
 function read(node,index){
  const linkNode=isAtom?alternate(node,ns):first(node,'link',ns);
  const raw=isAtom?linkNode?.getAttribute('href')?.trim()??'':text(linkNode);
  const summaryNode=first(node,isAtom?'summary':'description',ns)??(isAtom?first(node,'content',ns):null);
  const counts={};for(const key of ['title',isAtom?'id':'guid',isAtom?'updated':'pubDate'])counts[key]=children(node,key,ns).length;
  return {index,title:field(node,'title',ns),id:field(node,isAtom?'id':'guid',ns),
   date:field(node,isAtom?'updated':'pubDate',ns),dateField:isAtom?'updated':'pubDate',
   published:isAtom?field(node,'published',ns):'',summary:text(summaryNode),summaryType:summaryNode?(summaryNode.getAttribute('type')||'unspecified'):'',
   link:resolveLink(linkNode,raw,baseURL,isAtom),counts};
 }
 const feedLink=isAtom?alternate(channel,ns):first(channel,'link',ns);
 const feedRaw=isAtom?feedLink?.getAttribute('href')?.trim()??'':text(feedLink);
 return {format,baseURL,feed:{title:field(channel,'title',ns),id:isAtom?field(channel,'id',ns):'',description:field(channel,isAtom?'subtitle':'description',ns),updated:isAtom?field(channel,'updated',ns):'',link:resolveLink(feedLink,feedRaw,baseURL,isAtom)},entries:parsed.entries.map((node,i)=>read(node,i+1))};
}
