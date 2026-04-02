export function formatWhatsAppOrder({ items, total, customerInfo, includePlaceholders = true }) {
  const productList = items.map((item, i) => {
    const itemTotal = item.price * item.quantity;
    return `${i + 1}. ${item.nameBn || item.name}\n   Qty: ${item.quantity} × ৳${item.price.toLocaleString('en-BD')} = ৳${itemTotal.toLocaleString('en-BD')}`;
  }).join('\n\n');

  let message = `🛒 *NEW ORDER - সমীকরণ শপ*\n\n`;
  if (includePlaceholders) {
    message += `👤 *CUSTOMER INFO*\nName: ${customerInfo?.name || '[Your Name]'}\nPhone: ${customerInfo?.phone || '[Your Phone]'}\nAddress: ${customerInfo?.address || '[Your Address]'}\n\n`;
  }
  message += `📦 *ORDER DETAILS*\n\n${productList}\n\n`;
  message += `💰 Total: ৳${total.toLocaleString('en-BD')}\n\n`;
  message += `📞 +880 1996-570203`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/8801996570203?text=${encodedMessage}`;
  return { message, encodedMessage, whatsappUrl };
}

export function quickWhatsAppOrder(items, total) {
  const list = items.map((i) => `${i.nameBn || i.name} x${i.quantity} = ৳${(i.price * i.quantity).toLocaleString('en-BD')}`).join('\n');
  const msg = encodeURIComponent(`Hello! I'd like to order:\n\n${list}\n\nTotal: ৳${total.toLocaleString('en-BD')}`);
  return `https://wa.me/8801996570203?text=${msg}`;
}

export function createWhatsAppLink(message) {
  return `https://wa.me/8801996570203?text=${encodeURIComponent(message)}`;
}

export default formatWhatsAppOrder;
