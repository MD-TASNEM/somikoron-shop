import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";
import SessionWrapper from "@/components/providers/SessionWrapper";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "সমীকরণ শপ | কাস্টমাইজড পণ্যের একমাত্র ঠিকানা",
  description:
    "সমীকরণ শপে আপনি পাবেন কাপ, প্লেট, ফটো ফ্রেম, নিকাহ নামা, কলম, স্কেল সহ সব ধরনের কাস্টমাইজড পণ্য",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} font-sans h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily:
            "var(--font-hind-siliguri), Hind Siliguri, system-ui, sans-serif",
        }}
      >
        <SessionWrapper>
          <ToastProvider>{children}</ToastProvider>
        </SessionWrapper>

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/8801996570203"
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp"></i>
        </a>
      </body>
    </html>
  );
}
