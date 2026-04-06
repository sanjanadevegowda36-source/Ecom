import React, { useState } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';
import './Chatbot.css';

/**
 * Chatbot - A floating chatbot component that responds to basic queries
 * Features:
 * - Open/close toggle
 * - Greeting messages
 * - Basic responses for order status, refund policy, delivery time
 */
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m SanjuCart Assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  // FAQ responses
  const getBotResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('order status') || lowerInput.includes('track order')) {
      return 'You can track your order status by visiting the Order Tracking page. Go to your dashboard and click on "My Orders" to see the current status of your orders.';
    }
    
    if (lowerInput.includes('refund') || lowerInput.includes('return')) {
      return 'Our refund policy allows returns within 30 days of delivery. Items must be unused and in original packaging. To initiate a refund, please contact our support team.';
    }
    
    if (lowerInput.includes('delivery') || lowerInput.includes('shipping') || lowerInput.includes('time')) {
      return 'Delivery time varies by location. Standard delivery takes 3-5 business days. Express delivery is available for an additional fee (1-2 business days).';
    }
    
    if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      return 'Our prices are competitive and include GST. You can check product prices on the Products page. Use the search feature to find specific items.';
    }
    
    if (lowerInput.includes('contact') || lowerInput.includes('support') || lowerInput.includes('help')) {
      return 'You can contact us through the Contact page or email us at support@sanjucart.com. We\'re available Monday-Saturday, 9 AM to 6 PM.';
    }
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return 'Hello! How can I assist you today? You can ask me about:\n• Order status\n• Refund policy\n• Delivery time\n• Products\n• Contact information';
    }
    
    if (lowerInput.includes('product') || lowerInput.includes('buy')) {
      return 'You can browse our products on the Products page. Use the search bar to find items by brand name. Click on any product to view details and add to cart!';
    }
    
    if (lowerInput.includes('cart') || lowerInput.includes('checkout')) {
      return 'To checkout, add items to your cart and click on the cart icon. You\'ll need to be logged in to complete your purchase. The checkout process includes confirming your delivery address and payment.';
    }
    
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }
    
    return 'I\'m not sure I understand. Here are some things I can help with:\n• Order status and tracking\n• Refund and return policy\n• Delivery information\n• Product inquiries\n• Contact support\n\nPlease type your question above.';
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    // Get bot response after a short delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputText),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 1) {
      // Send a greeting when opening for the first time
      setTimeout(() => {
        const greeting = {
          id: Date.now() + 1,
          text: 'Welcome to SanjuCart! Feel free to ask me any questions about orders, shipping, refunds, or our products.',
          sender: 'bot'
        };
        setMessages(prev => [...prev, greeting]);
      }, 300);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat toggle button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        <FaComments />
      </button>

      {/* Chat window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <FaRobot className="chatbot-header-icon" />
            <span>SanjuCart Assistant</span>
          </div>
          <button 
            className="chatbot-close"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            <FaTimes />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`chatbot-message ${message.sender === 'bot' ? 'bot' : 'user'}`}
            >
              <div className="message-icon">
                {message.sender === 'bot' ? <FaRobot /> : <FaUser />}
              </div>
              <div className="message-text">
                {message.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="chatbot-input">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage} aria-label="Send message">
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
