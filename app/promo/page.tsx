'use client';

import { useEffect, useState } from 'react';

export default function PromoPage() {
  const [scene, setScene] = useState(0);
  
  useEffect(() => {
    const scenes = [0, 1, 2, 3, 4];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % scenes.length;
      setScene(scenes[currentIndex]);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Animated gradient background */}
      <div style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at 30% 50%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(234, 88, 12, 0.1) 0%, transparent 40%)',
        animation: 'gradientMove 10s ease-in-out infinite'
      }} />
      
      {/* Scene 1: Hook */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        opacity: scene === 0 ? 1 : 0,
        transform: scene === 0 ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease-in-out'
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 8vw, 72px)',
          fontWeight: 800,
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.2,
          marginBottom: '24px'
        }}>
          Your phone knows when you&apos;re <span style={{ color: '#f97316' }}>vulnerable.</span>
        </h1>
        <p style={{
          fontSize: 'clamp(18px, 4vw, 32px)',
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center'
        }}>
          What if it could help you heal instead?
        </p>
      </div>
      
      {/* Scene 2: Phone mockup */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        opacity: scene === 1 ? 1 : 0,
        transform: scene === 1 ? 'scale(1)' : 'scale(0.9)',
        transition: 'all 0.8s ease-in-out'
      }}>
        <div style={{
          width: 'min(280px, 70vw)',
          height: 'min(580px, 80vh)',
          background: '#000',
          borderRadius: '40px',
          padding: '10px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.1)',
          animation: 'phoneFloat 4s ease-in-out infinite'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
            borderRadius: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '20px', animation: 'pulse 2s ease-in-out infinite' }}>🔒</div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '10px' }}>
              Check In Before<br/>You Check Out
            </p>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
              30 seconds to clarity
            </p>
          </div>
        </div>
      </div>
      
      {/* Scene 3: Features */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        opacity: scene === 2 ? 1 : 0,
        transform: scene === 2 ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease-in-out'
      }}>
        <h2 style={{
          fontSize: 'clamp(24px, 6vw, 48px)',
          fontWeight: 800,
          color: 'white',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          Built for <span style={{ color: '#f97316' }}>Recovery</span>
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxWidth: '400px'
        }}>
          {[
            { icon: '🎯', text: 'AI-Powered Reflections' },
            { icon: '📞', text: 'One-Tap Sponsor Call' },
            { icon: '🔥', text: 'Streak Tracking' },
            { icon: '🙏', text: '12-Step Principles' }
          ].map((feature, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: 'clamp(18px, 4vw, 28px)',
              color: 'white'
            }}>
              <span style={{ fontSize: 'clamp(28px, 6vw, 40px)' }}>{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scene 4: Quote */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        opacity: scene === 3 ? 1 : 0,
        transform: scene === 3 ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 0.8s ease-in-out'
      }}>
        <p style={{
          fontSize: 'clamp(20px, 5vw, 42px)',
          color: 'white',
          fontStyle: 'italic',
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: '800px'
        }}>
          &quot;This app helped me pause before I relapsed. That pause saved my recovery.&quot;
        </p>
        <p style={{
          fontSize: 'clamp(16px, 3vw, 24px)',
          color: '#f97316',
          marginTop: '24px'
        }}>
          — A grateful member
        </p>
      </div>
      
      {/* Scene 5: CTA */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        opacity: scene === 4 ? 1 : 0,
        transform: scene === 4 ? 'scale(1)' : 'scale(0.9)',
        transition: 'all 0.8s ease-in-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <span style={{ fontSize: 'clamp(48px, 10vw, 80px)' }}>🔒</span>
          <span style={{ fontSize: 'clamp(32px, 8vw, 64px)', fontWeight: 800, color: 'white' }}>
            Recovery <span style={{ color: '#f97316' }}>Lock</span>
          </span>
        </div>
        <p style={{
          fontSize: 'clamp(16px, 4vw, 32px)',
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          Transform screen time into recovery time.
        </p>
        <a
          href="/"
          style={{
            background: '#f97316',
            color: 'white',
            fontSize: 'clamp(18px, 4vw, 28px)',
            fontWeight: 700,
            padding: '20px 48px',
            borderRadius: '100px',
            textDecoration: 'none',
            boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)',
            animation: 'ctaPulse 2s ease-in-out infinite'
          }}
        >
          Try Free
        </a>
        <p style={{
          fontSize: 'clamp(12px, 3vw, 18px)',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '20px'
        }}>
          5-day free trial • Cancel anytime
        </p>
      </div>
      
      {/* Scene indicators */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px'
      }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            onClick={() => setScene(i)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: scene === i ? '#f97316' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes gradientMove {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-5%, -5%); }
        }
        @keyframes phoneFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.4); }
          50% { box-shadow: 0 0 60px rgba(249, 115, 22, 0.6); }
        }
      `}</style>
    </div>
  );
}
