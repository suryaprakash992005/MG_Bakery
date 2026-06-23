export interface ProductPrice {
  piece?: number;
  halfKg?: number;
  oneKg?: number;
  single?: number; // fallback or default price for non-cake items
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | ProductPrice;
  image: string;
  category: 'Cakes' | 'Pastries' | 'Cookies' | 'Puffs' | 'Breads' | 'Snacks' | 'Beverages' | 'Fresh Cream Cakes' | 'Birthday Cakes' | 'Custom Cakes' | 'Cake Pieces';
  tags?: string[];
  isBestSeller?: boolean;
  isEggless?: boolean;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  role?: string;
  avatar?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'cakes' | 'pastries' | 'interior' | 'products' | 'celebrations';
  image: string;
}

export interface CustomCakeInquiry {
  name: string;
  mobile: string;
  flavor: string;
  weight: string;
  occasion: string;
  deliveryDate: string;
  instructions: string;
}
