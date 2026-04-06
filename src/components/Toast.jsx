import React, { useState, useEffect } from 'react';
import './Toast.css';

function Toast({ message, type = 'success', onClose, duration = 3000, position = 'top-right' }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast-container ${type} ${position} ${visible ? 'show' : 'hide'}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}

export default Toast;
