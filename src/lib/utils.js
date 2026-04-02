export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export function formatPrice(price) {
  return `৳${price.toLocaleString('en-BD')}`;
}

export function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export function truncate(str, length = 100) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}
