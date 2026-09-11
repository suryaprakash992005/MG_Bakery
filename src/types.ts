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

export type OrderType = 'delivery' | 'pickup';

export type PaymentMethod = 'razorpay' | 'cod' | 'whatsapp';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export type OrderStatus =
  | 'ORDER PLACED'
  | 'ORDER_PLACED'
  | 'PENDING PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT FOR DELIVERY'
  | 'DELIVERED'
  | 'READY FOR PICKUP'
  | 'PICKED UP'
  | 'CANCELLED';

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  name?: string;
  selectedWeight: string; // '½ Kg', '1 Kg', 'Slice', 'Standard'
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  customizations?: Record<string, string | undefined>;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. '#MG-100123'
  userId?: string;
  user_id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: OrderType; // 'delivery' | 'pickup'
  deliveryAddress?: string;
  streetArea?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  deliveryArea: string; // 'Mohanur'
  deliveryFee: number;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod; // 'whatsapp' | 'cod' | 'razorpay'
  paymentStatus: PaymentStatus; // 'PENDING' | 'PAID' | 'FAILED'
  orderStatus: OrderStatus;
  customerNotes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtendedBakerySettings {
  bakeryName: string;
  whatsappNumber: string;
  storeAddress: string;
  openingTime: string;
  closingTime: string;
  googleMapsLink: string;
  instagramUrl: string;
  emergencyDisableOrdering: boolean;
  heroVideoUrl: string;
  // Delivery & Payment settings
  deliveryEnabled: boolean;
  deliveryAreaName: string;
  deliveryFee: number;
  minOrderAmount: number;
  pickupEnabled: boolean;
  onlinePaymentEnabled: boolean;
  mohanurLat: number;
  mohanurLng: number;
  deliveryRadiusKm: number;
}

export interface CustomerProfile {
  id: string;
  full_name: string;
  name?: string; // alias for backwards compatibility
  phone: string;
  email: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
}
