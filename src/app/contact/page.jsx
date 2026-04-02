import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function ContactPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary mb-4">Contact Us</h1>
            <p className="text-lg text-dark-gray">Get in touch with সমীকরণ শপ</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-secondary mb-4">Get in Touch</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-medium-gray rounded-md focus:ring-primary focus:border-primary" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-medium-gray rounded-md focus:ring-primary focus:border-primary" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Message</label>
                  <textarea className="w-full px-4 py-2 border border-medium-gray rounded-md focus:ring-primary focus:border-primary h-32" placeholder="Your message..."></textarea>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-md hover:bg-red-600 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-secondary mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-secondary mb-2">📍 Address</h3>
                  <p className="text-dark-gray">123 Main Road, Dhaka, Bangladesh</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-2">📞 Phone</h3>
                  <p className="text-dark-gray">+880 1234-567890</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-2">📧 Email</h3>
                  <p className="text-dark-gray">info@somikoronshop.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-2">🕐 Business Hours</h3>
                  <p className="text-dark-gray">Saturday - Thursday: 10:00 AM - 8:00 PM</p>
                  <p className="text-dark-gray">Friday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
