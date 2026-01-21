'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Could verify session here if needed
    setLoading(false)
  }, [sessionId])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>✅</span>
        </div>
        
        <h1 style={styles.title}>Welcome to Recovery Lock!</h1>
        
        <p style={styles.text}>
          Your 3-day free trial has started. You won't be charged until the trial ends.
        </p>
        
        <div style={styles.features}>
          <div style={styles.feature}>
            <span>🔒</span>
            <span>App blocking enabled</span>
          </div>
          <div style={styles.feature}>
            <span>✨</span>
            <span>Unlimited check-ins</span>
          </div>
          <div style={styles.feature}>
            <span>📊</span>
            <span>Full journey analytics</span>
          </div>
          <div style={styles.feature}>
            <span>🔥</span>
            <span>Streak tracking</span>
          </div>
        </div>
        
        <a href="/" style={styles.button}>
          Start Your Recovery Journey
        </a>
        
        <p style={styles.note}>
          Cancel anytime during your trial - no charge.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FF8C00 0%, #FF6B00 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '40px 32px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  icon: {
    fontSize: '64px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '16px',
  },
  text: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '32px',
    lineHeight: 1.6,
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
    textAlign: 'left',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    color: '#333',
    background: '#f8f9fa',
    padding: '12px 16px',
    borderRadius: '12px',
  },
  button: {
    display: 'block',
    background: 'linear-gradient(135deg, #FF9800, #FF6B00)',
    color: '#fff',
    textDecoration: 'none',
    padding: '18px 32px',
    borderRadius: '16px',
    fontSize: '17px',
    fontWeight: '600',
    marginBottom: '16px',
    boxShadow: '0 4px 20px rgba(255,107,0,0.3)',
  },
  note: {
    fontSize: '13px',
    color: '#999',
  },
}
