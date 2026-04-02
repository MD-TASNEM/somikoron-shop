"use client";

import Link from "next/link";
import {
  Home,
  Package,
  Tag,
  Info,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";

const quickLinks = [
  { href: "/#home", label: "Home", icon: Home },
  { href: "/#products", label: "Products", icon: Package },
  { href: "/#offers", label: "Special Offers", icon: Tag },
  { href: "/#features", label: "Why Choose Us", icon: Info },
  { href: "/#contact", label: "Contact Us", icon: Phone },
];

const socialLinks = [
  {
    name: "Facebook",
    icon: "fab fa-facebook-f",
    href: "https://facebook.com/somikoronshop",
  },
  {
    name: "Instagram",
    icon: "fab fa-instagram",
    href: "https://instagram.com/somikoronshop",
  },
  {
    name: "YouTube",
    icon: "fab fa-youtube",
    href: "https://youtube.com/somikoronshop",
  },
  {
    name: "TikTok",
    icon: "fab fa-tiktok",
    href: "https://tiktok.com/@somikoronshop",
  },
];

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      alert(`Thank you for subscribing with email: ${email}`);
      e.target.reset();
    }
  };

  const handleNavClick = (e, href) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const sectionId = href.substring(2);
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3>সমীকরণ শপ</h3>
            <p>
              বিশ্বস্ত ঠিকানায় আপনাকে স্বাগতম। &quot;সমীকরণ শপ&quot; এটি একটি
              অনলাইন ব্যবসায়ী প্রতিষ্ঠান। আমাদের পন্য সমুহঃ1. যে কোন কাস্টমাইজ
              টি-শার্ট, ক্যাপ, মগ, প্লেট, কলম সহ যাবতীয় প্রিন্টের পন্য সামগ্রী।
              ২. ক্রেষ্ট ৩. ট্রফি 🏆 ৪. পতাকা ৫. হালখাতার কার্ড
            </p>
            <div className="social-icons">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                    >
                      <IconComponent className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="footer-column">
            <h3>Contact Info</h3>
            <ul className="footer-links">
              <li>
                <a
                  href="https://maps.google.com/?q=Islamic+university+Bangladesh+Main+gate+Jhenaidah+kushtia"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-4 w-4" />
                  Islamic university, Bangladesh Main gate, Jhenaidah, kushtia
                </a>
              </li>
              <li>
                <a href="tel:+8801996570203">
                  <Phone className="h-4 w-4" />
                  01996-570203
                </a>
              </li>
              <li>
                <a href="mailto:muttasimbillah.9@gmail.com">
                  <Mail className="h-4 w-4" />
                  muttasimbillah.9@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8801996570203"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  +880 1996-570203
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Newsletter</h3>
            <p>Subscribe to get updates on new arrivals and special offers.</p>
            <form className="newsletter" onSubmit={handleSubscribe}>
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                required
              />
              <button type="submit" className="btn">
                <Send className="h-4 w-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="copyright">
          &copy; 2026 সমীকরণ শপ. All rights reserved. | Designed with
          <i
            className="fas fa-heart"
            style={{ color: "#e74c3c", margin: "0 5px" }}
          ></i>{" "}
          for Bangladesh
        </div>
      </div>
    </footer>
  );
}
