"use client";

import { Truck, Shield, RefreshCcw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on all orders over ৳500",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure payment processing",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    description: "Easy returns within 7 days",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer service",
    gradient: "from-orange-500 to-red-500",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="features-grid">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.title} className="feature">
                <IconComponent className="feature-icon" />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
