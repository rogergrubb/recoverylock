'use client'

import { useState, useEffect } from 'react'

// Recovery-focused emojis and states
const recoveryEmojis = [
  { emoji: '😰', label: 'struggling' },
  { emoji: '😟', label: 'difficult' },
  { emoji: '😐', label: 'okay' },
  { emoji: '🙂', label: 'good' },
  { emoji: '💪', label: 'strong' },
]

const moodEmojis = [
  { emoji: '😢', label: 'terrible' },
  { emoji: '😔', label: 'low' },
  { emoji: '😐', label: 'neutral' },
  { emoji: '🙂', label: 'good' },
  { emoji: '😇', label: 'amazing' },
]

// AI-style reflections based on recovery + mood state
const getReflection = (recoveryLevel, moodLevel) => {
  const reflections = {
    struggling: [
      "You're reaching out instead of reaching for a drink. That takes courage. This moment of pain is temporary, but your commitment to recovery is building something permanent.",
      "Right now feels impossible. But you've survived every single hard moment before this one. Call your sponsor. Text someone in the program. You don't have to white-knuckle this alone.",
      "The fact that you're here, checking in instead of checking out, shows incredible strength. Your disease wants you isolated. Fight back by connecting with someone right now.",
    ],
    difficult: [
      "Recovery isn't a straight line. Difficult days don't mean you're failing—they mean you're human. What would you tell a newcomer feeling this way? Now tell yourself the same thing.",
      "HALT check: Are you Hungry, Angry, Lonely, or Tired? Sometimes our biggest battles have simple solutions. Take care of the basics, then reassess.",
      "This discomfort is your brain rewiring itself. It won't always feel this hard. Every difficult moment you push through makes the next one a little easier.",
    ],
    okay: [
      "Okay is enough. You don't need to feel amazing to stay sober today. Just okay, just for today, is a victory worth celebrating.",
      "Progress, not perfection. You showed up for yourself today. That's what recovery looks like—one ordinary day at a time.",
      "In the midst of ordinary, remember: there was a time when 'okay' felt impossible. You've come further than you realize.",
    ],
    good: [
      "Notice this feeling. Really let it sink in. This is what recovery promised you, and you're living it right now. You earned this good day.",
      "Good days are built on the foundation of hard days you pushed through. Your past self would be proud of who you're becoming.",
      "When you feel good, that's the perfect time to reach out to someone who might be struggling. Your strength can lift someone else today.",
    ],
    strong: [
      "This strength you're feeling? It's not luck. It's the compound interest of every meeting attended, every call made, every craving resisted. You built this.",
      "From where you started to where you are now—that's a transformation most people never achieve. Let gratitude fill you today.",
      "You're living proof that recovery works. How can you carry this message to someone still suffering? Service keeps us sober.",
    ],
  }
  
  const key = recoveryEmojis[recoveryLevel]?.label || 'okay'
  const options = reflections[key] || reflections.okay
  return options[Math.floor(Math.random() * options.length)]
}

// Daily recovery wisdom
const dailyWisdom = [
  { text: "We admitted we were powerless over alcohol—that our lives had become unmanageable.", source: "Step One" },
  { text: "God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference.", source: "Serenity Prayer" },
  { text: "One day at a time. This is enough. Do not look back and grieve over the past, for it is gone.", source: "Just For Today" },
  { text: "We will not regret the past nor wish to shut the door on it.", source: "The Promises" },
  { text: "Nothing changes if nothing changes.", source: "Recovery Wisdom" },
  { text: "You are not alone. We have all been where you are.", source: "Fellowship" },
  { text: "Progress, not perfection.", source: "AA Saying" },
  { text: "Easy does it, but do it.", source: "AA Saying" },
  { text: "We are only as sick as our secrets.", source: "Recovery Wisdom" },
  { text: "It works if you work it.", source: "AA Saying" },
]

export default function RecoveryLockApp() {
  const [screen, setScreen] = useState('splash')
  const [recoveryLevel, setRecoveryLevel] = useState(2)
  const [moodLevel, setMoodLevel] = useState(2)
  const [reflection, setReflection] = useState('')
  const [dailyQuote] = useState(dailyWisdom[Math.floor(Math.random() * dailyWisdom.length)])
  const [animating, setAnimating] = useState(false)
  const [streak, setStreak] = useState(0)
  const [totalCheckins, setTotalCheckins] = useState(0)
  const [sobrietyDate, setSobrietyDate] = useState('')
  const [sobrietyDays, setSobrietyDays] = useState(0)

  // Load saved data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStreak = localStorage.getItem('recoverylock_streak')
      const savedCheckins = localStorage.getItem('recoverylock_checkins')
      const savedSobrietyDate = localStorage.getItem('recoverylock_sobriety_date')
      
      if (savedStreak) setStreak(parseInt(savedStreak))
      if (savedCheckins) setTotalCheckins(parseInt(savedCheckins))
      if (savedSobrietyDate) {
        setSobrietyDate(savedSobrietyDate)
        const days = Math.floor((new Date() - new Date(savedSobrietyDate)) / (1000 * 60 * 60 * 24))
        setSobrietyDays(days)
      }
    }
  }, [])

  // Auto-advance from splash
  useEffect(() => {
    if (screen === 'splash') {
      setTimeout(() => goToScreen('screen-time'), 2500)
    }
  }, [screen])

  const goToScreen = (nextScreen) => {
    setAnimating(true)
    setTimeout(() => {
      setScreen(nextScreen)
      setAnimating(false)
    }, 300)
  }

  const handleSobrietyDateSave = () => {
    if (sobrietyDate) {
      localStorage.setItem('recoverylock_sobriety_date', sobrietyDate)
      const days = Math.floor((new Date() - new Date(sobrietyDate)) / (1000 * 60 * 60 * 24))
      setSobrietyDays(days)
      goToScreen('streak-intro')
    }
  }

  const handleCheckInComplete = () => {
    const newReflection = getReflection(recoveryLevel, moodLevel)
    setReflection(newReflection)
    
    // Update stats
    const newCheckins = totalCheckins + 1
    const newStreak = streak + 1
    setTotalCheckins(newCheckins)
    setStreak(newStreak)
    localStorage.setItem('recoverylock_checkins', newCheckins.toString())
    localStorage.setItem('recoverylock_streak', newStreak.toString())
    
    goToScreen('reflection')
  }

  const weekDays = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']
  const today = new Date().getDay()

  return (
    <div style={styles.container}>
      {/* Background gradient */}
      <div style={styles.bgGradient} />
      
      <div style={{
        ...styles.content,
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateX(30px)' : 'translateX(0)',
        transition: 'all 0.3s ease-out',
      }}>

        {/* ===== SPLASH SCREEN ===== */}
        {screen === 'splash' && (
          <div style={styles.splashScreen}>
            <div style={styles.logoContainer}>
              <div style={styles.logo}>🔒</div>
              <div style={styles.logoGlow} />
            </div>
            <h1 style={styles.appTitle}>recovery lock</h1>
            <p style={styles.splashTagline}>block your phone until you check in</p>
            <div style={styles.loader}>
              <div style={styles.loaderBar} />
            </div>
          </div>
        )}

        {/* ===== SCREEN TIME SHOCK ===== */}
        {screen === 'screen-time' && (
          <div style={styles.whiteScreen} className="fade-in">
            <div style={styles.shockContent}>
              <p style={styles.shockLine}>
                you'll spend <span style={styles.orangeHighlight}>2,372 hours</span>
              </p>
              <p style={styles.shockLine}>on your phone this year</p>
              <br />
              <p style={styles.shockLine}>
                that's <span style={styles.orangeHighlight}>98 days</span>
              </p>
              <br />
              <p style={styles.shockLine}>
                or <span style={styles.orangeHighlight}>16 years</span> over your lifetime...
              </p>
              <br /><br />
              <p style={styles.shockQuestion}>
                how much of this time supports your <span style={styles.orangeHighlight}>recovery</span>?
              </p>
            </div>
            <button style={styles.orangeButton} onClick={() => goToScreen('sobriety-date')}>
              continue
            </button>
          </div>
        )}

        {/* ===== SOBRIETY DATE ===== */}
        {screen === 'sobriety-date' && (
          <div style={styles.whiteScreen} className="fade-in">
            <div style={styles.centeredContent}>
              <span style={styles.bigEmoji}>📅</span>
              <h2 style={styles.darkHeading}>when did your journey begin?</h2>
              <p style={styles.darkSubtext}>enter your sobriety or recovery date</p>
              
              <input
                type="date"
                value={sobrietyDate}
                onChange={(e) => setSobrietyDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                style={styles.dateInput}
              />
              
              {sobrietyDate && (
                <div style={styles.sobrietyPreview}>
                  <span style={styles.previewNumber}>
                    {Math.floor((new Date() - new Date(sobrietyDate)) / (1000 * 60 * 60 * 24))}
                  </span>
                  <span style={styles.previewLabel}>days in recovery</span>
                </div>
              )}
            </div>
            
            <button 
              style={{...styles.orangeButton, opacity: sobrietyDate ? 1 : 0.5}}
              onClick={handleSobrietyDateSave}
              disabled={!sobrietyDate}
            >
              continue
            </button>
            <button style={styles.textButton} onClick={() => goToScreen('screen-time')}>
              back
            </button>
          </div>
        )}

        {/* ===== STREAK INTRO ===== */}
        {screen === 'streak-intro' && (
          <div style={styles.darkScreen} className="fade-in">
            <div style={styles.streakDisplay}>
              <span style={styles.fireEmoji}>🔥</span>
              <span style={styles.streakNumber}>{sobrietyDays || streak || 1}</span>
              <span style={styles.streakLabel}>day streak</span>
              <p style={styles.streakMessage}>
                {sobrietyDays > 30 
                  ? "extraordinary! your recovery journey is an inspiration to all"
                  : "every day sober is a victory. keep building your streak!"}
              </p>
            </div>
            
            <div style={styles.weekCalendar}>
              {weekDays.map((day, i) => (
                <div key={day} style={styles.calendarDay}>
                  <span style={styles.dayName}>{day}</span>
                  <div style={{
                    ...styles.dayCircle,
                    ...(i <= today ? styles.dayCircleActive : styles.dayCircleInactive),
                  }}>
                    {i <= today ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
            
            <button style={styles.orangeButton} onClick={() => goToScreen('how-it-works')}>
              continue
            </button>
          </div>
        )}

        {/* ===== HOW IT WORKS ===== */}
        {screen === 'how-it-works' && (
          <div style={styles.darkScreen} className="fade-in">
            <h2 style={styles.heading}>How Recovery Lock Works</h2>
            
            <div style={styles.stepsList}>
              <div style={styles.stepItem}>
                <div style={styles.stepNumber}>1</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Choose apps to block</h3>
                  <p style={styles.stepDesc}>TikTok, Instagram, games—whatever pulls you away</p>
                </div>
              </div>
              
              <div style={styles.stepItem}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Check in with yourself</h3>
                  <p style={styles.stepDesc}>How are you feeling? Any cravings?</p>
                </div>
              </div>
              
              <div style={styles.stepItem}>
                <div style={styles.stepNumber}>3</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Receive your reflection</h3>
                  <p style={styles.stepDesc}>A personalized recovery affirmation just for you</p>
                </div>
              </div>
              
              <div style={styles.stepItem}>
                <div style={styles.stepNumber}>4</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Apps unlock</h3>
                  <p style={styles.stepDesc}>Continue with intention, not impulse</p>
                </div>
              </div>
            </div>
            
            <button style={styles.orangeButton} onClick={() => goToScreen('recovery-check')}>
              Continue
            </button>
            <button style={styles.textButtonLight} onClick={() => goToScreen('streak-intro')}>
              Back
            </button>
          </div>
        )}

        {/* ===== RECOVERY CHECK (Green Screen) ===== */}
        {screen === 'recovery-check' && (
          <div style={styles.greenScreen} className="fade-in">
            <h2 style={styles.checkQuestion}>
              how's your recovery<br/>feeling today?
            </h2>
            
            <div style={styles.sliderSection}>
              <span style={styles.bigSliderEmoji}>{recoveryEmojis[recoveryLevel].emoji}</span>
              <input
                type="range"
                min="0"
                max="4"
                value={recoveryLevel}
                onChange={(e) => setRecoveryLevel(parseInt(e.target.value))}
                style={{
                  ...styles.slider,
                  background: `linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) ${recoveryLevel * 25}%, rgba(255,255,255,0.3) ${recoveryLevel * 25}%, rgba(255,255,255,0.3) 100%)`,
                }}
              />
              <span style={styles.sliderLabel}>{recoveryEmojis[recoveryLevel].label}</span>
            </div>
            
            <button style={styles.whiteButton} onClick={() => goToScreen('mood-check')}>
              continue
            </button>
          </div>
        )}

        {/* ===== MOOD CHECK (Teal Screen) ===== */}
        {screen === 'mood-check' && (
          <div style={styles.tealScreen} className="fade-in">
            <h2 style={styles.checkQuestion}>
              how are you<br/>feeling today?
            </h2>
            
            <div style={styles.sliderSection}>
              <span style={styles.bigSliderEmoji}>{moodEmojis[moodLevel].emoji}</span>
              <input
                type="range"
                min="0"
                max="4"
                value={moodLevel}
                onChange={(e) => setMoodLevel(parseInt(e.target.value))}
                style={{
                  ...styles.slider,
                  background: `linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) ${moodLevel * 25}%, rgba(255,255,255,0.3) ${moodLevel * 25}%, rgba(255,255,255,0.3) 100%)`,
                }}
              />
              <span style={styles.sliderLabel}>{moodEmojis[moodLevel].label}</span>
            </div>
            
            <button style={styles.whiteButton} onClick={handleCheckInComplete}>
              continue
            </button>
          </div>
        )}

        {/* ===== REFLECTION SCREEN ===== */}
        {screen === 'reflection' && (
          <div style={styles.whiteScreen} className="fade-in">
            <div style={styles.reflectionHeader}>
              <h2 style={styles.reflectionTitle}>let's reflect</h2>
              <p style={styles.reflectionSubtitle}>
                tap 'i've reflected today 🙏' once complete
              </p>
            </div>
            
            <div style={styles.reflectionCard}>
              <p style={styles.reflectionText}>{reflection}</p>
            </div>
            
            <div style={styles.wisdomCard}>
              <span style={styles.wisdomLabel}>thought of the day</span>
              <p style={styles.wisdomText}>{dailyQuote.text}</p>
              <span style={styles.wisdomSource}>{dailyQuote.source}</span>
            </div>
            
            {recoveryLevel <= 1 && (
              <div style={styles.emergencyCard}>
                <span style={styles.emergencyIcon}>📞</span>
                <p style={styles.emergencyText}>
                  Need support? AA Hotline: <strong>1-800-839-1686</strong>
                </p>
              </div>
            )}
            
            <button style={styles.orangeButton} onClick={() => goToScreen('journey')}>
              i've reflected today 🙏
            </button>
          </div>
        )}

        {/* ===== JOURNEY/STATS SCREEN ===== */}
        {screen === 'journey' && (
          <div style={styles.whiteScreen} className="fade-in">
            <div style={styles.journeyHeader}>
              <h2 style={styles.journeyTitle}>your journey</h2>
              <p style={styles.journeySubtitle}>tracking your recovery progress</p>
              
              <div style={styles.timeTabs}>
                <span style={styles.timeTab}>7D</span>
                <span style={{...styles.timeTab, ...styles.timeTabActive}}>30D</span>
                <span style={styles.timeTab}>3M</span>
                <span style={styles.timeTab}>1Y</span>
              </div>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #FF7043, #E64A19)'}}>
                <span style={styles.statEmoji}>🔥</span>
                <span style={styles.statNumber}>{sobrietyDays || streak}</span>
                <span style={styles.statLabel}>current streak</span>
                <span style={styles.statUnit}>days</span>
              </div>
              
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #42A5F5, #1976D2)'}}>
                <span style={styles.statEmoji}>🙏</span>
                <span style={styles.statNumber}>{totalCheckins}</span>
                <span style={styles.statLabel}>total check-ins</span>
                <span style={styles.statUnit}>reflections</span>
              </div>
              
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #9CCC65, #689F38)'}}>
                <span style={styles.statEmoji}>💪</span>
                <span style={styles.statNumber}>{(recoveryLevel + 1).toFixed(1)}</span>
                <span style={styles.statLabel}>avg recovery</span>
                <span style={styles.statUnit}>{recoveryEmojis[recoveryLevel].label}</span>
              </div>
              
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4FC3F7, #0288D1)'}}>
                <span style={styles.statEmoji}>😊</span>
                <span style={styles.statNumber}>{(moodLevel + 1).toFixed(1)}</span>
                <span style={styles.statLabel}>avg mood</span>
                <span style={styles.statUnit}>{moodEmojis[moodLevel].label}</span>
              </div>
            </div>
            
            <button style={styles.orangeButton} onClick={() => goToScreen('unlocked')}>
              continue
            </button>
          </div>
        )}

        {/* ===== UNLOCKED SCREEN ===== */}
        {screen === 'unlocked' && (
          <div style={styles.whiteScreen} className="fade-in">
            <div style={styles.unlockedContent}>
              <span style={styles.unlockEmoji}>🔓</span>
              <h2 style={styles.unlockedTitle}>apps unlocked</h2>
              <p style={styles.unlockedText}>go with intention, not impulse</p>
              
              <div style={styles.nextLockBox}>
                <span style={styles.nextLockLabel}>next check-in in:</span>
                <div style={styles.lockTimeOptions}>
                  <button style={styles.timeOption}>30m</button>
                  <button style={{...styles.timeOption, ...styles.timeOptionActive}}>1hr</button>
                  <button style={styles.timeOption}>2hr</button>
                </div>
              </div>
              
              <div style={styles.downloadCTA}>
                <h3 style={styles.ctaTitle}>Get the full app</h3>
                <p style={styles.ctaText}>Download Recovery Lock for real app blocking + notifications</p>
                <div style={styles.storeButtons}>
                  <button style={styles.storeButton}>
                    <span>📱</span> Android (Coming Soon)
                  </button>
                  <button style={{...styles.storeButton, opacity: 0.6}}>
                    <span>🍎</span> iOS (Coming Soon)
                  </button>
                </div>
              </div>
              
              <button 
                style={styles.secondaryButton} 
                onClick={() => {
                  setRecoveryLevel(2)
                  setMoodLevel(2)
                  goToScreen('recovery-check')
                }}
              >
                do another check-in
              </button>
              
              <p style={styles.emergencyLink}>
                📞 Need help? AA Hotline: 1-800-839-1686
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGradient: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(180deg, #FF8C00 0%, #FF6B00 100%)',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    maxWidth: '500px',
    margin: '0 auto',
  },
  
  // Splash
  splashScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: '#fff',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: '24px',
  },
  logo: {
    fontSize: '80px',
    background: 'linear-gradient(135deg, #FF9800, #FF6B00)',
    borderRadius: '28px',
    padding: '20px 28px',
    boxShadow: '0 10px 40px rgba(255,107,0,0.4)',
  },
  logoGlow: {
    position: 'absolute',
    inset: '-20px',
    background: 'radial-gradient(circle, rgba(255,152,0,0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    zIndex: -1,
  },
  appTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
  },
  splashTagline: {
    fontSize: '16px',
    color: '#888',
    marginBottom: '40px',
  },
  loader: {
    width: '60px',
    height: '4px',
    background: '#eee',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  loaderBar: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #FF9800, #FF6B00)',
    animation: 'loading 2s ease-in-out',
  },
  
  // White screen base
  whiteScreen: {
    minHeight: '100vh',
    background: '#fff',
    padding: '60px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
  },
  
  // Dark screen base
  darkScreen: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #4a4a4a 0%, #2d2d2d 100%)',
    padding: '60px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  // Green screen (recovery check)
  greenScreen: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)',
    padding: '60px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Teal screen (mood check)
  tealScreen: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #00BCD4 0%, #0097A7 100%)',
    padding: '60px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Screen time shock
  shockContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  shockLine: {
    fontSize: '22px',
    color: '#333',
    lineHeight: 1.4,
  },
  orangeHighlight: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  shockQuestion: {
    fontSize: '22px',
    color: '#333',
    lineHeight: 1.4,
  },
  
  // Centered content
  centeredContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  bigEmoji: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  darkHeading: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
  },
  darkSubtext: {
    fontSize: '16px',
    color: '#888',
    marginBottom: '24px',
  },
  dateInput: {
    fontSize: '18px',
    padding: '16px 24px',
    borderRadius: '16px',
    border: '2px solid #eee',
    width: '100%',
    maxWidth: '300px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  sobrietyPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(255,152,0,0.1), rgba(255,107,0,0.1))',
    borderRadius: '20px',
    marginBottom: '24px',
  },
  previewNumber: {
    fontSize: '56px',
    fontWeight: '800',
    color: '#FF6B00',
  },
  previewLabel: {
    fontSize: '16px',
    color: '#666',
  },
  
  // Streak display
  streakDisplay: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  fireEmoji: {
    fontSize: '56px',
    display: 'block',
    marginBottom: '8px',
  },
  streakNumber: {
    fontSize: '80px',
    fontWeight: '800',
    color: '#fff',
    display: 'block',
    lineHeight: 1,
  },
  streakLabel: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.8)',
    display: 'block',
  },
  streakMessage: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '16px',
    maxWidth: '250px',
    lineHeight: 1.5,
  },
  weekCalendar: {
    display: 'flex',
    gap: '10px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '16px 20px',
    marginBottom: '32px',
  },
  calendarDay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  dayName: {
    fontSize: '12px',
    color: '#999',
    fontWeight: '500',
  },
  dayCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  dayCircleActive: {
    background: 'linear-gradient(135deg, #FF9800, #FF6B00)',
    color: '#fff',
  },
  dayCircleInactive: {
    background: '#eee',
    color: '#ccc',
  },
  
  // How it works
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '32px',
    textAlign: 'center',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    marginBottom: '32px',
  },
  stepItem: {
    display: 'flex',
    gap: '16px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '16px',
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #7C4DFF, #536DFE)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  stepDesc: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
  },
  
  // Slider section
  checkQuestion: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '48px',
    lineHeight: 1.3,
  },
  sliderSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    width: '100%',
    marginBottom: '48px',
  },
  bigSliderEmoji: {
    fontSize: '72px',
    transition: 'all 0.2s ease',
  },
  slider: {
    width: '80%',
    maxWidth: '300px',
  },
  sliderLabel: {
    fontSize: '18px',
    color: '#fff',
    fontWeight: '500',
  },
  
  // Reflection screen
  reflectionHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  reflectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px',
  },
  reflectionSubtitle: {
    fontSize: '14px',
    color: '#999',
  },
  reflectionCard: {
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  reflectionText: {
    fontSize: '17px',
    color: '#333',
    lineHeight: 1.7,
  },
  wisdomCard: {
    background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid #FFE082',
  },
  wisdomLabel: {
    fontSize: '12px',
    color: '#FF6B00',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  wisdomText: {
    fontSize: '16px',
    color: '#333',
    lineHeight: 1.6,
    margin: '12px 0',
  },
  wisdomSource: {
    fontSize: '14px',
    color: '#FF6B00',
    fontWeight: '500',
  },
  emergencyCard: {
    background: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #EF9A9A',
  },
  emergencyIcon: {
    fontSize: '24px',
  },
  emergencyText: {
    fontSize: '14px',
    color: '#C62828',
  },
  
  // Journey screen
  journeyHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  journeyTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#333',
    fontStyle: 'italic',
    marginBottom: '4px',
  },
  journeySubtitle: {
    fontSize: '14px',
    color: '#999',
    marginBottom: '16px',
  },
  timeTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  timeTab: {
    padding: '8px 18px',
    fontSize: '14px',
    color: '#999',
    fontWeight: '500',
    borderRadius: '12px',
  },
  timeTabActive: {
    background: '#f0f0f0',
    color: '#333',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    borderRadius: '20px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
  },
  statEmoji: {
    fontSize: '20px',
    marginBottom: '8px',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '800',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '12px',
    opacity: 0.85,
    marginTop: '8px',
  },
  statUnit: {
    fontSize: '11px',
    opacity: 0.65,
  },
  
  // Unlocked screen
  unlockedContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  unlockEmoji: {
    fontSize: '72px',
    marginBottom: '16px',
    animation: 'bounce 0.6s ease',
  },
  unlockedTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
  },
  unlockedText: {
    fontSize: '16px',
    color: '#888',
    marginBottom: '32px',
  },
  nextLockBox: {
    background: '#f5f5f5',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '24px',
    width: '100%',
  },
  nextLockLabel: {
    fontSize: '14px',
    color: '#888',
    display: 'block',
    marginBottom: '16px',
  },
  lockTimeOptions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  timeOption: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: '2px solid #eee',
    background: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    color: '#888',
    cursor: 'pointer',
  },
  timeOptionActive: {
    background: 'linear-gradient(135deg, #FF9800, #FF6B00)',
    border: '2px solid #FF6B00',
    color: '#fff',
  },
  downloadCTA: {
    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    width: '100%',
    border: '1px solid #dee2e6',
  },
  ctaTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
  },
  ctaText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  storeButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  storeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: '#333',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  emergencyLink: {
    fontSize: '14px',
    color: '#888',
    marginTop: '16px',
  },
  
  // Buttons
  orangeButton: {
    background: 'linear-gradient(135deg, #FF9800, #FF6B00)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '18px 48px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 20px rgba(255,107,0,0.3)',
  },
  whiteButton: {
    background: 'rgba(255,255,255,0.95)',
    color: '#FF6B00',
    border: 'none',
    borderRadius: '16px',
    padding: '18px 48px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '300px',
  },
  secondaryButton: {
    background: 'transparent',
    color: '#FF6B00',
    border: '2px solid #FF6B00',
    borderRadius: '16px',
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  textButton: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '15px',
    padding: '12px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  textButtonLight: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '15px',
    padding: '12px',
    cursor: 'pointer',
    marginTop: '8px',
  },
}
