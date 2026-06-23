export const WHATSAPP_PHONE_NUMBER = '919047913344'; // Replace with real business number

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
  const text = `Hello M.G. Iyengar Bakery,

I would like to inquire about a Custom Celebration Cake:

Name: ${data.name}
Mobile Number: ${data.mobile}
Cake Flavor: ${data.flavor}
Weight: ${data.weight}
Occasion: ${data.occasion}
Delivery Date: ${data.deliveryDate}
Special Instructions: ${data.instructions || 'None'}

Please let me know availability, pricing details, and how I can share reference images. Thank you!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
};

/**
 * Generates a WhatsApp general contact inquiry URL
 */
export const getGeneralInquiryUrl = (name: string, message: string): string => {
  const text = `Hello M.G. Iyengar Bakery,

My name is ${name}.

Inquiry:
${message}

Please get back to me. Thank you!`;

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
};
