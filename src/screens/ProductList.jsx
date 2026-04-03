import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { CATEGORIES } from "../types";
import { ProductCard } from "../components/ProductCard";

export const ProductList = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = CATEGORIES.find((c) => c.id === categoryId) ||
    CATEGORIES.find(
      (c) => c.name.toLowerCase() === categoryId?.toLowerCase(),
    ) || { id: "all", name: "All Collection", nameBn: "সব কালেকশন" };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url =
          categoryId === "all" || !categoryId
            ? "/api/products"
            : `/api/products?category=${categoryId}`;
        const response = await axios.get(url);
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.error("Expected array of products, got:", response.data);
          setProducts([]);
        }
      } catch (error) {
        if (!error.isWarmup) {
          console.error("Error fetching products:", error);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-surface-container-low py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-primary uppercase tracking-[0.4em]"
          >
            Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl"
          >
            {category.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bengali text-2xl text-secondary/60"
          >
            {category.nameBn}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Bar */}
        <div className="mb-12 pb-8 border-b border-secondary/5">
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  categoryId === cat.id ||
                  (categoryId === "all" && cat.id === "all")
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-secondary/60 hover:bg-secondary/5"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <p className="text-xl text-secondary/40">
              No products found in this category.
            </p>
            <Link to="/category/all" className="text-primary font-bold">
              View all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
