/* Exact crops of retained Phase 11 captures; no drawing, compositing or UI fabrication. */
const {createRequire}=require('node:module');
const sharp=createRequire(require.resolve('../apps/web/node_modules/next/package.json'))('sharp');
const {readFileSync,writeFileSync}=require('node:fs');
const {createHash}=require('node:crypto');
const rect=(left,top,width,height)=>({left,top,width,height});
const crops={
 dashboard:{en:rect(280,150,1128,660),ar:rect(32,150,1128,660)},
 editor:{en:rect(288,344,856,540),ar:rect(296,353,856,531)},
 assistance:{en:rect(880,0,560,1000),ar:rect(0,0,560,1000)},
 publish:{source:'review',en:rect(280,260,1128,740),ar:rect(32,260,1128,740)},
 review:{en:rect(280,550,1128,450),ar:rect(32,550,1128,450)},
 campaign:{en:rect(280,550,1128,450),ar:rect(32,550,1128,450)},
 inbox:{en:rect(552,310,856,625),ar:rect(32,310,856,625)},
 leads:{source:'inbox',en:rect(552,310,856,625),ar:rect(32,310,856,625)}
};
(async()=>{const records=[];for(const [screen,config] of Object.entries(crops))for(const locale of ['en','ar']){
 const source=`${locale}-${config.source||screen}.webp`,file=`${locale}-${screen}-detail.webp`,buffer=readFileSync(`apps/web/public/product/${source}`);
 await sharp(buffer).extract(config[locale]).webp({quality:92}).toFile(`apps/web/public/product/${file}`);
 records.push({file,source,sourceSha256:createHash('sha256').update(buffer).digest('hex'),rectangle:config[locale],transformation:'Exact crop and WebP encoding only; no synthesized interface'});
}
const mobileCrops={dashboard:rect(0,300,375,512),editor:rect(16,318,343,426),publish:rect(0,64,375,748),review:rect(0,458,375,354),campaign:rect(0,64,375,748),inbox:rect(0,80,375,732),leads:rect(0,80,375,732)};
for(const [screen,rectangle] of Object.entries(mobileCrops))for(const locale of ['en','ar']){
 const sourceScreen=screen==='publish'?'review':screen==='leads'?'inbox':screen;
 const source=`${locale}-${sourceScreen}${['campaign','inbox'].includes(sourceScreen)?'-task':''}-mobile.webp`,file=`${locale}-${screen}-detail-mobile.webp`,buffer=readFileSync(`apps/web/public/product/${source}`);
 await sharp(buffer).extract(rectangle).webp({quality:92}).toFile(`apps/web/public/product/${file}`);
 records.push({file,source,sourceSha256:createHash('sha256').update(buffer).digest('hex'),rectangle,transformation:'Exact native-mobile screenshot crop and WebP encoding only'});
}
writeFileSync('apps/web/public/product/detail-provenance.json',JSON.stringify({baseline:'a2d34f0634568cdd8a9dfc044161c5cf94d670f4',originalProvenance:['product-provenance.json','product-mobile-provenance.json'],records},null,2));console.log(`${records.length} reproducible genuine screenshot crops`);})().catch(e=>{console.error(e);process.exitCode=1});
