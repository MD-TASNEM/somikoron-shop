# SEO Components for সমীকরণ শপ

A comprehensive SEO solution for the Bangladesh e-commerce application that handles all metadata requirements including Open Graph tags, Twitter cards, structured data, and more.

## 📁 Files Structure

```
src/components/seo/
├── SEOHead.tsx          # Main SEO component with full control
├── SEOWrapper.tsx       # Wrapper component for easy usage
├── examples.tsx         # Usage examples
└── README.md           # This documentation
```

## 🚀 Quick Start

### Basic Usage

```tsx
import SEOWrapper from '@/components/seo/SEOWrapper';

export default function HomePage() {
  return (
    <SEOWrapper
      title="Welcome to সমীকরণ শপ"
      description="Best online shopping in Bangladesh"
      keywords={['ecommerce', 'bangladesh', 'shopping']}
    >
      <div>
        <h1>Welcome to সমীকরণ শপ</h1>
        {/* Your content */}
      </div>
    </SEOWrapper>
  );
}
```

### Product Pages

```tsx
import { ProductSEOWrapper } from '@/components/seo/SEOWrapper';

export default function ProductPage({ product }) {
  return (
    <ProductSEOWrapper product={product}>
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>Price: ৳{product.price}</p>
      </div>
    </ProductSEOWrapper>
  );
}
```

## 🎯 Features

### ✅ Complete Meta Tags
- Title with automatic site name suffix
- Description with fallback
- Keywords with automatic defaults
- Canonical URL generation
- Robots meta (index/noindex, follow/nofollow)

### ✅ Social Media Tags
- **Open Graph**: Facebook, LinkedIn, etc.
- **Twitter Cards**: Optimized for Twitter
- Rich media with proper image dimensions
- Site name and locale

### ✅ Structured Data (JSON-LD)
- Product schema for e-commerce
- Article schema for blog posts
- Organization schema
- Website schema with search action
- CollectionPage schema for categories

### ✅ Advanced Features
- Hreflang tags for multilingual support
- Geo-targeting for Bangladesh
- Favicon and manifest
- Theme colors
- Performance optimized

## 🔧 API Reference

### SEOHead Component

The main component with full control over all SEO settings.

```tsx
interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any>;
  alternates?: Record<string, string>;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
}
```

### SEOWrapper Component

A wrapper component that automatically handles canonical URLs and provides convenience methods.

```tsx
interface SEOWrapperProps {
  children: ReactNode;
  type?: 'default' | 'product' | 'blog' | 'category';
  data?: any;
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}
```

### Convenience Components

#### ProductSEOWrapper
Automatically generates SEO from product data:

```tsx
<ProductSEOWrapper product={productData}>
  {/* Product page content */}
</ProductSEOWrapper>
```

#### BlogSEOWrapper
Automatically generates SEO from blog data:

```tsx
<BlogSEOWrapper blog={blogData}>
  {/* Blog article content */}
</BlogSEOWrapper>
```

#### CategorySEOWrapper
Automatically generates SEO from category data:

```tsx
<CategorySEOWrapper category={categoryData}>
  {/* Category page content */}
</CategorySEOWrapper>
```

## 📊 Data Structures

### Product Data Interface

```tsx
interface ProductData {
  name: string;
  nameBn?: string;
  slug: string;
  description: string;
  descriptionBn?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryBn?: string;
  brand?: string;
  image: string;
  images?: string[];
  sku?: string;
  stock: number;
  rating?: number;
  reviews?: number;
  tags?: string[];
  features?: string[];
  specifications?: Record<string, any>;
}
```

### Blog Data Interface

```tsx
interface BlogData {
  title: string;
  titleBn?: string;
  slug: string;
  description: string;
  descriptionBn?: string;
  image: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags?: string[];
  readTime?: number;
}
```

## 🌍 Bangladesh-Specific Features

### Localization Support
- Bengali language support (`nameBn`, `descriptionBn`)
- Bangladesh locale in Open Graph tags
- BDT currency support
- Geo-targeting for Bangladesh

### Cultural Considerations
- Site name in Bengali (সমীকরণ শপ)
- Local currency formatting (৳)
- Bangladesh-specific keywords
- Local business hours and contact info

## 📱 Social Media Optimization

### Open Graph Tags
```html
<meta property="og:title" content="Product Name | সমীকরণ শপ" />
<meta property="og:description" content="Product description" />
<meta property="og:type" content="product" />
<meta property="og:url" content="https://somikoron-shop.vercel.app/product/slug" />
<meta property="og:image" content="https://somikoron-shop.vercel.app/image.jpg" />
<meta property="og:site_name" content="সমীকরণ শপ" />
<meta property="og:locale" content="en_BD" />
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Product Name | সমীকরণ শপ" />
<meta name="twitter:description" content="Product description" />
<meta name="twitter:image" content="https://somikoron-shop.vercel.app/image.jpg" />
<meta name="twitter:site" content="@somikoron_shop" />
```

## 🔍 Structured Data Examples

### Product Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": ["image1.jpg", "image2.jpg"],
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "price": "999.99",
    "priceCurrency": "BDT",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "সমীকরণ শপ"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "150"
  }
}
```

### Blog Posting Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article Title",
  "description": "Article description",
  "image": "article-image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "সমীকরণ শপ"
  },
  "datePublished": "2024-01-01T00:00:00Z",
  "dateModified": "2024-01-15T00:00:00Z",
  "articleSection": "Technology"
}
```

## 🎨 Best Practices

### 1. Title Optimization
- Keep titles under 60 characters
- Include primary keywords
- Use brand name at the end
- Make titles compelling and clickable

### 2. Description Optimization
- Keep descriptions under 160 characters
- Include target keywords naturally
- Make descriptions compelling
- Use action-oriented language

### 3. Image Optimization
- Use high-quality images (1200x630 for OG)
- Include alt text
- Use WebP format for better performance
- Ensure images load quickly

### 4. Structured Data
- Use specific schema types
- Include all required fields
- Validate with Google's Rich Results Test
- Keep data accurate and up-to-date

## 📈 Performance Considerations

### 1. Bundle Size
- Components are tree-shakeable
- Only used code is included
- Minimal runtime overhead

### 2. Rendering
- Server-side compatible
- Client-side hydration safe
- No layout shifts

### 3. Caching
- Static meta tags cache well
- Dynamic tags have cache headers
- CDN-friendly structure

## 🛠️ Advanced Usage

### Custom Structured Data
```tsx
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'About Us',
  description: 'About our company',
  mainEntity: {
    '@type': 'Organization',
    name: 'সমীকরণ শপ',
    url: 'https://somikoron-shop.vercel.app',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+8801234567890',
      contactType: 'customer service'
    }
  }
};

<SEOHead structuredData={structuredData} />
```

### Multilingual Support
```tsx
const alternates = {
  'en': 'https://somikoron-shop.vercel.app/en/product/slug',
  'bn': 'https://somikoron-shop.vercel.app/bn/product/slug'
};

<SEOHead alternates={alternates} />
```

### Noindex/Nofollow
```tsx
<SEOHead 
  noindex={true} 
  nofollow={true}
  title="Private Page"
/>
```

## 🧪 Testing

### 1. Google Rich Results Test
Test your structured data: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)

### 2. Facebook Debugger
Test Open Graph tags: [https://developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug)

### 3. Twitter Card Validator
Test Twitter cards: [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)

### 4. SEO Analysis
Use tools like:
- Google Search Console
- Ahrefs
- SEMrush
- Screaming Frog

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SITE_URL=https://somikoron-shop.vercel.app
```

### Default Settings
The components use sensible defaults for Bangladesh e-commerce:
- Site name: "সমীকরণ শপ"
- Locale: "en_BD"
- Currency: "BDT"
- Geo: Bangladesh

## 🐛 Troubleshooting

### Common Issues

1. **Meta tags not showing**
   - Ensure component is used in `_app.tsx` or page components
   - Check for duplicate Head components
   - Verify server-side rendering

2. **Structured data not validating**
   - Check for required fields
   - Ensure proper JSON syntax
   - Validate with Google's tool

3. **Social media images not loading**
   - Use absolute URLs
   - Ensure images are accessible
   - Check image dimensions (1200x630 for OG)

4. **Canonical URLs incorrect**
   - Set `NEXT_PUBLIC_SITE_URL` environment variable
   - Check router.asPath value
   - Ensure URL format is correct

## 📚 Additional Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Schema.org Documentation](https://schema.org/)
- [Next.js SEO Best Practices](https://nextjs.org/docs/pages/building-your-application/optimizing/seo)

## 🤝 Contributing

When contributing to SEO components:
1. Follow existing code patterns
2. Add TypeScript types
3. Include examples in documentation
4. Test with SEO tools
5. Consider Bangladesh-specific requirements

## 📄 License

This SEO component library is part of the সমীকরণ শপ e-commerce platform.
