/** Read-only audit of explicit UI literals and catalogue coverage. Run from repo root. */
const ts=require(process.cwd()+'/apps/web/node_modules/typescript');
const fs=require('node:fs'),path=require('node:path');
const catalog=require('../apps/web/messages/prototype-ar.json');
const report=[];
function walk(dir){for(const file of fs.readdirSync(dir)){const filename=path.join(dir,file);if(fs.statSync(filename).isDirectory())walk(filename);else if(filename.endsWith('.tsx')){
 const source=ts.createSourceFile(filename,fs.readFileSync(filename,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const entries=[];
 function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(source)==='copyText'&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0])){const text=node.arguments[0].text.trim();if(/[A-Za-z]{2}/.test(text))entries.push({text,translated:Object.hasOwn(catalog,text)});}ts.forEachChild(node,visit);}
 visit(source);if(entries.length)report.push({filename,entries});
}}}
walk('apps/web/src/components');walk('apps/web/src/app');
fs.mkdirSync('artifacts/phase6/logs',{recursive:true});
fs.writeFileSync('artifacts/phase6/logs/static-copy-coverage.json',JSON.stringify(report,null,2)+'\n');
console.log(`${report.length} files audited. Runtime copy inventory and original-language records must be reviewed separately.`);
