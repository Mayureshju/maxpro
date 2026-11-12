// Visual fixtures ONLY. Replace with typed, organization-scoped API queries.
export type PropertyRow = {
  id: string;
  name: string;
  area: string;
  purpose: 'Rent' | 'Sale';
  status: 'Live' | 'Review' | 'Draft';
  portals: number;
  updated: string;
};

export const properties: PropertyRow[] = [
  {id: 'MP-10231', name: 'Marina residence · 2 bedrooms', area: 'The Pearl', purpose: 'Rent', status: 'Live', portals: 2, updated: '2h ago'},
  {id: 'MP-10233', name: 'Skyline penthouse', area: 'West Bay', purpose: 'Sale', status: 'Live', portals: 2, updated: '5h ago'},
  {id: 'MP-10246', name: 'Family villa with garden', area: 'Al Waab', purpose: 'Rent', status: 'Review', portals: 0, updated: 'Yesterday'},
  {id: 'MP-10256', name: 'Modern studio residence', area: 'Lusail', purpose: 'Rent', status: 'Draft', portals: 0, updated: 'Yesterday'}
];

export const leads = [
  {name: 'Fatima A.', property: 'MP-10231', source: 'WhatsApp', priority: 'High', stage: 'Needs reply', time: '8m ago'},
  {name: 'Omar K.', property: 'MP-10233', source: 'Portal A (mock)', priority: 'Medium', stage: 'Contacted', time: '42m ago'},
  {name: 'Sarah R.', property: 'MP-10231', source: 'Website', priority: 'Medium', stage: 'New', time: '2h ago'},
  {name: 'Ahmed M.', property: 'MP-10256', source: 'AI chat', priority: 'High', stage: 'Qualified', time: '3h ago'}
];

export const plans = [
  {key:'starter',price:'179',listings:'3',seats:'1',aiCredits:'5',portals:'1'},
  {key:'professional',price:'725',listings:'25',seats:'1',aiCredits:'50',portals:'2'},
  {key:'agency',price:'1,800',listings:'Unlimited*',seats:'Multi-agent*',aiCredits:'Custom*',portals:'All approved*'},
] as const;
