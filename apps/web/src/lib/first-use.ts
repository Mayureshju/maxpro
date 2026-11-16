import type {DemoState} from '@/components/gemini/demo-provider';
import type {CanonicalProperty} from './canonical-property';
import {propertyContentChecks} from './property-completeness';

function propertyProgress(state:DemoState,property?:CanonicalProperty){
 const content=!!property&&propertyContentChecks(property).every(c=>c.complete);
 const reviewed=!!property&&content&&property.source.factsReviewed&&property.source.copyReviewed;
 const jobs=property?state.jobs.filter(j=>j.listingId===property.id&&j.propertyRevision===property.revision&&j.status!=='cancelled-demo'):[];
 const campaigns=property?state.campaigns.filter(c=>c.input.propertyId===property.id&&c.propertyRevision===property.revision):[];
 const sharing=property?.sharing?.history.some(h=>h.propertyRevision===property.revision)??false;
 const prepared=reviewed&&(jobs.some(j=>state.preparedConnectors.includes(j.destination))||campaigns.length>0||sharing);
 const outcome=reviewed&&(jobs.some(j=>j.status==='queued-demo')||campaigns.some(c=>c.status==='simulated')||sharing);
 return {property,content,reviewed,prepared,outcome,complete:content&&reviewed&&prepared&&outcome};
}
/** Choose the most advanced coherent journey. An older draft cannot hide completed setup. */
export function firstUseProgress(state:DemoState){
 const journeys=Object.values(state.properties).filter(p=>p.status!=='archived').map(p=>propertyProgress(state,p));
 const score=(p:ReturnType<typeof propertyProgress>)=>Number(p.content)+Number(p.reviewed)+Number(p.prepared)+Number(p.outcome);
 journeys.sort((a,b)=>score(b)-score(a)||a.property!.createdAt.localeCompare(b.property!.createdAt)||a.property!.id.localeCompare(b.property!.id));
 return journeys[0]??propertyProgress(state);
}
