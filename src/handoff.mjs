import {makeProject,parseProject,jsonReport,markdownReport} from './files.mjs';import {inspectFeed} from './audit.mjs';
const $=id=>document.getElementById(id);
export function installHandoff({getCurrent,inspect}){
 let urls=[],revision=0,request=0;
 function url(text,type){const value=URL.createObjectURL(new Blob([text],{type}));urls.push(value);return value;}
 document.addEventListener('feedbrief:clear',()=>{revision++;for(const u of urls)URL.revokeObjectURL(u);urls=[];});
 document.addEventListener('feedbrief:ready',()=>{
  const state=getCurrent();if(!state)return;
  for(const [label,filename,content,type]of [['JSON readout','feedbrief-report.json',jsonReport(state),'application/json'],['Markdown brief','feedbrief.md',markdownReport(state),'text/markdown']]){
   const a=document.createElement('a');a.textContent=label;a.download=filename;a.href=url(content,type);$('downloads').append(a);
  }
  $('save-project').disabled=false;
 });
 $('save-project').addEventListener('click',()=>{
  if(!getCurrent())return;
  try{const project=makeProject($('source').value,$('base').value);const a=document.createElement('a');a.download='feedbrief-project.json';a.href=url(JSON.stringify(project,null,2)+'\n','application/json');document.body.append(a);a.click();a.remove();$('file-status').textContent='Project download requested. It includes the entire XML source.';}catch(error){$('file-status').textContent=error.message;}
 });
 for(const id of ['open-xml','open-project'])$(id).addEventListener('change',async()=>{
  const file=$(id).files?.[0];if(!file)return;const version=revision,token=++request;
  try{
   const max=id==='open-xml'?400000:800000;if(file.size>max)throw new Error('File is too large: limit '+max+' bytes.');
   let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());}catch{throw new Error('Could not decode this file as UTF-8. Current work was preserved.');}
   const project=id==='open-project'?parseProject(text):{source:text,baseURL:$('base').value};
   if(id==='open-xml')inspectFeed(project.source,project.baseURL);
   if(revision!==version||request!==token)throw new Error('Work changed while loading. Current work was preserved; open again to replace it.');
   $('source').value=project.source;$('base').value=project.baseURL;$('search').value='';$('filter').value='all';inspect();$('file-status').textContent=id==='open-project'?'Project opened. XML and base URL restored.':'UTF-8 XML opened and inspected.';
  }catch(error){$('file-status').textContent=error.message;}
  finally{$(id).value='';}
 });
 globalThis.addEventListener('pagehide',()=>{for(const u of urls)URL.revokeObjectURL(u);urls=[];});
}
