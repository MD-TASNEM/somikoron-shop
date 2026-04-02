import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

// SEO Configuration
const SEO_CONFIG = {
  siteName: 'সমীকরণ শপ',
  siteUrl: 'https://somikoron-shop.com',
  defaultTitle: 'সমীকরণ শপ - Custom T-Shirts, Mugs & Merchandise | Islamic University Bangladesh',
  defaultDescription: 'Shop custom printed T-shirts, mugs, trophies, flags and more at সমীকরণ শপ. Quality merchandise with fast delivery across Bangladesh.',
  defaultImage: 'https://somikoron-shop.com/og-image.jpg',
  twitter: '@somikoronshop',
  facebook: 'https://www.facebook.com/somikoronshop',
  address: {
    streetAddress: 'Islamic University, Bangladesh Main Gate',
    addressLocality: 'Jhenaidah',
    addressRegion: 'Kushtia',
    postalCode: '7000',
    addressCountry: 'BD'
  },
  telephone: '+8801996570203',
  geo: {
    latitude: '23.5432',
    longitude: '89.2345'
  }
};

const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  keywords,
  product,
  article,
  noindex = false,
  structuredData
}) => {
  const fullTitle = title ? `${title} | ${SEO_CONFIG.siteName}` : SEO_CONFIG.defaultTitle;
  const fullDescription = description || SEO_CONFIG.defaultDescription;
  const fullImage = image || SEO_CONFIG.defaultImage;
  const fullUrl = url ? `${SEO_CONFIG.siteUrl}${url}` : SEO_CONFIG.siteUrl;

  // Generate structured data
  const generateStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'product' ? 'Product' : 'WebPage',
      "name": title || SEO_CONFIG.siteName,
      "description": fullDescription,
      "url": fullUrl,
      "image": fullImage
    };

    if (type === 'product' && product) {
      return {
        ...baseData,
        "@type": "Product",
        "brand": {
          "@type": "Brand",
          "name": SEO_CONFIG.siteName
        },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "BDT",
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Store",
            "name": SEO_CONFIG.siteName,
            "url": SEO_CONFIG.siteUrl,
            "address": SEO_CONFIG.address,
            "telephone": SEO_CONFIG.telephone,
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": SEO_CONFIG.geo.latitude,
              "longitude": SEO_CONFIG.geo.longitude
            }
          }
        },
        "aggregateRating": product.rating ? {
          "@type": "AggregateRating",
          "ratingValue": product.rating.value,
          "reviewCount": product.rating.count
        } : undefined
      };
    }

    if (type === 'article' && article) {
      return {
        ...baseData,
        "@type": "Article",
        "headline": title,
        "image": fullImage,
        "datePublished": article.publishedAt,
        "dateModified": article.modifiedAt,
        "author": {
          "@type": "Organization",
          "name": SEO_CONFIG.siteName
        },
        "publisher": {
          "@type": "Organization",
          "name": SEO_CONFIG.siteName,
          "logo": {
            "@type": "ImageObject",
            "url": `${SEO_CONFIG.siteUrl}/logo.png`
          }
        }
      };
    }

    return baseData;
  };

  const jsonLd = structuredData || generateStructuredData();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={fullUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SEO_CONFIG.siteName} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullImage} />
      <meta property="twitter:creator" content={SEO_CONFIG.twitter} />
      <meta property="twitter:site" content={SEO_CONFIG.twitter} />
      
      {/* Additional Meta */}
      <meta name="author" content={SEO_CONFIG.siteName} />
      <meta name="language" content="English" />
      <meta name="geo.region" content="BD" />
      <meta name="geo.placename" content={`${SEO_CONFIG.address.addressLocality}, ${SEO_CONFIG.address.addressRegion}, Bangladesh`} />
      <meta name="geo.position" content={`${SEO_CONFIG.geo.latitude};${SEO_CONFIG.geo.longitude}`} />
      <meta name="ICBM" content={`${SEO_CONFIG.geo.latitude}, ${SEO_CONFIG.geo.longitude}`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      
      {/* Additional structured data for breadcrumbs if provided */}
      {article?.breadcrumbs && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": article.breadcrumbs.map((crumb, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": crumb.name,
              "item": `${SEO_CONFIG.siteUrl}${crumb.url}`
            }))
          })}
        </script>
      )}
    </Helmet>
  );
};

// Product-specific SEO component
export const ProductSEO = ({ product }) => {
  return (
    <SEO
      title={product.name}
      description={product.description}
      image={product.image}
      url={`/product/${product.id}`}
      type="product"
      keywords={[
        product.name,
        product.category,
        'custom t-shirt',
        'printed mug',
        'trophy',
        'islamic university',
        'bangladesh',
        'somikoron shop'
      ]}
      product={{
        price: product.price,
        inStock: product.inStock !== false,
        rating: product.rating
      }}
    />
  );
};

// Category-specific SEO component
export const CategorySEO = ({ category }) => {
  return (
    <SEO
      title={`${category.name} - Custom Merchandise | ${SEO_CONFIG.siteName}`}
      description={`Shop ${category.name.toLowerCase()} at ${SEO_CONFIG.siteName}. Quality ${category.name.toLowerCase()} with custom printing options. Fast delivery across Bangladesh.`}
      keywords={[
        category.name,
        `${category.name} bangladesh`,
        `custom ${category.name.toLowerCase()}`,
        'printed merchandise',
        'islamic university',
        'somikoron shop'
      ]}
      url={`/category/${category.id}`}
      type="website"
    />
  );
};

// Article/Blog SEO component
export const ArticleSEO = ({ article }) => {
  return (
    <SEO
      title={article.title}
      description={article.excerpt}
      image={article.featuredImage}
      url={`/blog/${article.slug}`}
      type="article"
      keywords={article.tags}
      article={{
        publishedAt: article.publishedAt,
        modifiedAt: article.modifiedAt,
        breadcrumbs: article.breadcrumbs
      }}
    />
  );
};

export default SEO;
