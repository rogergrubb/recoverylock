'use client';

import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [scene, setScene] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setScene((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Animated gradient background */}
      <div style={{
        position: 'fixed',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at 30% 50%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(234, 88, 12, 0.1) 0%, transparent 40%)',
        animation: 'gradientMove 10s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        background: 'linear-gradient(to bottom, rgba(28, 25, 23, 0.9), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>🔒</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>
            Recovery <span style={{ color: '#f97316' }}>Lock</span>
          </span>
        </div>
        <a
          href="/app"
          style={{
            background: '#f97316',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '100px',
            fontWeight: 600,
            fontSize: '16px',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
          }}
        >
          Try It Free
        </a>
      </header>

      {/* Hero Section with Animation */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '100px 40px'
      }}>
        {/* Scene 1: Hook */}
        <div style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          opacity: scene === 0 ? 1 : 0,
          transform: scene === 0 ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-in-out',
          pointerEvents: scene === 0 ? 'auto' : 'none'
        }}>
          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 80px)',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '900px'
          }}>
            Your phone knows when you&apos;re <span style={{ color: '#f97316' }}>vulnerable.</span>
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 4vw, 32px)',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            What if it could help you heal instead?
          </p>
          <a
            href="/app"
            style={{
              background: '#f97316',
              color: 'white',
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 700,
              padding: '20px 48px',
              borderRadius: '100px',
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)',
              animation: 'ctaPulse 2s ease-in-out infinite'
            }}
          >
            Start Your Recovery Journey
          </a>
        </div>
        
        {/* Scene 2: Phone mockup */}
        <div style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          opacity: scene === 1 ? 1 : 0,
          transform: scene === 1 ? 'scale(1)' : 'scale(0.9)',
          transition: 'all 0.8s ease-in-out',
          pointerEvents: scene === 1 ? 'auto' : 'none'
        }}>
          <div style={{
            width: 'min(300px, 80vw)',
            height: 'min(620px, 70vh)',
            background: '#000',
            borderRadius: '48px',
            padding: '12px',
            boxShadow: '0 50px 100px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.1)',
            animation: 'phoneFloat 4s ease-in-out infinite'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
              borderRadius: '38px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '24px', animation: 'pulse 2s ease-in-out infinite' }}>🔒</div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '12px' }}>
                Check In Before<br/>You Check Out
              </p>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                30 seconds to clarity
              </p>
            </div>
          </div>
        </div>
        
        {/* Scene 3: Features */}
        <div style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          opacity: scene === 2 ? 1 : 0,
          transform: scene === 2 ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-in-out',
          pointerEvents: scene === 2 ? 'auto' : 'none'
        }}>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 56px)',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            Built for <span style={{ color: '#f97316' }}>Recovery</span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '900px',
            width: '100%'
          }}>
            {[
              { icon: '🎯', title: 'AI-Powered Reflections', desc: 'Personalized wisdom for your journey' },
              { icon: '📞', title: 'One-Tap Support Call', desc: 'Reach your sponsor instantly' },
              { icon: '🔥', title: 'Streak Tracking', desc: 'Celebrate every day of progress' },
              { icon: '🙏', title: '12-Step Principles', desc: 'Grounded in what works' }
            ].map((feature, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <span style={{ fontSize: '40px' }}>{feature.icon}</span>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scene 4: Quote */}
        <div style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          opacity: scene === 3 ? 1 : 0,
          transform: scene === 3 ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 0.8s ease-in-out',
          pointerEvents: scene === 3 ? 'auto' : 'none'
        }}>
          <div style={{ fontSize: '80px', color: '#f97316', opacity: 0.3, lineHeight: 0.5, marginBottom: '20px' }}>&quot;</div>
          <p style={{
            fontSize: 'clamp(22px, 5vw, 48px)',
            color: 'white',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: '900px'
          }}>
            This app helped me pause before I relapsed. That pause saved my recovery.
          </p>
          <p style={{
            fontSize: 'clamp(16px, 3vw, 24px)',
            color: '#f97316',
            marginTop: '28px'
          }}>
            — A grateful member in recovery
          </p>
        </div>
        
        {/* Scene 5: CTA */}
        <div style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          opacity: scene === 4 ? 1 : 0,
          transform: scene === 4 ? 'scale(1)' : 'scale(0.9)',
          transition: 'all 0.8s ease-in-out',
          pointerEvents: scene === 4 ? 'auto' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <span style={{ fontSize: 'clamp(56px, 12vw, 100px)', animation: 'lockBounce 2s ease-in-out infinite' }}>🔒</span>
            <span style={{ fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 800, color: 'white' }}>
              Recovery <span style={{ color: '#f97316' }}>Lock</span>
            </span>
          </div>
          <p style={{
            fontSize: 'clamp(18px, 4vw, 36px)',
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Transform screen time into recovery time.
          </p>
          <a
            href="/app"
            style={{
              background: '#f97316',
              color: 'white',
              fontSize: 'clamp(20px, 4vw, 32px)',
              fontWeight: 700,
              padding: '24px 56px',
              borderRadius: '100px',
              textDecoration: 'none',
              boxShadow: '0 0 50px rgba(249, 115, 22, 0.5)',
              animation: 'ctaPulse 2s ease-in-out infinite'
            }}
          >
            Try It Now — Free
          </a>
          <p style={{
            fontSize: 'clamp(14px, 3vw, 20px)',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '24px'
          }}>
            5-day free trial • No credit card required
          </p>
        </div>
        
        {/* Scene indicators */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 50
        }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => setScene(i)}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: 'none',
                background: scene === i ? '#f97316' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '100px 40px',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            How It <span style={{ color: '#f97316' }}>Works</span>
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px'
          }}>
            {[
              { step: '1', title: 'Set Your Check-In Times', desc: 'Choose 3 times daily or every app open — whatever fits your recovery.' },
              { step: '2', title: 'Pause & Reflect', desc: 'When prompted, take 30 seconds to check in with how you\'re really feeling.' },
              { step: '3', title: 'Get Personalized Wisdom', desc: 'AI-powered reflections grounded in 12-step principles meet you where you are.' },
              { step: '4', title: 'Call Your Support', desc: 'One tap to reach your sponsor, friend, or counselor when you need them.' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#f97316',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'white',
                  margin: '0 auto 20px'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crisis Resources */}
      <section style={{
        padding: '60px 40px',
        background: 'rgba(220, 38, 38, 0.1)',
        borderTop: '1px solid rgba(220, 38, 38, 0.3)',
        borderBottom: '1px solid rgba(220, 38, 38, 0.3)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fca5a5', marginBottom: '16px' }}>
            🚨 In Crisis? Help is Available 24/7
          </h3>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
            <strong>911</strong> (US/CA) • <strong>988</strong> (Suicide & Crisis Lifeline) • <strong>999</strong> (UK) • <strong>112</strong> (EU)
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
            SAMHSA National Helpline: <strong>1-800-662-4357</strong> (free, confidential, 24/7)
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: 'clamp(28px, 6vw, 48px)',
          fontWeight: 800,
          color: 'white',
          marginBottom: '20px'
        }}>
          Ready to Take Back <span style={{ color: '#f97316' }}>Control?</span>
        </h2>
        <p style={{
          fontSize: 'clamp(16px, 3vw, 22px)',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Join thousands in recovery who are transforming their relationship with their phone.
        </p>
        <a
          href="/app"
          style={{
            display: 'inline-block',
            background: '#f97316',
            color: 'white',
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: 700,
            padding: '20px 48px',
            borderRadius: '100px',
            textDecoration: 'none',
            boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)'
          }}
        >
          Start Free Trial
        </a>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
          marginTop: '20px'
        }}>
          5-day free trial • $49.99/year or $9.99/week after
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '24px' }}>🔒</span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
            Recovery <span style={{ color: '#f97316' }}>Lock</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/support" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none' }}>Support</a>
          <a href="/delete-account" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none' }}>Delete Account</a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
          © 2026 Recovery Lock. All rights reserved.
        </p>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientMove {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-5%, -5%); }
        }
        @keyframes phoneFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.4); transform: scale(1); }
          50% { box-shadow: 0 0 50px rgba(249, 115, 22, 0.6); transform: scale(1.02); }
        }
        @keyframes lockBounce {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        a:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
