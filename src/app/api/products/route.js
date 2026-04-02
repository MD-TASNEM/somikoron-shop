import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const badge = searchParams.get('badge') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const skip = (page - 1) * limit;

    const db = await getDb();
    const query = {};
    if (category) query.category = category;
    if (badge) query.badge = badge;
    if (inStock === 'true') query.stock = { $gt: 0 };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameBn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'newest': { createdAt: -1 },
      'popular': { rating: -1 },
    };
    const sortStage = sortMap[sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      db.collection('products').find(query).sort(sortStage).skip(skip).limit(limit).toArray(),
      db.collection('products').countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          nameBn: p.nameBn,
          slug: p.slug,
          price: p.price,
          originalPrice: p.originalPrice,
          category: p.category,
          badge: p.badge,
          images: p.images || [],
          description: p.description,
          stock: p.stock,
          rating: p.rating || 0,
          reviewCount: Array.isArray(p.reviews) ? p.reviews.length : 0,
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ success: false, error: 'name and price are required' }, { status: 400 });
    }
    const slug = body.slug || slugify(body.name);
    const db = await getDb();
    const existing = await db.collection('products').findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 });
    }
    const now = new Date();
    const result = await db.collection('products').insertOne({
      name: body.name,
      nameBn: body.nameBn || body.name,
      slug,
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : undefined,
      category: body.category || 'general',
      badge: body.badge,
      images: body.images || [],
      description: body.description || '',
      stock: parseInt(body.stock) || 0,
      rating: 0,
      reviews: [],
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ success: true, data: { id: result.insertedId.toString(), slug } }, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
