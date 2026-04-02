'use client';

import Head from 'next/head';
import { useMemo } from 'react';







export default function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  nofollow = false,
  structuredData,
  alternates = {},
  author,
  publishedTime,
  modifiedTime,
  articleSection,
  price,
  currency = 'BDT',
  availability,
  brand,
  sku,
  rating,
  reviewCount
}: SEOHeadProps) {
  // Default site metadata
  const siteName = 'সমীকরণ শপ';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://somikoron-shop.vercel.app';
  const defaultDescription = 'সমীকরণ শপ - Your trusted online shopping destination in Bangladesh. Quality products, fast delivery, and great prices.';
  const defaultKeywords = ['online shopping', 'bangladesh', 'ecommerce', 'somikoron shop', 'সমীকরণ শপ'];

  // Generate full title
  const fullTitle = useMemo(() => {
    if (!title) return siteName;
    return title.includes(siteName) ? title : `${title} | ${siteName}`;
  }, [title, siteName]);

  // Generate description
  const finalDescription = useMemo(() => {
    if (description) return description;
    return defaultDescription;
  }, [description, defaultDescription]);

  // Generate keywords
  const finalKeywords = useMemo(() => {
    const allKeywords = [...defaultKeywords, ...keywords];
    return Array.from(new Set(allKeywords)).join(', ');
  }, [defaultKeywords, keywords]);

  // Generate canonical URL
  const canonicalUrl = useMemo(() => {
    if (canonical) {
      return canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`;
    }
    return siteUrl;
  }, [canonical, siteUrl]);

  // Generate OG image URL
  const ogImageUrl = useMemo(() => {
    if (ogImage) {
      return ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
    }
    return `${siteUrl}/images/og-default.jpg`;
  }, [ogImage, siteUrl]);

  // Generate robots meta
  const robotsMeta = useMemo(() => {
    const directives = [];
    if (noindex) directives.push('noindex');
    if (nofollow) directives.push('nofollow');
    if (directives.length === 0) directives.push('index', 'follow');
    return directives.join(', ');
  }, [noindex, nofollow]);

  // Generate structured data
  const structuredDataJSON = useMemo(() => {
    if (!structuredData) return null;

    if (ogType === 'product') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        brand: brand ? { '@type': 'Brand', name,
        offers: price ? {
          '@type': 'Offer',
          price,
          availability: `https://schema.org/${availability || 'InStock'}`,
          seller: { '@type': 'Organization', name,
        aggregateRating: rating && reviewCount ? {
          '@type': 'AggregateRating',
          ratingValue,
          worstRating: 1
        } : undefined
      };
    }

    if (ogType === 'article') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline,
        author: author ? { '@type': 'Person', name,
        publisher: { '@type': 'Organization', name,
        articleSection: articleSection
      };
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }, [structuredData, ogType, title, finalDescription, ogImageUrl, brand, sku, price, currency, availability, rating, reviewCount, author, publishedTime, modifiedTime, articleSection, siteName, siteUrl]);

  return (
    
      {/* Basic Meta Tags */}
      {fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={robotsMeta} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Viewport and Character Set */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || siteName} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_BD" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={title || siteName} />
      <meta name="twitter:site" content="@somikoron_shop" />
      <meta name="twitter:creator" content="@somikoron_shop" />

      {/* Additional Meta Tags */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="BD" />
      <meta name="geo.placename" content="Bangladesh" />
      <meta name="geo.position" content="23.6850;90.3563" />
      <meta name="ICBM" content="23.6850, 90.3563" />

      {/* Hreflang Tags */}
      {Object.entries(alternates).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />

      {/* Theme Color */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />

      {/* Structured Data */}
      {structuredDataJSON && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataJSON)
          }}
        />
      )}
    </Head>
  );
}

// Utility functions for generating SEO from data
export function getProductSEO(product): Omit<SEOHeadProps, 'canonical'> {
  const title = product.nameBn || product.name;
  const description = product.descriptionBn || product.description;
  const keywords = [
    ...(product.tags || []),
    product.category,
    product.categoryBn,
    product.brand,
    'online shopping',
    'bangladesh',
    'ecommerce',
    'সমীকরণ শপ'
  ].filter(Boolean);

  const availability = product.stock > 0
    ? 'in stock'
    : product.stock === 0
    ? 'out of stock'
    : 'preorder';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    brand: product.brand ? { '@type': 'Brand', name,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'BDT',
      availability: `https://schema.org/${availability}`,
      seller: { '@type': 'Organization', name: 'সমীকরণ শপ' },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    aggregateRating: product.rating && product.reviews ? {
      '@type': 'AggregateRating',
      ratingValue,
    additionalProperty: product.specifications ? Object.entries(product.specifications).map(([key, value]) => ({
      '@type': 'PropertyValue',
      name)) : undefined
  };

  return {
    title,
    description,
    keywords,
    ogImage,
    ogType: 'product''BDT',
    availability,
    brand,
    structuredData
  };
}

// Utility function for generating SEO from blog/article data
export function getBlogSEO(blog): Omit<SEOHeadProps, 'canonical'> {
  const title = blog.titleBn || blog.title;
  const description = blog.descriptionBn || blog.description;
  const keywords = [
    ...(blog.tags || []),
    blog.category,
    'blog',
    'article',
    'news',
    'সমীকরণ শপ'
  ].filter(Boolean);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    author: { '@type': 'Person', name,
    publisher: { '@type': 'Organization', name: 'সমীকরণ শপ' },
    datePublished,
    keywords: blog.tags?.join(', '),
    wordCount: blog.readTime ? blog.readTime * 200 : undefined
  };

  return {
    title,
    description,
    keywords,
    ogImage,
    ogType: 'article';
}

// Utility function for generating SEO for category pages
export function getCategorySEO(
  categoryName): Omit<SEOHeadProps, 'canonical'> {
  const title = `${categoryNameBn || categoryName} | সমীকরণ শপ`;
  const keywords = [
    categoryName,
    categoryNameBn,
    'category',
    'products',
    'online shopping',
    'bangladesh',
    'ecommerce',
    'সমীকরণ শপ'
  ].filter(Boolean);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description: description || `Browse ${categoryName} products at সমীকরণ শপ`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: 0,
      itemListElement: []
    }
  };

  return {
    title,
    description: description || `Shop ${categoryName} products at সমীকরণ শপ. Quality products with fast delivery across Bangladesh.`,
    keywords,
    ogImage: image || '/images/category-default.jpg',
    ogType: 'website';
}

// Default SEO component for general pages
export function DefaultSEO({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  noindex = false
}: Pick<SEOHeadProps, 'title' | 'description' | 'keywords' | 'canonical' | 'ogImage' | 'noindex'>) {
  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonical={canonical}
      ogImage={ogImage}
      noindex={noindex}
      ogType="website"
    />
  );
}
