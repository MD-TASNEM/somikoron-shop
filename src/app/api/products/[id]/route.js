import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';
import { ProductCollection } from '@/lib/db/collections/product';
import { ObjectId } from 'mongodb';

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const db = await getDb();
    const pc = new ProductCollection(db);
    const product = await pc.findById(id) || await pc.findBySlug(id);
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: pc.transformProduct(product) });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const db = await getDb();
    const pc = new ProductCollection(db);
    const existing = await pc.findById(id);
    if (!existing) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    if (body.slug && body.slug !== existing.slug) {
      const dup = await pc.findBySlug(body.slug);
      if (dup) return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 });
    }

    const updated = await pc.update(id, body);
    if (!updated) return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    return NextResponse.json({ success: true, data: { product: pc.transformProduct(updated) } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const db = await getDb();
    const pc = new ProductCollection(db);
    const existing = await pc.findById(id);
    if (!existing) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    const related = await db.collection('orders').find({ 'items.productId': new ObjectId(id) }).limit(1).toArray();
    if (related.length > 0) return NextResponse.json({ success: false, error: 'Product is referenced in existing orders' }, { status: 409 });

    const deleted = await pc.delete(id);
    if (!deleted) return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
    return NextResponse.json({ success: true, data: { deletedProductId: id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
