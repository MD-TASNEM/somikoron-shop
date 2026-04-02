import dynamic from 'next/dynamic';

export function dynamicImport(importFunc, options) {
  return dynamic(importFunc, { ssr: false, ...options });
}

export const CartSidebar = dynamicImport(
  () => import('@/components/cart/CartSidebar')
);

export function preloadComponent(importPath) {
  if (typeof window !== 'undefined') {
    import(/* webpackIgnore: true */ importPath).catch(() => {});
  }
}
