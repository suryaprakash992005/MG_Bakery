import { Product, Review, GalleryItem } from './types';

export const CATEGORIES = [
  'Cakes',
  'Pastries',
  'Cookies',
  'Puffs',
  'Breads',
  'Snacks',
  'Beverages',
  'Fast Food',
  'Buffs',
  'Tea Coffee',
  'Lemon Juice',
  'Ice Creams',
  'Special Ice Creams',
  'Fresh Juice',
  'Milk Shakes',
  'Roll Items',
  'Special Milkshakes',
  'Pizza',
  'Burger',
  'Sandwich',
  'Cutlet',
  'Oil Fry',
  'Mocktails'
] as const;

export const CAKE_FLAVORS = [
  'All',
  'Chocolate & Truffle',
  'Fruit & Berry',
  'Traditional & Fusion',
  'Specialty'
] as const;

export const PRODUCTS: Product[] = [
  // --- CAKES ---
  {
    id: 'c1',
    name: 'White Forest',
    description: 'An elegant creation of light vanilla sponge layered with juicy cherries, white chocolate flakes, and smooth fresh cream.',
    price: { piece: 60, halfKg: 380, oneKg: 750 },
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry', 'Best Seller', 'Eggless Available'],
    isBestSeller: true,
    isEggless: true
  },
  {
    id: 'c2',
    name: 'White Truffle',
    description: 'Rich, velvety white chocolate ganache layered with moist white cake, coated in silky white glaze and chocolate curls.',
    price: { piece: 70, halfKg: 420, oneKg: 800 },
    image: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Chocolate & Truffle', 'Premium'],
    isEggless: true
  },
  {
    id: 'c3',
    name: 'Black Forest',
    description: 'Classic German luxury. Moist chocolate layers infused with cherry syrup, fresh cream, cherries, and dark chocolate flakes.',
    price: { piece: 60, halfKg: 380, oneKg: 750 },
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry', 'Chocolate & Truffle', 'Classic'],
    isBestSeller: true,
    isEggless: true
  },
  {
    id: 'c4',
    name: 'Chocochip Truffle',
    description: 'Decadent dark chocolate truffle sponge cake overloaded with crunchy chocolate chips and rich chocolate fudge icing.',
    price: { piece: 75, halfKg: 450, oneKg: 850 },
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Chocolate & Truffle', 'Signature'],
    isBestSeller: true,
    isEggless: true
  },
  {
    id: 'c5',
    name: 'Pineapple',
    description: 'Soft vanilla sponge filled with chopped glazed pineapple chunks, pineapple syrup, and fluffy whipped cream.',
    price: { piece: 50, halfKg: 350, oneKg: 680 },
    image: 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry', 'Classic'],
    isEggless: true
  },
  {
    id: 'c6',
    name: 'Strawberry',
    description: 'Delightful pink sponge layered with fresh Namakkal strawberry compote, whipped cream, and wild berry drizzles.',
    price: { piece: 55, halfKg: 360, oneKg: 700 },
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry'],
    isEggless: true
  },
  {
    id: 'c7',
    name: 'Mango',
    description: 'Summery indulgence featuring fresh mango pulp layered in vanilla cake, frosted with light mango-infused cream.',
    price: { piece: 60, halfKg: 380, oneKg: 750 },
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry', 'Seasonal'],
    isEggless: true
  },
  {
    id: 'c8',
    name: 'Orange',
    description: 'Tangy and sweet orange zest sponge cake layered with fresh citrus cream and delicate mandarin glaze.',
    price: { piece: 55, halfKg: 360, oneKg: 700 },
    image: 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry'],
    isEggless: true
  },
  {
    id: 'c9',
    name: 'Blueberry',
    description: 'Luscious vanilla cake with swirls of sweet wild blueberry compote, frosted with a beautiful lavender-hued cream.',
    price: { piece: 65, halfKg: 400, oneKg: 780 },
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry', 'Signature'],
    isBestSeller: true,
    isEggless: true
  },
  {
    id: 'c10',
    name: 'Black Currant',
    description: 'Rich dark grape and blackcurrant jam layers in fluffy vanilla sponge, topped with dried blackcurrants.',
    price: { piece: 60, halfKg: 380, oneKg: 750 },
    image: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry'],
    isEggless: true
  },
  {
    id: 'c11',
    name: 'Kiwi',
    description: 'Fresh and tropical kiwi purée layered between vanilla sponge sheets, topped with glazed fresh kiwi slices.',
    price: { piece: 60, halfKg: 380, oneKg: 750 },
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Fruit & Berry'],
    isEggless: true
  },
  {
    id: 'c12',
    name: 'Rainbow',
    description: 'Six vibrant, multi-colored vanilla layers representing the rainbow spectrum, filled and frosted with smooth vanilla bean cream.',
    price: { halfKg: 500, oneKg: 950 },
    image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Specialty', 'Celebration', 'Premium'],
    isEggless: true
  },
  {
    id: 'c13',
    name: 'Red Velvet',
    description: 'Stunning crimson-colored velvet cocoa sponge layered with rich and tangy vanilla cream cheese frosting.',
    price: { piece: 80, halfKg: 480, oneKg: 900 },
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Specialty', 'Best Seller', 'Premium'],
    isBestSeller: true,
    isEggless: true
  },
  {
    id: 'c14',
    name: 'Honey Almond',
    description: 'Traditional toasted cake layered with sweet wild honey glaze, filled with chopped roasted golden almonds.',
    price: { piece: 70, halfKg: 420, oneKg: 800 },
    image: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Traditional & Fusion', 'Nuts'],
    isEggless: true
  },
  {
    id: 'c15',
    name: 'Rasmalai Cake',
    description: 'An exquisite fusion of traditional Indian dessert and Western bakery. Cardamom-spiced sponge soaked in saffron milk and loaded with real Rasmalai pieces, pistachios, and almond flakes.',
    price: { piece: 90, halfKg: 500, oneKg: 950 },
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Traditional & Fusion', 'Signature', 'Premium', 'Best Seller'],
    isBestSeller: true,
    isEggless: true
  },
  {
    id: 'c16',
    name: 'Choco Almond',
    description: 'Classic chocolate sponge layered with thick dark chocolate ganache and generous amounts of crushed roasted almonds.',
    price: { piece: 75, halfKg: 440, oneKg: 850 },
    image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Chocolate & Truffle', 'Nuts'],
    isEggless: true
  },
  {
    id: 'c17',
    name: 'Milk Truffle',
    description: 'Silky and sweet milk chocolate ganache layered in moist chocolate cake sheets, coated in milk chocolate flakes.',
    price: { piece: 70, halfKg: 420, oneKg: 800 },
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Chocolate & Truffle'],
    isEggless: true
  },
  {
    id: 'c18',
    name: 'Nutty Bubble',
    description: 'Crunchy hazelnut and peanut praline chocolate cake loaded with chocolate bubble nuggets and fudge caramel.',
    price: { piece: 80, halfKg: 460, oneKg: 880 },
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80',
    category: 'Cakes',
    tags: ['Chocolate & Truffle', 'Nuts', 'Premium'],
    isEggless: true
  },

  // --- PASTRIES ---
  {
    id: 'p1',
    name: 'Classic Honey Cake',
    description: 'Traditional Iyengar style moist vanilla cake drenched in honey syrup, spread with mixed fruit jam, and coated with desiccated coconut.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    category: 'Pastries',
    tags: ['Traditional', 'Local Favorite'],
    isBestSeller: true
  },
  {
    id: 'p2',
    name: 'Chocolate Lava Cake',
    description: 'Rich chocolate muffin with a warm, molten liquid chocolate core that oozes out on the first bite.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    category: 'Pastries',
    tags: ['Chocolate', 'Premium']
  },
  {
    id: 'p3',
    name: 'Butterscotch Slice',
    description: 'Caramelised sugar sponge layer cake with butterscotch cream and crunchy butterscotch chips.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80',
    category: 'Pastries'
  },

  // --- COOKIES ---
  {
    id: 'co1',
    name: 'Traditional Iyengar Salt Biscuits',
    description: 'Crisp, flaky, and savory biscuits with a hint of cumin and pepper. A perfect tea-time snack.',
    price: 60, // Per 250g
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    category: 'Cookies',
    tags: ['Iyengar Special', 'Salty', 'Tea-Time'],
    isBestSeller: true
  },
  {
    id: 'co2',
    name: 'Premium Butter Cookies',
    description: 'Melt-in-mouth golden baked cookies enriched with pure dairy butter and vanilla bean.',
    price: 80, // Per 250g
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    category: 'Cookies',
    tags: ['Sweet', 'Classic']
  },
  {
    id: 'co3',
    name: 'Cashew Cookies',
    description: 'Deliciously crunchy baked cookies topped and loaded with rich broken Namakkal cashews.',
    price: 90, // Per 250g
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    category: 'Cookies',
    tags: ['Nuts', 'Premium']
  },

  // --- PUFFS ---
  {
    id: 'pf1',
    name: 'Classic Veg Puff',
    description: 'Golden, crispy puff pastry shell stuffed with a spiced dry mixture of potatoes, carrots, peas, and onions.',
    price: 15,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    category: 'Puffs',
    tags: ['Hot Snack', 'Best Seller'],
    isBestSeller: true
  },
  {
    id: 'pf2',
    name: 'Egg Puff',
    description: 'Layered flaky puff pastry enveloping a boiled egg half cooked in a rich, caramelized onion-tomato masala.',
    price: 20,
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=800&q=80',
    category: 'Puffs',
    tags: ['Hot Snack', 'Classic']
  },
  {
    id: 'pf3',
    name: 'Spicy Paneer Puff',
    description: 'Crispy pastry sheets folded over spiced scrambled paneer (cottage cheese) cubes with coriander.',
    price: 25,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
    category: 'Puffs',
    tags: ['Hot Snack', 'Premium']
  },

  // --- BREADS ---
  {
    id: 'b1',
    name: 'Iyengar Milk Bread',
    description: 'Sweetish, extremely soft, and fluffy loaf of freshly baked white milk bread. Ideal for toasts.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    category: 'Breads',
    tags: ['Daily Fresh', 'Sweet'],
    isBestSeller: true
  },
  {
    id: 'b2',
    name: 'Artisan Wheat Bread',
    description: 'Healthy and wholesome bread baked with 100% whole wheat grains and covered in rolled oats.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
    category: 'Breads',
    tags: ['Daily Fresh', 'Healthy']
  },

  // --- SNACKS ---
  {
    id: 's1',
    name: 'Kara Boondi',
    description: 'Crisp fried chickpea flour balls seasoned with chili powder, curry leaves, and crunchy peanuts.',
    price: 40, // 200g
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
    category: 'Snacks',
    tags: ['Savory', 'Spicy'],
    isBestSeller: true
  },
  {
    id: 's2',
    name: 'Special Ribbon Pakoda',
    description: 'Crunchy, ribbon-like savory snack made of rice and gram flour, flavored with asafoetida and cumin.',
    price: 40, // 200g
    image: 'https://images.unsplash.com/photo-1589476993333-f55b84301219?auto=format&fit=crop&w=800&q=80',
    category: 'Snacks',
    tags: ['Savory']
  },
  {
    id: 's3',
    name: 'Namakkal Spicy Mixture',
    description: 'A traditional hot blend of sev, boondi, roasted peanuts, cashews, and curry leaves with spices.',
    price: 50, // 200g
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
    category: 'Snacks',
    tags: ['Savory', 'Spicy', 'Signature']
  },

  // --- BEVERAGES ---
  {
    id: 'bv1',
    name: 'South Indian Filter Coffee',
    description: 'Strong, aromatic chicory coffee brewed in traditional filters and mixed with frothy boiling milk.',
    price: 20,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    category: 'Beverages',
    tags: ['Hot', 'Traditional'],
    isBestSeller: true
  },
  {
    id: 'bv2',
    name: 'Special Rose Milk',
    description: 'Perfect cooling beverage made of thick, chilled milk blended with sweet aromatic rose petal syrup.',
    price: 30,
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
    category: 'Beverages',
    tags: ['Cold', 'Sweet']
  },
  {
    id: 'bv3',
    name: 'Badam Milk (Hot/Cold)',
    description: 'Rich milk slow-boiled with real almond paste, saffron strands, and topped with chopped pistachio bits.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    category: 'Beverages',
    tags: ['Signature']
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Rajesh Kumar',
    rating: 5,
    comment: 'The Rasmalai Cake from M.G. Iyengar is out of this world! It was the star of my daughters birthday celebration in Mohanur. Highly recommended!',
    role: 'Local Resident',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 'r2',
    name: 'Priyah Hari',
    rating: 5,
    comment: 'Freshly baked milk bread and veg puffs are my daily evening routines. The quality is premium and consistent. Ordering on WhatsApp is so easy.',
    role: 'Regular Customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 'r3',
    name: 'Ananth Krishnan',
    rating: 5,
    comment: 'I ordered a 2Kg custom double-decker chocolate truffle cake. The design details were beautiful, and the taste was pure luxury. Apple-like ordering experience!',
    role: 'Tech Lead, Namakkal',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 'r4',
    name: 'Sivagami Sundaram',
    rating: 4.8,
    comment: 'Authentic Iyengar bakery taste. Their salt biscuits are crunchy and have the perfect traditional flavor. Very clean shop and polite staff.',
    role: 'School Teacher',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Custom Chocolate Cascade Cake',
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'g2',
    title: 'Warm Baked Veg Puffs',
    category: 'products',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'g3',
    title: 'Aromatic Filter Coffee Brewing',
    category: 'products',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'g4',
    title: 'Clean Artisan Kitchen Setup',
    category: 'interior',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'g5',
    title: 'Strawberry Rose Pastries',
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'g6',
    title: 'Golden Crust Milk Bread Loaves',
    category: 'products',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'g7',
    title: 'A 50th Birthday Party Celebration',
    category: 'celebrations',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'g8',
    title: 'Bakery Front Display Counter',
    category: 'interior',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'g9',
    title: 'Rasmalai Rich Cream Cake Decor',
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
  }
];
