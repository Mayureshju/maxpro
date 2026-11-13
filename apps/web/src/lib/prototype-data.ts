/** EDITORIAL DEMO FIXTURES — not a database and not connected to live providers. */
export type ListingStatus = 'Live' | 'Pending review' | 'Draft' | 'Needs changes' | 'Expired' | 'Reviewed' | 'Archived';
export type Listing = {
  id:string; title:string; arTitle:string; locality:string; city:string; price:number; unit:'month'|'sale';
  beds:number; baths:number; area:number; category:string; status:ListingStatus; portals:number;
  views:number; enquiries:number; owner:string; updated:string; image:string; permit:string;
};
export const listings:Listing[] = [
  {id:'AQ-10231',title:'Marina-facing apartment',arTitle:'شقة بإطلالة على المارينا',locality:'The Pearl',city:'Doha',price:12500,unit:'month',beds:2,baths:3,area:171,category:'Apartment',status:'Live',portals:2,views:1738,enquiries:24,owner:'Fatima Noor',updated:'2 hours ago',image:'/demo-media/living.jpg',permit:'RE-22981'},
  {id:'AQ-10233',title:'Freehold residence, Viva Bahriya',arTitle:'مسكن للتملك الحر في فيفا بحرية',locality:'Viva Bahriya',city:'Doha',price:2850000,unit:'sale',beds:3,baths:4,area:247,category:'Apartment',status:'Live',portals:2,views:2156,enquiries:37,owner:'Yousef Al-Marri',updated:'Yesterday',image:'/demo-media/exterior.jpg',permit:'RE-22984'},
  {id:'AQ-10241',title:'Courtyard townhouse',arTitle:'تاون هاوس بفناء داخلي',locality:'Lusail Marina',city:'Lusail',price:17500,unit:'month',beds:4,baths:5,area:295,category:'Townhouse',status:'Live',portals:1,views:908,enquiries:13,owner:'Karim Said',updated:'2 days ago',image:'/demo-media/exterior.jpg',permit:'RE-22996'},
  {id:'AQ-10244',title:'Penthouse with skyline terrace',arTitle:'بنتهاوس مع شرفة وإطلالة',locality:'West Bay',city:'Doha',price:38000,unit:'month',beds:4,baths:5,area:401,category:'Penthouse',status:'Pending review',portals:0,views:0,enquiries:0,owner:'Fatima Noor',updated:'Today',image:'/demo-media/living.jpg',permit:'Review required'},
  {id:'AQ-10251',title:'Family villa with private garden',arTitle:'فيلا عائلية بحديقة خاصة',locality:'Al Waab',city:'Doha',price:21000,unit:'month',beds:5,baths:6,area:515,category:'Villa',status:'Needs changes',portals:0,views:0,enquiries:0,owner:'Yousef Al-Marri',updated:'Yesterday',image:'/demo-media/exterior.jpg',permit:'Missing floor plan'},
  {id:'AQ-10256',title:'Bright city studio',arTitle:'استوديو مشرق في المدينة',locality:'Msheireb',city:'Doha',price:6200,unit:'month',beds:0,baths:1,area:61,category:'Studio',status:'Draft',portals:0,views:0,enquiries:0,owner:'Karim Said',updated:'3 days ago',image:'/demo-media/bedroom.jpg',permit:'Not submitted'},
];
export type Lead = {id:string;name:string;listing:string;source:string;score:number;stage:'New'|'Contacted'|'Viewing'|'Won'|'Closed';assignee:string;received:string;note:string;phone:string};
export const leads:Lead[] = [
  {id:'LE-2101',name:'James Carter',listing:'AQ-10231',source:'WhatsApp',score:82,stage:'New',assignee:'Fatima Noor',received:'12m ago',note:'Requested parking details and property pack',phone:'+974 •••• 3178'},
  {id:'LE-2102',name:'Noura Al-Mannai',listing:'AQ-10244',source:'AI chat',score:91,stage:'New',assignee:'Unassigned',received:'30m ago',note:'Looking for a family penthouse below QAR 40k',phone:'+974 •••• 0883'},
  {id:'LE-2103',name:'Daniel Rossi',listing:'AQ-10241',source:'Website',score:64,stage:'Contacted',assignee:'Karim Said',received:'1h ago',note:'Asked about December availability',phone:'+974 •••• 8726'},
  {id:'LE-2104',name:'Hassan Ibrahim',listing:'AQ-10233',source:'Meta',score:88,stage:'Viewing',assignee:'Fatima Noor',received:'Yesterday',note:'Pre-approved buyer, interested in freehold',phone:'+974 •••• 8841'},
  {id:'LE-2105',name:'Anna Kowalski',listing:'AQ-10251',source:'Website',score:40,stage:'Closed',assignee:'Unassigned',received:'Yesterday',note:'Asked whether pets are allowed',phone:'+974 •••• 4332'},
];
export const conversations = [
  {id:'CV-01',name:'James Carter',source:'WhatsApp',unread:2,property:'AQ-10231',preview:'Could you send the floor plan?',time:'09:42',messages:[{by:'them',text:'Hello, is the Marina apartment still available?',time:'09:31'},{by:'us',text:'Yes, the listing is currently active. Would you like the property pack?',time:'09:34'},{by:'them',text:'Could you send the floor plan?',time:'09:42'}]},
  {id:'CV-02',name:'Noura Al-Mannai',source:'Web AI',unread:1,property:'AQ-10244',preview:'I would like to speak to an agent.',time:'09:16',messages:[{by:'them',text:'I need a four-bedroom penthouse for my family.',time:'09:12'},{by:'us',text:'I found a listing that matches your budget. Would you like an agent to review it with you?',time:'09:14'},{by:'them',text:'I would like to speak to an agent.',time:'09:16'}]},
  {id:'CV-03',name:'Daniel Rossi',source:'Website',unread:0,property:'AQ-10241',preview:'Thank you. I will confirm tomorrow.',time:'Yesterday',messages:[{by:'them',text:'Is the townhouse available in December?',time:'16:10'},{by:'us',text:'The listing is active. I can check the exact move-in date with the owner.',time:'16:12'}]},
] as const;
// Legacy fixtures retained for optional older screens; no connector here is live.
export const portalConnections = [
  {id:'property-finder',name:'Property Finder (demo)',method:'Partner API/Feed · requires approval',state:'Not connected',capabilities:[],sent:0,issues:0},
  {id:'qatar-living',name:'Qatar Living (demo)',method:'Business feed · unverified',state:'Not connected',capabilities:[],sent:0,issues:0},
  {id:'bayut-dubizzle',name:'Bayut / Dubizzle (demo)',method:'Partner feed · region dependent',state:'Not connected',capabilities:[],sent:0,issues:0},
];
export const publicationJobs = [
  {id:'SAMPLE-0501',listing:'AQ-10244',portal:'Property Finder (demo)',action:'Validate',state:'Blocked',when:'Example'},
  {id:'SAMPLE-0502',listing:'AQ-10251',portal:'Qatar Living (demo)',action:'Validate',state:'Warning',when:'Example'},
];
export const invoices = [
  {id:'INV-2026-0419',date:'01 Nov 2026',description:'Agency plan — November (illustrative)',total:'QAR 1,800+',state:'Paid'},
  {id:'INV-2026-0401',date:'01 Oct 2026',description:'Agency plan — October (illustrative)',total:'QAR 1,800+',state:'Paid'},
  {id:'INV-2026-0390',date:'18 Sep 2026',description:'Featured placement credit',total:'QAR 250',state:'Paid'},
];
export const team = [
  {name:'Yousef Al-Marri',initials:'YM',role:'Owner',email:'yousef@example.test',listings:45,leads:12},
  {name:'Fatima Noor',initials:'FN',role:'Agent',email:'fatima@example.test',listings:34,leads:18},
  {name:'Karim Said',initials:'KS',role:'Agent',email:'karim@example.test',listings:22,leads:9},
  {name:'Mariam Ahmed',initials:'MA',role:'Manager',email:'mariam@example.test',listings:27,leads:3},
];
export const q = (amount:number) => `QAR ${amount.toLocaleString('en-US')}`;
