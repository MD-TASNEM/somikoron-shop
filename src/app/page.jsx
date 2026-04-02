"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { showSuccessToast } from "@/lib/toast";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/layout/Hero";
import Carousel from "@/components/ui/Carousel";
import OfferZone from "@/components/ui/OfferZone";
import Footer from "@/components/layout/Footer";
import FeaturesGrid from "@/components/ui/FeaturesGrid";

const products = [
  {
    id: 1,
    name: "Customized Photo Frame",
    price: 12.99,
    category: "photo-frames",
    badge: "featured",
    image:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 5,
    description: "Beautiful custom photo frame perfect for your memories.",
  },
  {
    id: 2,
    name: "Elegant Nikah Nama Cover",
    price: 25.99,
    category: "nikah-nama",
    badge: "best-seller",
    image:
      "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 5,
    description: "Premium Nikah Nama cover for your special day.",
  },
  {
    id: 3,
    name: "Personalized Coffee Mug",
    price: 8.99,
    category: "cups",
    badge: "featured",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4,
    description: "Custom mug for your morning coffee.",
  },
  {
    id: 4,
    name: "Ceramic Dinner Plate Set",
    price: 35.5,
    category: "plates",
    badge: "new",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4,
    description: "Beautiful ceramic plates for your dining table.",
  },
  {
    id: 5,
    name: "Premium File Folder",
    price: 6.99,
    category: "files",
    badge: "best-seller",
    image:
      "https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4,
    description: "High-quality file folders for office use.",
  },
  {
    id: 6,
    name: "Custom Engraved Pen",
    price: 4.99,
    category: "pens",
    badge: "best-seller",
    image:
      "https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 5,
    description: "Elegant pen with custom engraving.",
  },
  {
    id: 7,
    name: "Engineering Scale Set",
    price: 14.99,
    category: "scales",
    badge: "featured",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4,
    description: "Professional engineering scale set.",
  },
  {
    id: 8,
    name: "Wooden Photo Frame",
    price: 18.99,
    category: "photo-frames",
    badge: "best-seller",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e129d6c9c07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 5,
    description: "Premium wooden photo frame.",
  },
];

export default function Home() {
  const { addItem } = useCartStore();

  const handleAddToCart = (product) => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.name.toLowerCase().replace(/\s+/g, "-"),
      price: product.price,
      image: product.image,
      originalPrice: product.originalPrice,
      category: product.category,
      badge: product.badge,
    });
    showSuccessToast(`${product.name} added to cart!`);
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <Carousel />
        <OfferZone />

        {/* Featured Products */}
        <section className="py-16 px-4 bg-light-bg" id="products">
          <div className="container mx-auto max-w-6xl">
            <h2 className="section-title">Our Products</h2>
            <p className="section-subtitle">
              High-quality customized products for all your needs
            </p>

            <div className="categories">
              <button className="category-btn active">
                <i className="fas fa-th-large"></i>
                All Products
              </button>
              <button className="category-btn">
                <i className="fas fa-star"></i>
                Featured
              </button>
              <button className="category-btn">
                <i className="fas fa-crown"></i>
                Best Seller
              </button>
              <button className="category-btn">
                <i className="fas fa-camera"></i>
                Photo Frames
              </button>
              <button className="category-btn">
                <i className="fas fa-heart"></i>
                Nikah Nama
              </button>
              <button className="category-btn">
                <i className="fas fa-mug-hot"></i>
                Cups
              </button>
              <button className="category-btn">
                <i className="fas fa-utensils"></i>
                Plates
              </button>
              <button className="category-btn">
                <i className="fas fa-folder"></i>
                Files
              </button>
              <button className="category-btn">
                <i className="fas fa-pen"></i>
                Pens
              </button>
              <button className="category-btn">
                <i className="fas fa-ruler"></i>
                Scales
              </button>
            </div>

            <div className="products-container">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  {product.badge && (
                    <div className={`product-badge ${product.badge}`}>
                      {product.badge === "best-seller"
                        ? "Best Seller"
                        : product.badge === "featured"
                          ? "Featured"
                          : "New"}
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img"
                  />
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-rating">
                      {"★".repeat(Math.floor(product.rating))}
                      {"☆".repeat(5 - Math.floor(product.rating))}
                      <span
                        style={{
                          color: "#7f8c8d",
                          fontSize: "0.85rem",
                          marginLeft: "5px",
                        }}
                      >
                        ({product.rating}.0)
                      </span>
                    </div>
                    <div className="product-price">
                      ৳{product.price.toFixed(2)}
                      {product.originalPrice && (
                        <span className="old-price">
                          ৳{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        color: "#7f8c8d",
                        fontSize: "0.9rem",
                        marginBottom: "15px",
                        flexGrow: 1,
                      }}
                    >
                      {product.description}
                    </p>
                    <div className="product-actions">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn btn-secondary"
                      >
                        <i className="fas fa-cart-plus"></i>
                        Add to Cart
                      </button>
                      <Link
                        href={`/products/${product.id}`}
                        className="btn btn-outline"
                      >
                        <i className="fas fa-eye"></i>
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FeaturesGrid />

        <section className="py-16 px-4 bg-secondary text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              📞 যোগাযোগ করুন
            </h2>
            <p className="text-xl mb-10 text-white/80">
              যেকোনো প্রশ্ন বা অর্ডারের জন্য আমাদের সাথে যোগাযোগ করুন!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div>
                <div className="text-4xl mb-3">📱</div>
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <a
                  href="https://wa.me/8801996570203"
                  className="text-white/80 hover:text-white underline transition-colors"
                >
                  +880 1996-570203
                </a>
              </div>
              <div>
                <div className="text-4xl mb-3">📞</div>
                <h3 className="font-semibold mb-2">হটলাইন</h3>
                <a
                  href="tel:+8801996570203"
                  className="text-white/80 hover:text-white underline transition-colors"
                >
                  01996-570203
                </a>
              </div>
              <div>
                <div className="text-4xl mb-3">📍</div>
                <h3 className="font-semibold mb-2">ঠিকানা</h3>
                <p className="text-white/80 text-sm">
                  ইসলামী বিশ্ববিদ্যালয়, বাংলাদেশ
                  <br />
                  ঝিনাইদহ, কুষ্টিয়া
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/8801996570203"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              💬 WhatsApp-এ অর্ডার করুন
            </a>
          </div>
        </section>
      </main>
      <Footer />

      <a
        href="https://wa.me/8801996570203"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
