import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { faqService } from '../services/faqAPI';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your FAQ assistant. You can ask me questions about our gemstone auction platform, browse questions by category, or click on the suggested questions below.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch FAQs from API when component mounts
  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await faqService.getAllFAQs({ isActive: true });
      setFaqData(response.data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      // Fallback to default FAQs if API fails
      setFaqData([
        {
          _id: 1,
          question: "How do I register as a seller on the platform?",
          answer: "Sellers must provide personal details, NIC, and gem business registration, and submit a verification fee. The system aims to make the seller verification secure within 24 hours."
        },
        {
          _id: 2,
          question: "How do I place a bid on a live auction?",
          answer: "Once logged in, you can place your bid on a live auction item. The system ensures bids are updated in real-time and the bidding management process is tracked."
        },
        {
          _id: 3,
          question: "How will I know if someone else has placed a higher bid?",
          answer: "The system will introduce real-time bid notifications using WebSocket technology. Emails will also be sent to all bidders when a new bid is lodged."
        },
        {
          _id: 4,
          question: "What happens immediately after an auction closes?",
          answer: "The system is designed to automatically give the gem to the highest bidder upon the close of the sale."
        },
        {
          _id: 5,
          question: "What happens if the winning bidder refuses the purchase?",
          answer: "In this case, the system ensures a transaction by automatically offering to sell the gem to the second-best bidder."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputValue,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Find matching FAQ answer
      const matchingFAQ = faqData.find(faq => 
        faq.question.toLowerCase().includes(inputValue.toLowerCase()) ||
        inputValue.toLowerCase().includes(faq.question.toLowerCase().split(' ')[0]) ||
        faq.tags && faq.tags.some(tag => tag.toLowerCase().includes(inputValue.toLowerCase()))
      );
      
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: matchingFAQ ? matchingFAQ.answer : "I'm sorry, I couldn't find a specific answer to your question. Please feel free to contact our support team for personalized assistance. You can also browse the questions below by category or ask about seller registration, bidding, payments, or gemstone verification.",
        timestamp: new Date(),
        showContactButton: !matchingFAQ
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
      
      setInputValue('');
    }
  };

  const handleSuggestedQuestion = (question, answer) => {
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    
    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      content: answer,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Get unique categories from FAQs
  const categories = [...new Set(faqData.map(faq => faq.category))];
  
  // Filter FAQs by selected category
  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  // Category display names
  const categoryNames = {
    general: 'General',
    seller: 'Seller',
    buyer: 'Buyer', 
    auction: 'Auction',
    payment: 'Payment',
    verification: 'Verification',
    support: 'Support'
  };

  return (
    <>
      {/* Chatbot Icon - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          size="icon"
        >
          <MessageCircle size={24} />
        </Button>
      </div>

      {/* Chat Interface - Sidebar Style */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">FAQ Assistant</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700 p-1 h-8 w-8"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'bot' && (
                      <Bot size={16} className="mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User size={16} className="mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="leading-relaxed">{message.content}</p>
                      {message.showContactButton && (
                        <button
                          onClick={() => {
                            const contactMessage = {
                              id: messages.length + 1,
                              type: 'user',
                              content: 'Contact Support',
                              timestamp: new Date()
                            };
                            setMessages(prev => [...prev, contactMessage]);
                            setInputValue('');
                          }}
                          className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                        >
                          Contact Support
                        </button>
                      )}
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Category Selection */}
            {!loading && faqData.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-xs text-gray-500 font-medium">Browse by category:</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        selectedCategory === category 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {categoryNames[category] || category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Questions - Category filtered */}
            <div className="space-y-2 mt-2">
              <p className="text-xs text-gray-500 font-medium">
                {selectedCategory === 'all' ? 'Quick questions:' : `${categoryNames[selectedCategory] || selectedCategory} questions:`}
              </p>
              {loading ? (
                <div className="text-xs text-gray-400">Loading questions...</div>
              ) : filteredFAQs.length === 0 ? (
                <div className="text-xs text-gray-400">No questions in this category yet.</div>
              ) : (
                <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                  {filteredFAQs.slice(0, 6).map((item) => (
                    <button
                      key={item._id || item.id}
                      onClick={() => handleSuggestedQuestion(item.question, item.answer)}
                      className="w-full text-left p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors hover:shadow-sm"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
