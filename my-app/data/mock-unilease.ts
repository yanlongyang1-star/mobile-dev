export type UniLeaseCategory = 'Laptops' | 'Calculators' | 'Cameras' | 'Tablets' | 'Audio' | 'Textbooks';

export type UniLeaseOwner = {
  uid: string;
  name: string;
  trustScore: number;
};

export type UniLeaseItem = {
  id: string;
  title: string;
  description: string;
  categories: UniLeaseCategory[];
  pricePerDay: number;
  location: string;
  condition: 'Excellent' | 'Good' | 'Fair';
  owner: UniLeaseOwner;
};

export const CAMPUS_HANDOVER_ZONES = ['Library Hub', 'Engineering Building', 'Media Lab', 'Student Union', 'Main Entrance'] as const;

export const MOCK_ITEMS: UniLeaseItem[] = [
  {
    id: 'dslr-camera',
    title: 'DSLR Camera',
    description:
      'Great for assignments and small photo projects. Includes basic strap and lens cap. Tested and ready for next booking.',
    categories: ['Cameras', 'Audio'],
    pricePerDay: 25,
    location: 'Library Hub',
    condition: 'Excellent',
    owner: { uid: 'owner-1', name: 'Alicia (Owner)', trustScore: 4.8 },
  },
  {
    id: 'graphing-calculator',
    title: 'Advanced Graphing Calculator',
    description: 'For math/engineering courses. Comes with fresh batteries and a quick-start guide.',
    categories: ['Calculators'],
    pricePerDay: 5,
    location: 'Engineering Building',
    condition: 'Good',
    owner: { uid: 'owner-2', name: 'Marcus (Owner)', trustScore: 4.5 },
  },
  {
    id: 'studio-mic',
    title: 'Studio Microphone',
    description: 'Clear audio for recordings. Includes pop filter and short cable for easy setup.',
    categories: ['Audio'],
    pricePerDay: 12,
    location: 'Media Lab',
    condition: 'Good',
    owner: { uid: 'owner-3', name: 'Zoe (Owner)', trustScore: 4.7 },
  },
  {
    id: 'tablet',
    title: '12" Student Tablet',
    description: 'Note-taking tablet with stylus. Perfect for lecture scribbles and assignments.',
    categories: ['Tablets'],
    pricePerDay: 18,
    location: 'Student Union',
    condition: 'Excellent',
    owner: { uid: 'owner-4', name: 'Noah (Owner)', trustScore: 4.9 },
  },
  {
    id: 'textbook-set',
    title: 'Textbook Set (Course Bundle)',
    description: 'A bundle of required chapters in excellent condition. Ideal for exam weeks.',
    categories: ['Textbooks'],
    pricePerDay: 9,
    location: 'Main Entrance',
    condition: 'Fair',
    owner: { uid: 'owner-5', name: 'Emma (Owner)', trustScore: 4.2 },
  },
  {
    id: 'laptop',
    title: 'Lightweight Laptop',
    description: 'Fast and lightweight for assignments. Comes with charger and a clean workspace setup.',
    categories: ['Laptops'],
    pricePerDay: 30,
    location: 'Library Hub',
    condition: 'Good',
    owner: { uid: 'owner-6', name: 'Liam (Owner)', trustScore: 4.6 },
  },
];

