export const WHATSAPP_PHONE_NUMBER = '919345586112'; // Replace with real business number

/**
 * Generates a WhatsApp order URL for a specific product
 */
export const getProductOrderUrl = (
  productName: string,
  priceDetails: string,
  quantity: number = 1,
  whatsappNumber: string = WHATSAPP_PHONE_NUMBER
): string => {
  const text = `Hello M.G. Iyengar Bakery,

I would like to order:

Product: ${productName}
Quantity: ${quantity}
Details: ${priceDetails}

Please share availability and payment details. Thank you!`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
};

/**
 * Generates a WhatsApp inquiry URL for custom celebration cakes
 */
export const getCustomCakeInquiryUrl = (
  data: {
    name: string;
    mobile: string;
    flavor: string;
    weight: string;
    occasion: string;
    deliveryDate: string;
    instructions: string;
  },
  whatsappNumber: string = WHATSAPP_PHONE_NUMBER
): string => {
  const text = `🎂 *CUSTOM CAKE INQUIRY - M.G. IYENGAR* 🎂
----------------------------------------------
Hello, I would like to inquire about a custom celebration cake.

👤 *CUSTOMER DETAILS:*
• *Name:* ${data.name}
• *Mobile:* ${data.mobile}

🍰 *CAKE DETAILS:*
• *Flavor:* ${data.flavor}
• *Weight:* ${data.weight}
• *Occasion:* ${data.occasion}
• *Delivery Date:* ${data.deliveryDate}
• *Special Instructions:* ${data.instructions || 'None'}

Please share the pricing quote, availability, and details on how I can send reference designs/images.

Thank you!`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
};

/**
 * Generates a WhatsApp general contact inquiry URL
 */
export const getGeneralInquiryUrl = (
  name: string,
  message: string,
  whatsappNumber: string = WHATSAPP_PHONE_NUMBER
): string => {
  const text = `✉️ *NEW MESSAGE - M.G. IYENGAR BAKERY* ✉️
----------------------------------------------
Hello, my name is ${name}.

💬 *INQUIRY/MESSAGE:*
${message}

Please get back to me. Thank you!`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
};

// ─── Order Item for WhatsApp Message ─────────────────────────────────────────

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedWeight?: string;
  customizations?: Record<string, string | undefined>;
}

/**
 * Generates a professional WhatsApp order message URL.
 * This is the main function used after placing an order.
 */
export const generateOrderWhatsAppUrl = (
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  orderType: 'delivery' | 'pickup',
  deliveryAddress: string | undefined,
  items: WhatsAppOrderItem[],
  subtotal: number,
  deliveryFee: number,
  total: number,
  whatsappNumber: string = WHATSAPP_PHONE_NUMBER
): string => {
  // Build items section
  const itemsText = items.map(item => {
    let line = `• *${item.quantity}x ${item.name}*`;
    if (item.selectedWeight && item.selectedWeight !== 'Standard') {
      line += `\n   Weight/Size: ${item.selectedWeight}`;
    }
    if (item.customizations) {
      Object.entries(item.customizations).forEach(([key, value]) => {
        if (value && value.trim()) {
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, s => s.toUpperCase())
            .trim();
          line += `\n   ${label}: ${value}`;
        }
      });
    }
    line += `\n   ₹${item.price.toLocaleString('en-IN')} × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}`;
    return line;
  }).join('\n\n');

  // Build address/pickup section
  const locationSection = orderType === 'delivery'
    ? `📍 *DELIVERY ADDRESS:*\n${deliveryAddress || 'Address not provided'}`
    : `🏪 *PICKUP FROM SHOP:*\nM.G. Iyengar Bakery & Chats, Mohanur`;

  const text = `🛒 *NEW ORDER - M.G. IYENGAR BAKERY* 🛒
============================================
Hello M.G. Iyengar Bakery & Chats,

I would like to place an order.

📋 *ORDER DETAILS:*
• *Order No:* ${orderNumber}
• *Order Type:* ${orderType === 'delivery' ? '🏠 Home Delivery' : '🏪 Pickup from Shop'}

👤 *CUSTOMER:*
• *Name:* ${customerName}
• *Mobile:* ${customerPhone}

${locationSection}

🍰 *ITEMS ORDERED:*
${itemsText}

💰 *PRICE SUMMARY:*
• Subtotal: ₹${subtotal.toLocaleString('en-IN')}
• Delivery Charge: ₹${deliveryFee.toLocaleString('en-IN')}
• *TOTAL: ₹${total.toLocaleString('en-IN')}*

💳 *PAYMENT:* Cash on Delivery / At Pickup

Thank you! Please confirm my order. 🙏`;

  const phone = whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};
