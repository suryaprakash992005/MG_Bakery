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
  category: string;
  tags?: string[];
  isBestSeller?: boolean;
  isEggless?: boolean;
  status?: 'Available' | 'Out of Stock' | 'Hidden';
  displayPriority?: number;
  dailySpecial?: boolean;
  images?: string[];
  isFeatured?: boolean;
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
  category: string;
  image: string;
  displayPriority?: number;
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

