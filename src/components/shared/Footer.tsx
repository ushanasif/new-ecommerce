import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-12 px-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#ff3667] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-semibold text-gray-800">Ecommerce</span>
              <span className="text-sm text-gray-500">.com</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Got Question? Call us 9 AM- 10 PM</p>
              <p className="text-lg font-semibold text-gray-800">09613-800800</p>
              <p className="text-sm text-gray-600">Follow Us</p>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Facebook className="text-white"/>
                </div>
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                  <Twitter className="text-white"/>
                </div>
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                  <Instagram className="text-white"/>
                </div>
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <Youtube className="text-red-500"/>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <span className="text-sm text-gray-600">See our reviews on</span>
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm font-semibold text-gray-800 ml-1">Trustpilot</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 uppercase tracking-wide">COMPANY</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Career</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Othoba Certified</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Terms & Condition</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Next/Same day delivery TC</a></li>
            </ul>
          </div>

          {/* My Account Section */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 uppercase tracking-wide">MY ACCOUNT</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Sign In</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Orders</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Addresses</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">My Wishlist</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Order History</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Track My Order</a></li>
            </ul>
          </div>

          {/* Customer Service Section */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 uppercase tracking-wide">CUSTOMER SERVICE</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Payment Methods</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Support Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">How To Shop On Othoba</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Featured Recommendation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Cancellation, Return & Refund</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-pink-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1.99★</span>
                </div>
                <span className="text-sm text-gray-600">Store</span>
              </div>
              <span className="text-sm text-gray-600">© {new Date().getFullYear()} Othoba Pvt Ltd</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">We're using safe payment for</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs">P</span>
                </div>
                <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs">V</span>
                </div>
                <div className="w-8 h-6 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">M</span>
                </div>
                <div className="w-8 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">A</span>
                </div>
                <div className="w-8 h-6 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs">G</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;