import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export default function OffersPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary mb-4">Special Offers</h1>
            <p className="text-lg text-dark-gray">Amazing deals on our custom products</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">20% OFF</h3>
                <p className="text-secondary mb-4">On all Photo Frames</p>
                <p className="text-sm text-dark-gray">Custom photo frames with your favorite memories</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">Buy 2 Get 1</h3>
                <p className="text-secondary mb-4">On all Coffee Mugs</p>
                <p className="text-sm text-dark-gray">Buy 2 mugs and get 1 absolutely free</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">Free Shipping</h3>
                <p className="text-secondary mb-4">On orders above ৳500</p>
                <p className="text-sm text-dark-gray">Get free delivery on bulk orders</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
