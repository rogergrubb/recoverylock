'use client';

import { useState } from 'react';

export default function DeleteAccount() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // In production, this would send to your backend
    // For now, we'll just show a confirmation
    setSubmitted(true);
    
    // Also clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recoverylock_profile');
      localStorage.removeItem('recoverylock_history');
    }
  };

  if (submitted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#FFF7ED', 
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1c1917', marginBottom: '16px' }}>
            Deletion Request Received
          </h1>
          <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.6' }}>
            Your account deletion request has been submitted. Your local data has been cleared from this device.
          </p>
          <p style={{ color: '#4b5563', marginBottom: '32px', lineHeight: '1.6' }}>
            If you had an active subscription, please also cancel it through your App Store or Google Play settings to avoid future charges.
          </p>
          <p style={{ color: '#78716c', fontSize: '14px', marginBottom: '32px' }}>
            We&apos;re sorry to see you go. If you ever want to return, we&apos;ll be here to support your recovery journey.
          </p>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              background: '#f97316',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#FFF7ED', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <a href="/" style={{ color: '#f97316', textDecoration: 'none', fontSize: '14px' }}>← Back to App</a>
        
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1c1917', marginTop: '24px', marginBottom: '8px' }}>
          Delete Your Account
        </h1>
        <p style={{ color: '#78716c', marginBottom: '32px' }}>
          We&apos;re sorry to see you go. Please read the information below before proceeding.
        </p>
        
        <div style={{ color: '#1c1917', lineHeight: '1.8', fontSize: '16px' }}>
          
          {/* Warning Box */}
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fca5a5', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '32px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', marginBottom: '12px' }}>
              ⚠️ This action is permanent
            </h2>
            <p style={{ marginBottom: '12px' }}>Deleting your account will:</p>
            <ul style={{ paddingLeft: '24px', marginBottom: '0' }}>
              <li style={{ marginBottom: '8px' }}>Remove all your local data from this device</li>
              <li style={{ marginBottom: '8px' }}>Delete your check-in history and reflections</li>
              <li style={{ marginBottom: '8px' }}>Remove your profile and preferences</li>
              <li style={{ marginBottom: '8px' }}>Cancel your access to the app</li>
            </ul>
          </div>

          {/* Subscription Note */}
          <div style={{ 
            background: '#fef3c7', 
            border: '1px solid #fcd34d', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '32px' 
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
              📱 Don&apos;t forget to cancel your subscription
            </h3>
            <p style={{ marginBottom: '0', color: '#92400e' }}>
              If you subscribed through the App Store or Google Play, you must also cancel your subscription through your device settings to stop future charges.
            </p>
          </div>

          {/* Form */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Request Account Deletion</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Email (optional, for confirmation)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Reason for leaving (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Help us improve..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  style={{ marginTop: '4px', width: '20px', height: '20px' }}
                />
                <span>
                  I understand that this action is permanent and all my data will be deleted.
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!confirmed}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '9999px',
                border: 'none',
                background: confirmed ? '#dc2626' : '#e5e7eb',
                color: confirmed ? 'white' : '#9ca3af',
                fontSize: '16px',
                fontWeight: '600',
                cursor: confirmed ? 'pointer' : 'not-allowed'
              }}
            >
              Delete My Account
            </button>
          </div>

          {/* Alternative */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ color: '#78716c', marginBottom: '16px' }}>
              Having second thoughts? That&apos;s okay.
            </p>
            <a 
              href="/"
              style={{
                color: '#f97316',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Keep my account →
            </a>
          </div>

          <div style={{ 
            marginTop: '48px', 
            paddingTop: '24px', 
            borderTop: '1px solid #e5e5e5',
            textAlign: 'center',
            color: '#78716c',
            fontSize: '14px'
          }}>
            <p>© 2026 Recovery Lock. All rights reserved.</p>
            <div style={{ marginTop: '16px' }}>
              <a href="/privacy" style={{ color: '#f97316', marginRight: '24px' }}>Privacy Policy</a>
              <a href="/terms" style={{ color: '#f97316', marginRight: '24px' }}>Terms of Service</a>
              <a href="/support" style={{ color: '#f97316' }}>Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
