import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gem,
  Users,
  Shield,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// eslint-disable-next-line no-unused-vars
const ContactUs = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      question: "How do I participate in gem auctions?",
      answer:
        "To participate in our gem auctions, you need to create an account, verify your identity, and deposit funds into your account. Once verified, you can browse available gems and place bids during auction periods.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards, bank transfers, and digital payment methods. All payments are processed securely through our encrypted payment gateway.",
    },
    {
      question: "How are gems authenticated?",
      answer:
        "All gems on our platform are authenticated by certified gemologists. Each gem comes with detailed certificates and high-resolution images showing clarity, cut, color, and carat details.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return policy for gems that don't match their description. All returns must be in original condition with certification documents.",
    },
    {
      question: "How do I sell gems on your platform?",
      answer:
        "To sell gems, submit your gem details through our seller portal. Our team will evaluate and authenticate your gem before listing it for auction.",
    },
    // Old FAQ content merged
    {
      question: "How do I place a bid?",
      answer: "Browse the auctions and click “Place Bid” on your chosen gem.",
    },
    {
      question: "How do I check my ticket status?",
      answer:
        "You can view all your tickets under “Tickets List” in the Help Center.",
    },
    {
      question: "How do I contact support directly?",
      answer: "Use the “Create New Ticket” button above to send your inquiry.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <Gem className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl opacity-90">
              Your trusted partner in gem trading
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Gem Bidding System
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Welcome to the premier online platform for buying and selling
              precious gems. Our secure marketplace connects gem enthusiasts,
              collectors, and traders worldwide with authenticated, high-quality
              gemstones. Visit our website:{" "}
              <a
                href="https://ikmangems.lk"
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                ikmangems.lk
              </a>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                10,000+ Active Users
              </h3>
              <p className="text-gray-600">Trusted by collectors worldwide</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                100% Authenticated
              </h3>
              <p className="text-gray-600">Every gem verified by experts</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">5-Star Rated</h3>
              <p className="text-gray-600">Excellence in service delivery</p>
            </div>
          </div>
        </div>

        {/* Contact Info & Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Get In Touch
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-purple-600 mr-4" />
                <span className="text-gray-700">+94 11 234 5678</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-600 mr-4" />
                <span className="text-gray-700">support@gembidding.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-purple-600 mr-4" />
                <span className="text-gray-700">
                  123 Gem Street, Colombo 03, Sri Lanka
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-purple-600 mr-4" />
                <span className="text-gray-700">Mon - Fri: 9AM - 6PM</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Link
                to="/createTicket"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-300 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Ticket
              </Link>
              <button
                onClick={() => navigate("/ticketList")}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition duration-300 flex items-center justify-center"
              >
                <Eye className="h-5 w-5 mr-2" />
                My Tickets
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? null : index)
                  }
                  className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition duration-200"
                >
                  <span className="font-medium text-gray-800">
                    {faq.question}
                  </span>
                  {expandedFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="p-4 pt-0 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
