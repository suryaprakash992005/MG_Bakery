export const WHATSAPP_PHONE_NUMBER = '919345586112'; // Replace with real business number

/**
 * Generates a WhatsApp order URL for a specific product and optional pricing specification (e.g. piece, 1/2 Kg, 1 Kg)
 */
export const getProductOrderUrl = (
  productName: string,
  priceDetails: string,
  quantity: number = 1
): string => {
  const text = `Hello M.G. Iyengar Bakery,

I would like to order:

Product: ${productName}
Quantity: ${quantity}
Details: ${priceDetails}

Please share availability and payment details. Thank you!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
};

/**
 * Generates a WhatsApp inquiry URL for custom celebration cakes
 */
export const getCustomCakeInquiryUrl = (data: {
  name: string;
  mobile: string;
  flavor: string;
  weight: string;
  occasion: string;
  deliveryDate: string;
  instructions: string;
}): string => {
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

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
};

/**
 * Generates a WhatsApp general contact inquiry URL
 */
export const getGeneralInquiryUrl = (name: string, message: string): string => {
  const text = `✉️ *NEW MESSAGE - M.G. IYENGAR BAKERY* ✉️
----------------------------------------------
Hello, my name is ${name}.

💬 *INQUIRY/MESSAGE:*
${message}

Please get back to me. Thank you!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
};
