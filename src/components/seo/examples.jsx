// Examples of using SEO components in different pages

import SEOHead, { DefaultSEO } from './SEOHead';
import SEOWrapper, { ProductSEOWrapper, BlogSEOWrapper, CategorySEOWrapper } from './SEOWrapper';

// Example 1: Basic page with custom SEO
export function HomePage() {
  return (
    <SEOWrapper
      title="সমীকরণ শপ - Best Online Shopping in Bangladesh"
      description="Shop quality products at সমীকরণ শপ. Fast delivery across Bangladesh. Electronics, clothing, home appliances and more."
      keywords={['online shopping', 'bangladesh', 'ecommerce', 'সমীকরণ শপ']}
      ogImage="/images/homepage-og.jpg"
    >
      {/* Page content */}
      
        Welcome to সমীকরণ শপ</h1>
        {/* Your page content here */}
      </div>
    </SEOWrapper>
  );
}

// Example 2: Product page with dynamic SEO
export function ProductPage({ product }: { product) {
  return (
    
      {/* Product page content */}
      
        {product.name}</h1>
        {product.description}</p>
        Price: ৳{product.price}</p>
        {/* Product details, images, etc. */}
      </div>
    </ProductSEOWrapper>
  );
}

// Example 3: Category page with SEO
export function CategoryPage({ category }: { category) {
  return (
    
      {/* Category page content */}
      
        {category.name}</h1>
        {category.description}</p>
        {/* Category products, filters, etc. */}
      </div>
    </CategorySEOWrapper>
  );
}

// Example 4: Blog article with SEO
export function BlogPage({ article }: { article) {
  return (
    
      {/* Blog article content */}
      
        {article.title}</h1>
        By {article.author}</p>
        {article.content}</article>
      </div>
    </BlogSEOWrapper>
  );
}

// Example 5: Advanced SEO with custom structured data
export function CustomPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'About Us',
    description: 'Learn about সমীকরণ শপ mission and values',
    url: 'https://somikoron-shop.vercel.app/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'সমীকরণ শপ',
      url: 'https://somikoron-shop.vercel.app',
      logo: 'https://somikoron-shop.vercel.app/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+8801234567890',
        contactType: 'customer service'
      }
    }
  };

  return (
    <SEOWrapper
      title="About Us | সমীকরণ শপ"
      description="Learn about our mission to provide quality products and excellent service to customers across Bangladesh."
      keywords={['about', 'company', 'mission', 'সমীকরণ শপ']}
      structuredData={structuredData}
    >
      {/* About page content */}
      
        About সমীকরণ শপ</h1>
        {/* About content */}
      </div>
    </SEOWrapper>
  );
}

// Example 6: Search results page with dynamic SEO
export function SearchResultsPage({ query, results }: { query: string; results) {
  return (
    <SEOWrapper
      title={`Search Results for "${query}" | সমীকরণ শপ`}
      description={`Find ${results.length} products matching "${query}" at সমীকরণ শপ. Quality products with fast delivery.`}
      keywords={['search', 'results', query, 'products']}
      noindex={true} // Don't index search result pages
    >
      {/* Search results content */}
      
        Search Results for "{query}"</h1>
        Found {results.length} products</p>
        {/* Search results list */}
      </div>
    </SEOWrapper>
  );
}

// Example 7: Checkout page with noindex
export function CheckoutPage() {
  return (
    <SEOWrapper
      title="Checkout | সমীকরণ শপ"
      description="Complete your purchase securely at সমীকরণ শপ. Multiple payment options available."
      noindex={true}
      nofollow={true}
    >
      {/* Checkout content */}
      
        Checkout</h1>
        {/* Checkout form */}
      </div>
    </SEOWrapper>
  );
}

// Example 8: Using SEOHead directly for maximum control
export function CustomHeadPage() {
  const canonical = 'https://somikoron-shop.vercel.app/custom';
  const alternates = {
    'en': 'https://somikoron-shop.vercel.app/en/custom',
    'bn': 'https://somikoron-shop.vercel.app/bn/custom'
  };

  return (
    <>
      <SEOHead
        title="Custom Page | সমীকরণ শপ"
        description="A custom page with advanced SEO configuration"
        keywords={['custom', 'advanced', 'seo']}
        canonical={canonical}
        ogImage="/images/custom-og.jpg"
        ogType="website"
        alternates={alternates}
        author="সমীকরণ শপ Team"
        publishedTime="2024-01-01T00:00:00Z"
        modifiedTime="2024-01-15T00:00:00Z"
        articleSection="Company"
      />
      
      {/* Page content */}
      
        Custom Page</h1>
        This page uses SEOHead directly for maximum control.</p>
      </div>
    </>
  );
}

// Example 9: Product page with all SEO features
export function AdvancedProductPage({ product }: { product) {
  const alternates = {
    'en': `https://somikoron-shop.vercel.app/en/product/${product.slug}`,
    'bn': `https://somikoron-shop.vercel.app/bn/product/${product.slug}`
  };

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.description}
        keywords={[...product.tags, product.category, product.brand]}
        canonical={`https://somikoron-shop.vercel.app/product/${product.slug}`}
        ogImage={product.image}
        ogType="product"
        alternates={alternates}
        price={product.price}
        currency="BDT"
        availability={product.stock > 0 ? 'in stock' : 'out of stock'}
        brand={product.brand}
        sku={product.sku}
        rating={product.rating}
        reviewCount={product.reviews}
      />
      
      {/* Product page content */}
      
        {product.name}</h1>
        {product.description}</p>
        Price: ৳{product.price}</p>
        {/* Full product details */}
      </div>
    </>
  );
}

// Example 10: Error page with SEO
export function NotFoundPage() {
  return (
    <SEOWrapper
      title="Page Not Found | সমীকরণ শপ"
      description="The page you are looking for could not be found. Browse our products or search for what you need."
      noindex={true}
    >
      {/* 404 page content */}
      
        Page Not Found</h1>
        Sorry, the page you are looking for doesn't exist.</p>
      </div>
    </SEOWrapper>
  );
}
