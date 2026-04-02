'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import SEOHead, { getProductSEO, getBlogSEO, getCategorySEO } from './SEOHead';



export default function SEOWrapper({
  children,
  type = 'default',
  data,
  ...seoProps
}: SEOWrapperProps) {
  const router = useRouter();

  // Generate canonical URL from current path
  const canonical = seoProps.canonical || `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`;

  // Generate SEO props based on type and data
  const getSEOProps = () => {
    switch (type) {
      case 'product':
        if (!data) return { ...seoProps, canonical };
        return {
          ...seoProps,
          ...getProductSEO(data),
          canonical
        };

      case 'blog':
        if (!data) return { ...seoProps, canonical };
        return {
          ...seoProps,
          ...getBlogSEO(data),
          canonical
        };

      case 'category':
        if (!data) return { ...seoProps, canonical };
        return {
          ...seoProps,
          ...getCategorySEO(data.name, data.nameBn, data.description, data.image),
          canonical
        };

      default, canonical };
    }
  };

  const finalSEOProps = getSEOProps();

  return (
    <>
      <SEOHead {...finalSEOProps} />
      {children}
    </>
  );
}

// Convenience components for different page types
export function ProductSEOWrapper({
  children,
  product,
  ...props
}: {
  children: ReactNode;
  product: any;
} & Omit<SEOWrapperProps, 'title' | 'description' | 'keywords' | 'ogImage' | 'ogType' | 'structuredData'>) {
  return (
    <SEOWrapper
      type="product"
      data={product}
      {...props}
    >
      {children}
    </SEOWrapper>
  );
}

export function BlogSEOWrapper({
  children,
  blog,
  ...props
}: {
  children: ReactNode;
  blog: any;
} & Omit<SEOWrapperProps, 'title' | 'description' | 'keywords' | 'ogType' | 'structuredData'>) {
  return (
    <SEOWrapper
      type="blog"
      data={blog}
      {...props}
    >
      {children}
    </SEOWrapper>
  );
}

export function CategorySEOWrapper({
  children,
  category,
  ...props
}: {
  children: ReactNode;
  category: any;
} & Omit<SEOWrapperProps, 'title' | 'description' | 'keywords' | 'ogType' | 'structuredData'>) {
  return (
    <SEOWrapper
      type="category"
      data={category}
      {...props}
    >
      {children}
    </SEOWrapper>
  );
}
