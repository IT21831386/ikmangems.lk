import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ikmangems.lk</h3>
            <p className="text-gray-400">
              Sri Lanka's premier platform for authentic gem auctions,
              connecting buyers with verified dealers.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Auctions", "Sellers", "About"].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {[
                "Help Center",
                "Contact Us",
                "Terms of Service",
                "Privacy Policy",
              ].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <p>Colombo, Sri Lanka</p>
              <p>info@ikmangems.lk</p>
              <p>+94 11 123 4567</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 ikmangems.lk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
