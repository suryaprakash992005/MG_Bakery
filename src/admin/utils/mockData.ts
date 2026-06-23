import { AdminProduct, AdminOrder, CustomCakeOrder, AdminCustomer, BakerySettings } from '../types';

export const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'p-1',
    name: 'Rasmalai Fusion Cake',
    description: 'An exquisite fusion of traditional Indian Rasmalai and classic fresh cream cake, topped with pistachios and almond flakes.',
    price: 950,
    weight: '1.0 Kg',
    category: 'Cakes',
    prepTime: '4 hours',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-05-10'
  },
  {
    id: 'p-2',
    name: 'Chocochip Truffle Cake',
    description: 'Rich dark chocolate truffle sponge cake layered with chocolate chips and chocolate ganache fudge.',
    price: 850,
    weight: '1.0 Kg',
    category: 'Cakes',
    prepTime: '3 hours',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-05-12'
  },
  {
    id: 'p-3',
    name: 'Red Velvet Premium',
    description: 'Crimson-colored velvet cocoa sponge layered with rich and tangy vanilla cream cheese frosting.',
    price: 480,
    weight: '0.5 Kg',
    category: 'Cakes',
    prepTime: '4 hours',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-05-15'
  },
  {
    id: 'p-4',
    name: 'White Forest Cake',
    description: 'Light vanilla sponge layered with juicy cherries, white chocolate curls, and fresh whipped cream.',
    price: 380,
    weight: '0.5 Kg',
    category: 'Cakes',
    prepTime: '2 hours',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-05-01'
  },
  {
    id: 'p-5',
    name: 'Classic honey Cake Slice',
    description: 'Traditional Iyengar style honey cake slice spread with mixed fruit jam and desiccated coconut.',
    price: 35,
    weight: 'Single Piece',
    category: 'Pastries',
    prepTime: '1 hour',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-04-20'
  },
  {
    id: 'p-6',
    name: 'Chocolate Lava Muffin',
    description: 'Muffin with a warm molten liquid chocolate core that oozes on first bite.',
    price: 50,
    weight: 'Single Piece',
    category: 'Pastries',
    prepTime: '1 hour',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-04-22'
  },
  {
    id: 'p-7',
    name: 'Classic Veg Puff',
    description: 'Flaky baked golden pastry shell stuffed with spiced potatoes, green peas, and carrots.',
    price: 15,
    weight: 'Single Piece',
    category: 'Puffs',
    prepTime: '30 mins',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-04-10'
  },
  {
    id: 'p-8',
    name: 'Egg Puff Special',
    description: 'Golden puff pastry envelops half boiled egg cooked in rich onion-tomato masala.',
    price: 20,
    weight: 'Single Piece',
    category: 'Puffs',
    prepTime: '30 mins',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-04-12'
  },
  {
    id: 'p-9',
    name: 'Iyengar Milk Bread',
    description: 'Super soft and sweet white sandwich milk loaf baked fresh daily.',
    price: 35,
    weight: '400g Loaf',
    category: 'Breads',
    prepTime: '2 hours',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-04-15'
  },
  {
    id: 'p-10',
    name: 'Premium Butter Cookies',
    description: 'Traditional melt-in-mouth cookies enriched with pure table butter.',
    price: 80,
    weight: '250g Pack',
    category: 'Cookies',
    prepTime: '1 hour',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-04-18'
  },
  {
    id: 'p-11',
    name: 'Namakkal Spicy Mixture',
    description: 'Savory blend of chickpea flour noodles, peanuts, cashews, and curry leaves.',
    price: 50,
    weight: '200g Pack',
    category: 'Snacks',
    prepTime: '30 mins',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-04-05'
  },
  {
    id: 'p-12',
    name: 'South Indian Filter Coffee',
    description: 'Traditional strong decoction coffee frothed with boiling milk.',
    price: 20,
    weight: '150ml Cup',
    category: 'Beverages',
    prepTime: '10 mins',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    createdDate: '2026-04-01'
  }
];

export const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ORD-2034',
    customerName: 'Rajesh Kumar',
    phone: '+91 98450 12345',
    deliveryAddress: '12, Gandhi Nagar Main Road, Mohanur, Namakkal - 637015',
    orderedProduct: 'Rasmalai Fusion Cake (1.0 Kg)',
    quantity: 1,
    amount: 950,
    paymentMethod: 'UPI/Online',
    paymentStatus: 'Paid',
    orderStatus: 'Pending',
    createdDate: '2026-06-23T10:15:00Z'
  },
  {
    id: 'ORD-2033',
    customerName: 'Priya Hari',
    phone: '+91 90432 55677',
    deliveryAddress: 'Room 104, Royal Apartments, Mohanur - 637015',
    orderedProduct: 'Classic Veg Puff + South Indian Filter Coffee',
    quantity: 3,
    amount: 105,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    orderStatus: 'Accepted',
    createdDate: '2026-06-23T09:40:00Z'
  },
  {
    id: 'ORD-2032',
    customerName: 'Ananth Krishnan',
    phone: '+91 94440 98765',
    deliveryAddress: '24, SPB Colony, Namakkal Road, Namakkal - 637001',
    orderedProduct: 'Chocochip Truffle Cake (1.0 Kg)',
    quantity: 1,
    amount: 850,
    paymentMethod: 'UPI/Online',
    paymentStatus: 'Paid',
    orderStatus: 'Preparing',
    createdDate: '2026-06-23T08:20:00Z'
  },
  {
    id: 'ORD-2031',
    customerName: 'Sivagami Sundaram',
    phone: '+91 88701 44556',
    deliveryAddress: 'Government Girls School Campus, Mohanur - 637015',
    orderedProduct: 'Premium Butter Cookies + Iyengar Milk Bread',
    quantity: 2,
    amount: 115,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    orderStatus: 'Ready',
    createdDate: '2026-06-23T07:10:00Z'
  },
  {
    id: 'ORD-2030',
    customerName: 'Murugan Thangavel',
    phone: '+91 96291 00223',
    deliveryAddress: '55, Bazar Street, Mohanur - 637015',
    orderedProduct: 'Egg Puff Special + Badam Milk (Cold)',
    quantity: 4,
    amount: 220,
    paymentMethod: 'UPI/Online',
    paymentStatus: 'Paid',
    orderStatus: 'Out for Delivery',
    createdDate: '2026-06-23T06:30:00Z'
  },
  {
    id: 'ORD-2029',
    customerName: 'Deepa Subramaniam',
    phone: '+91 73730 66889',
    deliveryAddress: '15/A, Raja Street, Mohanur - 637015',
    orderedProduct: 'White Forest Cake (0.5 Kg)',
    quantity: 1,
    amount: 380,
    paymentMethod: 'UPI/Online',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    createdDate: '2026-06-22T17:45:00Z'
  },
  {
    id: 'ORD-2028',
    customerName: 'Karthikeyan K',
    phone: '+91 99943 22334',
    deliveryAddress: 'Cauvery River View Layout, Mohanur - 637015',
    orderedProduct: 'Red Velvet Premium (0.5 Kg)',
    quantity: 1,
    amount: 480,
    paymentMethod: 'UPI/Online',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    createdDate: '2026-06-22T16:10:00Z'
  },
  {
    id: 'ORD-2027',
    customerName: 'Suresh Raina',
    phone: '+91 91590 88990',
    deliveryAddress: '2, VIP Enclave, Mohanur Main Road, Namakkal - 637015',
    orderedProduct: 'Namakkal Spicy Mixture (200g)',
    quantity: 5,
    amount: 250,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    orderStatus: 'Cancelled',
    createdDate: '2026-06-22T11:00:00Z'
  },
  {
    id: 'ORD-2026',
    customerName: 'Meena Srinivasan',
    phone: '+91 94860 33445',
    deliveryAddress: '3B, Temple View Apartments, Mohanur - 637015',
    orderedProduct: 'Rasmalai Fusion Cake (1.0 Kg)',
    quantity: 1,
    amount: 950,
    paymentMethod: 'UPI/Online',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    createdDate: '2026-06-22T09:30:00Z'
  }
];

export const INITIAL_CUSTOM_ORDERS: CustomCakeOrder[] = [
  {
    id: 'CUST-801',
    customerName: 'Archana Devi',
    phone: '+91 95001 22998',
    theme: 'Three-Tier Royal Wedding Cake',
    weight: '5.0 Kg',
    deliveryDate: '2026-06-30',
    quotedPrice: 6500,
    status: 'Approved',
    instructions: 'Saffron cardamom cream icing, cascading white roses, gold dust sprinkles. Half chocolate truffle, half butterscotch flavors.',
    referenceImage: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CUST-802',
    customerName: 'Vijay Raghavan',
    phone: '+91 90033 88122',
    theme: 'Kids Dinosaur Jungle Birthday Theme',
    weight: '2.5 Kg',
    deliveryDate: '2026-06-26',
    quotedPrice: undefined,
    status: 'Pending',
    instructions: 'A green T-Rex fondant figure on top, palm tree leaves around base. Name text "Rohan is 5" in yellow edible fondant letters.',
    referenceImage: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CUST-803',
    customerName: 'Saranya Mohan',
    phone: '+91 94435 77665',
    theme: 'Corporate Anniversary Black & Gold',
    weight: '3.0 Kg',
    deliveryDate: '2026-07-05',
    quotedPrice: 3200,
    status: 'Quoted',
    instructions: 'Square-shaped cake, black vanilla glaze with golden enterprise logo. "Celebrating 10 Years of Excellence" script.',
    referenceImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CUST-804',
    customerName: 'Dinesh Balaji',
    phone: '+91 97890 55432',
    theme: 'Romantic Heart Red Velvet Anniversary',
    weight: '1.5 Kg',
    deliveryDate: '2026-06-25',
    quotedPrice: undefined,
    status: 'Pending',
    instructions: 'Heart shape, fully coated with red velvet sponge crumbs, white chocolate cream cheese piping on border. Card tag: "To My Love".',
    referenceImage: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_CUSTOMERS: AdminCustomer[] = [
  {
    id: 'C-01',
    name: 'Rajesh Kumar',
    phone: '+91 98450 12345',
    email: 'rajesh.k@gmail.com',
    totalOrders: 15,
    lifetimeSpend: 8400,
    lastOrderDate: '2026-06-23',
    type: 'VIP'
  },
  {
    id: 'C-02',
    name: 'Priya Hari',
    phone: '+91 90432 55677',
    email: 'priyahari@yahoo.co.in',
    totalOrders: 28,
    lifetimeSpend: 4200,
    lastOrderDate: '2026-06-23',
    type: 'VIP'
  },
  {
    id: 'C-03',
    name: 'Ananth Krishnan',
    phone: '+91 94440 98765',
    email: 'ananth.k@techmail.com',
    totalOrders: 8,
    lifetimeSpend: 4900,
    lastOrderDate: '2026-06-23',
    type: 'Regular'
  },
  {
    id: 'C-04',
    name: 'Sivagami Sundaram',
    phone: '+91 88701 44556',
    email: 'sivagami.s@gghs.edu.in',
    totalOrders: 19,
    lifetimeSpend: 2350,
    lastOrderDate: '2026-06-23',
    type: 'Regular'
  },
  {
    id: 'C-05',
    name: 'Deepa Subramaniam',
    phone: '+91 73730 66889',
    email: 'deepa.subbu@outlook.com',
    totalOrders: 4,
    lifetimeSpend: 1540,
    lastOrderDate: '2026-06-22',
    type: 'New'
  },
  {
    id: 'C-06',
    name: 'Karthikeyan K',
    phone: '+91 99943 22334',
    email: 'karthikeyank@gmail.com',
    totalOrders: 3,
    lifetimeSpend: 1280,
    lastOrderDate: '2026-06-22',
    type: 'New'
  },
  {
    id: 'C-07',
    name: 'Murugan Thangavel',
    phone: '+91 96291 00223',
    email: 'muruganchemicals@rediff.com',
    totalOrders: 11,
    lifetimeSpend: 1890,
    lastOrderDate: '2026-06-23',
    type: 'Regular'
  }
];

export const INITIAL_SETTINGS: BakerySettings = {
  bakeryName: 'M.G. Iyengar Bakery & Chat Corner',
  phone: '+91 90479 13344',
  whatsappNumber: '+91 90479 13344',
  storeAddress: 'M.G. Iyengar Bakery & Chat Corner, Mohanur Main Road, Mohanur, Namakkal, Tamil Nadu - 637015',
  deliveryCharge: 30,
  instagramUrl: 'https://instagram.com/mgiyengar.bakery',
  facebookUrl: 'https://facebook.com/mgiyengar.bakery',
  businessHours: '9:00 AM - 10:00 PM',
  holidaySettings: 'All Sundays open. Close only on National Holidays (Diwali, Pongal, Republic Day).'
};

// SVG Chart data structures for Analytics
export const MONTHLY_REVENUE_DATA = [
  { month: 'Jan', revenue: 75000, orders: 420 },
  { month: 'Feb', revenue: 89000, orders: 490 },
  { month: 'Mar', revenue: 112000, orders: 630 },
  { month: 'Apr', revenue: 98000, orders: 550 },
  { month: 'May', revenue: 125000, orders: 710 },
  { month: 'Jun', revenue: 148000, orders: 840 }
];

export const WEEKLY_ORDERS_DATA = [
  { day: 'Mon', count: 32 },
  { day: 'Tue', count: 45 },
  { day: 'Wed', count: 38 },
  { day: 'Thu', count: 52 },
  { day: 'Fri', count: 64 },
  { day: 'Sat', count: 85 },
  { day: 'Sun', count: 98 }
];

export const CATEGORY_DISTRIBUTION = [
  { category: 'Cakes', percentage: 45, color: '#A38848' },
  { category: 'Pastries', percentage: 15, color: '#C29696' },
  { category: 'Puffs', percentage: 20, color: '#5B3535' },
  { category: 'Cookies', percentage: 10, color: '#E29595' },
  { category: 'Others', percentage: 10, color: '#D5C493' }
];

export const INITIAL_GALLERY_IMAGES = [
  {
    id: 'g-1',
    title: 'Custom Chocolate Cascade Cake',
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    uploadDate: '2026-05-18',
    isBanner: true
  },
  {
    id: 'g-2',
    title: 'Warm Baked Veg Puffs',
    category: 'products',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    uploadDate: '2026-05-20',
    isBanner: false
  },
  {
    id: 'g-3',
    title: 'Aromatic Filter Coffee Brewing',
    category: 'products',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    uploadDate: '2026-05-22',
    isBanner: false
  },
  {
    id: 'g-4',
    title: 'Clean Artisan Kitchen Setup',
    category: 'interior',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    uploadDate: '2026-05-24',
    isBanner: false
  },
  {
    id: 'g-5',
    title: 'Strawberry Rose Pastries',
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    uploadDate: '2026-05-26',
    isBanner: true
  },
  {
    id: 'g-6',
    title: 'Golden Crust Milk Bread Loaves',
    category: 'products',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    uploadDate: '2026-05-28',
    isBanner: false
  }
];
