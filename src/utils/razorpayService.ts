// Razorpay Online Payment Integration Service (Test Mode & Live Mode Ready)

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise (e.g., 50000 = ₹500)
  currency: string; // 'INR'
  name: string;
  description: string;
  image?: string;
  order_id: string; // Razorpay Order ID from server
  prefill: {
    name: string;
    email?: string;
    contact: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

// Default Razorpay Test Key ID (Can be overridden by VITE_RAZORPAY_KEY_ID in .env)
export const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_MG_Bakery_Mohanur';

/**
 * Dynamically loads Razorpay checkout script into document head
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Creates a mock/local Razorpay order ID if backend API is not responding during test mode
 */
export const generateClientRazorpayOrderId = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `order_${timestamp}${random}`;
};

/**
 * Simulates server-side Razorpay signature verification
 */
export const verifyRazorpayPaymentSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  // In production, signature MUST be verified on server using HMAC-SHA256 with RAZORPAY_KEY_SECRET
  if (razorpaySignature && razorpayPaymentId && razorpayOrderId) {
    return true;
  }
  return false;
};
