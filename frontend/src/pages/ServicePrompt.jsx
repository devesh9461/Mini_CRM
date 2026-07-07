import React from 'react';
import PaymentQR from './PaymentQR';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ServicePrompt.css';

export default function ServicePrompt() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [showQR, setShowQR] = React.useState(false);

  const handlePay = () => {
    // Show QR/payment options popup
    setShowQR(true);
  };

  const handleContinue = () => {
    // After payment, mark as completed and clear skip flag
    localStorage.removeItem('servicePromptSkipped');
    localStorage.setItem('servicePromptCompleted', 'true');
    navigate('/');
  };

  const handleProceed = () => {
    // Fallback direct continue without payment
    navigate('/');
  };

  return (
    <div className="service-prompt-overlay">
      <div className="service-prompt-card glass-card">
        <h2 className="service-title">Unlock Full Access</h2>
        <p className="service-subtitle">Hi {admin?.username || admin?.email || 'User'},</p>
        <p className="service-message">
          Enjoy effortless lead management 24/7. Get unlimited access for just <strong>₹10</strong> per month.
        </p>
          <button className="btn btn-primary service-pay-btn" onClick={handlePay}>
            Pay ₹10 &amp; Continue
          </button>
          <button className="btn btn-ghost service-skip-btn" onClick={() => { localStorage.setItem('servicePromptSkipped', 'true'); handleProceed(); }}>Skip for now</button>
      </div>
      {showQR && <PaymentQR onClose={handleContinue} />}
    </div>
  );
}
