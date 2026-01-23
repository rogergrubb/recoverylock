export default function Support() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#FFF7ED', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <a href="/" style={{ color: '#f97316', textDecoration: 'none', fontSize: '14px' }}>← Back to App</a>
        
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1c1917', marginTop: '24px', marginBottom: '8px' }}>
          Support Center
        </h1>
        <p style={{ color: '#78716c', marginBottom: '32px' }}>We&apos;re here to help you on your recovery journey</p>
        
        <div style={{ color: '#1c1917', lineHeight: '1.8', fontSize: '16px' }}>
          
          {/* Crisis Resources - IMPORTANT */}
          <div style={{ 
            background: '#fef2f2', 
            border: '2px solid #ef4444', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '32px' 
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#dc2626', marginBottom: '16px' }}>
              🚨 In Crisis? Get Help Now
            </h2>
            <p style={{ marginBottom: '16px' }}>
              If you or someone you know is in immediate danger, please contact emergency services or a crisis hotline:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '0' }}>
              <li style={{ marginBottom: '8px' }}><strong>Emergency:</strong> 911</li>
              <li style={{ marginBottom: '8px' }}><strong>National Suicide Prevention Lifeline:</strong> 988</li>
              <li style={{ marginBottom: '8px' }}><strong>SAMHSA National Helpline:</strong> 1-800-662-4357 (24/7, free, confidential)</li>
              <li style={{ marginBottom: '8px' }}><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
            </ul>
          </div>

          {/* Contact Section */}
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>Contact Us</h2>
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <p style={{ marginBottom: '16px' }}>
              <strong>Email:</strong> <a href="mailto:support@recoverylock.app" style={{ color: '#f97316' }}>support@recoverylock.app</a>
            </p>
            <p style={{ marginBottom: '0' }}>
              We typically respond within 24-48 hours.
            </p>
          </div>

          {/* FAQ Section */}
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>Frequently Asked Questions</h2>
          
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>How do I cancel my subscription?</h3>
            <p style={{ marginBottom: '0', color: '#4b5563' }}>
              If you subscribed through the app, email us at support@recoverylock.app. If you subscribed through the App Store or Play Store, manage your subscription through your device&apos;s settings.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>How do I delete my account?</h3>
            <p style={{ marginBottom: '0', color: '#4b5563' }}>
              Visit <a href="/delete-account" style={{ color: '#f97316' }}>recoverylock.app/delete-account</a> or email us at support@recoverylock.app with your request.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Is my data private?</h3>
            <p style={{ marginBottom: '0', color: '#4b5563' }}>
              Yes! Most of your data is stored locally on your device only. We do not sell your personal information. See our <a href="/privacy" style={{ color: '#f97316' }}>Privacy Policy</a> for details.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>How do I restore my purchase?</h3>
            <p style={{ marginBottom: '0', color: '#4b5563' }}>
              If you previously subscribed and need to restore your purchase on a new device, use the &quot;Restore Purchase&quot; button on the subscription screen, or contact support.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Can I change my check-in times?</h3>
            <p style={{ marginBottom: '0', color: '#4b5563' }}>
              Notification timing settings are coming in a future update. Currently, reminders are set for morning, noon, and evening.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Is Recovery Lock a replacement for treatment?</h3>
            <p style={{ marginBottom: '0', color: '#4b5563' }}>
              No. Recovery Lock is a supportive tool designed to complement your recovery journey. It is not a substitute for professional treatment, therapy, counseling, or medical care. Always work with qualified professionals for your recovery program.
            </p>
          </div>

          {/* Recovery Resources */}
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>Recovery Resources</h2>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <ul style={{ paddingLeft: '24px', marginBottom: '0' }}>
              <li style={{ marginBottom: '12px' }}><a href="https://www.aa.org" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>Alcoholics Anonymous (AA)</a></li>
              <li style={{ marginBottom: '12px' }}><a href="https://www.na.org" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>Narcotics Anonymous (NA)</a></li>
              <li style={{ marginBottom: '12px' }}><a href="https://www.samhsa.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>SAMHSA (Substance Abuse and Mental Health Services)</a></li>
              <li style={{ marginBottom: '12px' }}><a href="https://www.smartrecovery.org" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>SMART Recovery</a></li>
              <li style={{ marginBottom: '0' }}><a href="https://www.intherooms.com" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>In The Rooms (Online Meetings)</a></li>
            </ul>
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
