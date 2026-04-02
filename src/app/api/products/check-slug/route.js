import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request) {
  try {
    console.log('🔍 Checking slug uniqueness...');

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId');

    if (!slug) {
      return NextResponse.json(
        {
          success,
          error: 'Missing slug parameter',
          message: 'Please provide a slug to check'
        },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          success,
          error: 'Invalid slug format',
          message: 'Slug can only contain lowercase letters, numbers, and hyphens'
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Build query
    const query = { slug };

    // Exclude current product ID if updating
    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    // Check if slug exists
    const existingProduct = await db.collection('products').findOne(query);

    const exists = !!existingProduct;

    console.log('✅ Slug check completed:', {
      slug,
      exists,
      excludeId
    });

    return NextResponse.json({
      success,
      message: exists ? 'Slug is already taken' : 'Slug is available'
    });

  } catch (error) {
    console.error('❌ Error checking slug:', error);
    return NextResponse.json(
      {
        success,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}