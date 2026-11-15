import type {DemoState} from '@/components/gemini/demo-provider';
import {propertyContentChecks} from './property-completeness';

/** One coherent saved property journey; navigation clicks never imply completion. */
export function firstUseProgress(state:DemoState){
 const property=Object.values(state.properties).filter(p=>p.status!=='archived').sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id))[0];
 const content=!!property&&propertyContentChecks(property).every(c=>c.complete);
 const reviewed=!!property&&content&&property.source.factsReviewed&&property.source.copyReviewed;
 const jobs=property?state.jobs.filter(j=>j.listingId===property.id&&j.propertyRevision===property.revision&&j.status!=='cancelled-demo'):[];
 const campaigns=property?state.campaigns.filter(c=>c.input.propertyId===property.id&&c.propertyRevision===property.revision):[];
 const sharing=property?.sharing?.history.some(h=>h.propertyRevision===property.revision)??false;
 const prepared=reviewed&&(jobs.some(j=>state.preparedConnectors.includes(j.destination))||campaigns.length>0||sharing);
 const outcome=reviewed&&(jobs.some(j=>j.status==='queued-demo')||campaigns.some(c=>c.status==='simulated')||sharing);
 return {property,content,reviewed,prepared,outcome,complete:content&&reviewed&&prepared&&outcome};
}
