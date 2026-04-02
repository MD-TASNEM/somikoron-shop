import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/mongodb';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductDetailClient from '@/components/product/ProductDetailClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const db = await getDb();
    const product = await db.collection('products').findOne({ slug });
    if (!product) return { title: 'Product Not Found | সমীকরণ শপ' };
    return {
      title: `${product.nameBn || product.name} | সমীকরণ শপ`,
      description: (product.description || '').substring(0, 160),
    };
  } catch {
    return { title: 'Product | সমীকরণ শপ' };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const db = await getDb();
  const product = await db.collection('products').findOne({ slug });
  if (!product) notFound();

  const related = await db.collection('products')
    .find({ category: product.category, slug: { $ne: slug }, stock: { $gt: 0 } })
    .sort({ rating: -1 }).limit(4).toArray();

  const data = JSON.parse(JSON.stringify({ product, related }));

  return (
    <>
      <Navbar />
      <ProductDetailClient product={data.product} related={data.related} />
      <Footer />
    </>
  );
}
