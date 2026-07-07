import React from 'react';
import './PaymentQR.css';

// Simple SVG placeholder for QR code (you can replace with a real QR image later)
const qrDataUrl =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <rect width='200' height='200' fill='#eee'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#555' font-size='20'>QR</text>
    </svg>`
  );

export default function PaymentQR({ onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // auto‑close after 8 seconds (placeholder for payment)
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="payment-qr-overlay">
      <div className="payment-qr-card glass-card">
        <h2 className="payment-qr-title">Pay ₹10</h2>
        <p className="payment-qr-instructions">
          Scan the QR code with PhonePe or copy the UPI ID below to complete the payment.
        </p>
        <img src={qrDataUrl} alt="QR code placeholder" className="payment-qr-image" />
        <p className="payment-qr-upi">UPI ID: <strong>mini.crm@upi</strong></p>
        <p className="payment-qr-phone">Or pay via PhonePe number: <strong>+91 98765 43210</strong></p>
          {/* The popup will auto‑close after the timer – no manual close button */}
      </div>
    </div>
  );
}
