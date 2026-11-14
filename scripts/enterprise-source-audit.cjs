/* Route-aware import graph. Scanner candidates require human reference review. */
const fs=require('node:fs'),path=require('node:path'),ts=require('../apps/web/node_modules/typescript');
const base=path.resolve('apps/web/src');
const files=fs.readdirSync(base,{recursive:true}).map(String).filter(f=>/\.tsx?$/.test(f));
const graph=new Map();
for(const file of files){
 const source=ts.createSourceFile(file,fs.readFileSync(path.join(base,file),'utf8'),99,true),dependencies=[];
 function reference(name){const target=name.startsWith('@/')?name.slice(2):name.startsWith('.')?path.normalize(path.join(path.dirname(file),name)):null;if(!target)return;const resolved=[target+'.ts',target+'.tsx',target+'/index.ts',target+'/index.tsx'].find(f=>files.includes(f));if(resolved)dependencies.push(resolved);}
 function visit(node){if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))reference(node.moduleSpecifier.text);if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))reference(node.arguments[0].text);ts.forEachChild(node,visit);}
 visit(source);graph.set(file,dependencies);
}
const roots=files.filter(f=>f.startsWith('app/')||['proxy.ts','i18n/request.ts'].includes(f)),reachable=new Set();
function walk(file){if(reachable.has(file))return;reachable.add(file);for(const dependency of graph.get(file)||[])walk(dependency);}
roots.forEach(walk);
const retained={
 'lib/api-contracts.ts':{classification:'DOCUMENTED',reason:'Future Frappe type contracts referenced by docs/12 and docs/25; no implementation.'},
 'lib/demo-data.ts':{classification:'DOCUMENTED',reason:'Original design fixture referenced by OpenSpec 0001; preserve historical source.'},
 'lib/utils.ts':{classification:'DOCUMENTED',reason:'components.json generator alias; retain compatibility for UI tooling.'},
};
const report={routeRoots:roots.length,sourceFiles:files.length,reachableFiles:reachable.size,findings:files.filter(f=>!reachable.has(f)).map(file=>({file,...retained[file]||{classification:'UNCERTAIN',reason:'Not reachable from routes; check tests, tooling and documentation before removal.'}}))};
fs.mkdirSync('artifacts/phase10',{recursive:true});fs.writeFileSync('artifacts/phase10/source-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
