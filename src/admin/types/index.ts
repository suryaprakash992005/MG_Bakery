export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string; // e.g. "0.5 Kg", "1 Kg" or "Single Piece"
  category: string;
  prepTime: string; // e.g. "2 hours", "1 day"
  isAvailable: boolean;
  image: string;
  createdDate: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  orderedProduct: string;
  quantity: number;
  amount: number;
  paymentMethod: 'Cash on Delivery' | 'UPI/Online' | 'Card';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: OrderStatus;
  createdDate: string;
}

export interface CustomCakeOrder {
  id: string;
  customerName: string;
  phone: string;
  theme: string;
  weight: string;
  deliveryDate: string;
  quotedPrice?: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Quoted';
  instructions: string;
  referenceImage: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  lifetimeSpend: number;
  lastOrderDate: string;
  type: 'Regular' | 'VIP' | 'New';
}

export interface BakerySettings {
  bakeryName: string;
  phone: string;
  whatsappNumber: string;
  storeAddress: string;
  deliveryCharge: number;
  instagramUrl: string;
  facebookUrl: string;
  businessHours: string;
  holidaySettings: string;
}
