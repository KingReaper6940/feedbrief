export const ATOM='http://www.w3.org/2005/Atom';
export const XML='http://www.w3.org/XML/1998/namespace';
export const LIMITS=Object.freeze({units:100000,entries:200,elements:5000,depth:32});
export const children=(node,name,ns='')=>[...node.children].filter(e=>e.localName===name&&(e.namespaceURI||'')===ns);
export const first=(node,name,ns='')=>children(node,name,ns)[0]??null;
export const text=node=>node?.textContent?.trim()??'';
export function parseFeedXML(source,Parser=globalThis.DOMParser){
 if(typeof source!=='string'||!source.trim()||source.length>LIMITS.units)throw new Error('Paste XML between 1 and 100,000 text units.');
 if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(source))throw new Error('DTD, entity declarations and stylesheet processing instructions are outside this inspector’s input format.');
 if(typeof Parser!=='function')throw new Error('An XML DOMParser is required.');
 const document=new Parser().parseFromString(source,'application/xml'),root=document.documentElement;
 const errors=[...document.getElementsByTagNameNS('*','parsererror')].filter(e=>e.namespaceURI==='http://www.mozilla.org/newlayout/xml/parsererror.xml'||e.namespaceURI==='http://www.w3.org/1999/xhtml'||e===root);
 if(!root||errors.length)throw new Error('XML is not well formed. Check nesting, namespaces and escaped ampersands.');
 let count=0;const stack=[[root,1]];
 while(stack.length){const [node,depth]=stack.pop();if(++count>LIMITS.elements||depth>LIMITS.depth)throw new Error('Use at most 5,000 XML elements and depth 32.');for(const child of node.children)stack.push([child,depth+1]);}
 let channel,format,namespace,entries;
 if(root.localName==='rss'&&!root.namespaceURI&&root.getAttribute('version')==='2.0'){
  const channels=children(root,'channel');if(channels.length!==1)throw new Error('RSS 2.0 needs exactly one unqualified direct channel element.');
  channel=channels[0];format='RSS 2.0';namespace='';entries=children(channel,'item');
 }else if(root.localName==='feed'&&root.namespaceURI===ATOM){channel=root;format='Atom 1.0';namespace=ATOM;entries=children(root,'entry',ATOM);}
 else throw new Error('Supported roots: unqualified rss version="2.0", or Atom 1.0 feed in its standard namespace.');
 if(entries.length>LIMITS.entries)throw new Error('Use a snapshot with at most 200 direct entries. No entries were silently dropped.');
 return {document,channel,format,namespace,entries};
}
