'use client';

import { useState, useEffect } from 'react';

// Types
interface UserProfile {
  name: string;
  sobrietyDate: string;
  motivation: string;
  onboardingComplete: boolean;
  recoveryProgram: string;  // AA, NA, CA, GA, OA, SA, ACA, Al-Anon, other
  primaryChallenge: string; // User's self-described challenge/pattern
  checkInMode: 'everytime' | 'scheduled'; // How often to check in
  supportPersonName?: string; // Sponsor, friend, family, counselor, pastor
  supportPersonPhone?: string; // Quick-dial in crisis
  email?: string; // For subscription tracking
  trialStartDate?: string; // When free trial began
}

interface SubscriptionStatus {
  active: boolean;
  status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';
  trialEnd?: number;
  currentPeriodEnd?: number;
  customerId?: string;
}

interface CheckInEntry {
  id: string;
  date: string;
  emotionalState: number;
  cravingLevel: number;
  reflection: string;
  title: string;
  source: string;
}

// Free trial duration in days
const FREE_TRIAL_DAYS = 5;

// Check if user is in free trial period (local, before Stripe)
function isInFreeTrial(trialStartDate?: string): boolean {
  if (!trialStartDate) return true; // New user, hasn't started trial yet
  const start = new Date(trialStartDate);
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceStart < FREE_TRIAL_DAYS;
}

function getDaysLeftInTrial(trialStartDate?: string): number {
  if (!trialStartDate) return FREE_TRIAL_DAYS;
  const start = new Date(trialStartDate);
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, FREE_TRIAL_DAYS - daysSinceStart);
}

// Calculate days sober
function getDaysSober(sobrietyDate: string): number {
  const start = new Date(sobrietyDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

// Get streak from history
function getStreak(history: CheckInEntry[]): number {
  if (history.length === 0) return 0;
  
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const entry of sortedHistory) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }
  
  return streak;
}

// Emotional state labels
const emotionLabels = ['😔', '😕', '😐', '🙂', '😊'];
const cravingLabels = ['None', 'Low', 'Medium', 'High', 'Intense'];

// The 12 Steps mapped to months for rotating wisdom
const twelveSteps = [
  { step: 1, name: "Powerlessness", principle: "Honesty", quote: "We admitted we were powerless over alcohol—that our lives had become unmanageable." },
  { step: 2, name: "Hope", principle: "Hope", quote: "Came to believe that a Power greater than ourselves could restore us to sanity." },
  { step: 3, name: "Faith", principle: "Faith", quote: "Made a decision to turn our will and our lives over to the care of God as we understood Him." },
  { step: 4, name: "Courage", principle: "Courage", quote: "Made a searching and fearless moral inventory of ourselves." },
  { step: 5, name: "Integrity", principle: "Integrity", quote: "Admitted to God, to ourselves, and to another human being the exact nature of our wrongs." },
  { step: 6, name: "Willingness", principle: "Willingness", quote: "Were entirely ready to have God remove all these defects of character." },
  { step: 7, name: "Humility", principle: "Humility", quote: "Humbly asked Him to remove our shortcomings." },
  { step: 8, name: "Brotherly Love", principle: "Love", quote: "Made a list of all persons we had harmed, and became willing to make amends to them all." },
  { step: 9, name: "Justice", principle: "Justice", quote: "Made direct amends to such people wherever possible, except when to do so would injure them or others." },
  { step: 10, name: "Perseverance", principle: "Perseverance", quote: "Continued to take personal inventory and when we were wrong promptly admitted it." },
  { step: 11, name: "Spiritual Awareness", principle: "Awareness", quote: "Sought through prayer and meditation to improve our conscious contact with God as we understood Him." },
  { step: 12, name: "Service", principle: "Service", quote: "Having had a spiritual awakening as the result of these steps, we tried to carry this message to alcoholics, and to practice these principles in all our affairs." },
];

// Supplementary quotes for variety within the month
const stepQuotes: { [key: number]: string[] } = {
  1: ["Surrender is not defeat—it's the beginning of victory.", "In admitting powerlessness, we find our true power."],
  2: ["Hope is the thing with feathers that perches in the soul.", "Sanity begins with believing it's possible."],
  3: ["Let go and let God.", "Turn it over—you were never meant to carry it alone."],
  4: ["Know thyself.", "The unexamined life is not worth living."],
  5: ["We are only as sick as our secrets.", "Freedom comes from sharing our truth."],
  6: ["Readiness is all.", "Willingness opens doors that force cannot."],
  7: ["True humility is not thinking less of yourself; it's thinking of yourself less.", "Ask, and it shall be given."],
  8: ["To err is human; to forgive, divine.", "Healing relationships begins with willingness."],
  9: ["Actions speak louder than words.", "Making amends is making peace."],
  10: ["Progress, not perfection.", "Daily inventory keeps the soul clean."],
  11: ["Be still and know.", "Prayer is talking to God; meditation is listening."],
  12: ["We keep what we have by giving it away.", "Service is gratitude in action."],
};

export default function RecoveryLock() {
  const [screen, setScreen] = useState<'loading' | 'onboarding' | 'home' | 'checkin-emotion' | 'checkin-craving' | 'checkin-feelings' | 'generating' | 'reflection' | 'history' | 'paywall'>('loading');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({ name: '', sobrietyDate: '', motivation: '', onboardingComplete: false, recoveryProgram: '', primaryChallenge: '', checkInMode: 'scheduled' });
  const [history, setHistory] = useState<CheckInEntry[]>([]);
  const [emotionalState, setEmotionalState] = useState(2);
  const [cravingLevel, setCravingLevel] = useState(1);
  const [feelingsText, setFeelingsText] = useState('');
  const [currentReflection, setCurrentReflection] = useState<CheckInEntry | null>(null);
  const [currentStep, setCurrentStep] = useState(twelveSteps[0]);
  const [dailyQuote, setDailyQuote] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionStatus>({ active: false, status: 'none' });
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [showReviewThanks, setShowReviewThanks] = useState(false);

  // Check subscription status
  const checkSubscription = async (email?: string, sessionId?: string) => {
    try {
      const response = await fetch('/api/stripe/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sessionId })
      });
      const data = await response.json();
      setSubscription(data);
      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { active: false, status: 'none' };
    }
  };

  // Handle checkout
  const handleCheckout = async (plan: 'weekly' | 'yearly') => {
    setIsCheckingSubscription(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: profile.email })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
    setIsCheckingSubscription(false);
  };

  // Check if user has access (free trial or active subscription)
  const hasAccess = () => {
    // If subscription is active or trialing via Stripe, they have access
    if (subscription.active) return true;
    // Otherwise check local free trial
    return isInFreeTrial(profile.trialStartDate);
  };

  // Load profile and history from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('recoverylock_profile');
    const savedHistory = localStorage.getItem('recoverylock_history');
    
    // Set current month's step
    const month = new Date().getMonth();
    setCurrentStep(twelveSteps[month]);
    
    // Get a quote - rotate through step quotes based on day of month
    const dayOfMonth = new Date().getDate();
    const quotes = stepQuotes[month + 1];
    const quoteIndex = dayOfMonth % quotes.length;
    setDailyQuote(quotes[quoteIndex]);

    // Check URL params for successful checkout
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');
    
    // Initialize profile
    let currentProfile: UserProfile | null = null;
    if (savedProfile) {
      currentProfile = JSON.parse(savedProfile) as UserProfile;
      setProfile(currentProfile);
    }
    
    // If coming back from successful checkout, verify subscription
    if (success === 'true' && sessionId) {
      checkSubscription(currentProfile?.email, sessionId).then(() => {
        // Clear URL params
        window.history.replaceState({}, '', '/');
        
        if (currentProfile?.onboardingComplete) {
          setScreen('home');
        } else {
          setScreen('onboarding');
        }
      });
    } else if (currentProfile) {
      // Check subscription status if user has email
      if (currentProfile.email) {
        checkSubscription(currentProfile.email);
      }
      
      if (currentProfile.onboardingComplete) {
        // Check if they have access before showing home
        if (isInFreeTrial(currentProfile.trialStartDate)) {
          setScreen('home');
        } else {
          setScreen('paywall');
        }
      } else {
        setScreen('onboarding');
      }
    } else {
      setScreen('onboarding');
    }
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save profile to localStorage
  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('recoverylock_profile', JSON.stringify(newProfile));
  };

  // Save history to localStorage
  const saveHistory = (newHistory: CheckInEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem('recoverylock_history', JSON.stringify(newHistory));
  };

  // Generate reflection using AI
  const generateReflection = async () => {
    setScreen('generating');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          daysSober: getDaysSober(profile.sobrietyDate),
          motivation: profile.motivation,
          emotionalState,
          cravingLevel,
          feelingsText,
          checkInCount: history.length + 1,
          recoveryProgram: profile.recoveryProgram,
          primaryChallenge: profile.primaryChallenge
        })
      });
      
      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      
      const newEntry: CheckInEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        emotionalState,
        cravingLevel,
        reflection: data.reflection,
        title: data.title,
        source: data.source
      };
      
      setCurrentReflection(newEntry);
      saveHistory([newEntry, ...history]);
      setScreen('reflection');
    } catch (error) {
      console.error('Generation failed:', error);
      // Fallback reflection based on emotional state
      const fallbackTitles = ['Strength', 'Courage', 'Hope', 'Serenity', 'Gratitude'];
      const emotionMessages = [
        `${profile.name}, even on the hardest days, showing up matters. You've made it ${getDaysSober(profile.sobrietyDate)} days. That takes incredible strength. Be gentle with yourself today.`,
        `${profile.name}, feeling uncertain is part of the journey. ${getDaysSober(profile.sobrietyDate)} days proves you can do hard things. Take it one moment at a time.`,
        `${profile.name}, steady progress is still progress. ${getDaysSober(profile.sobrietyDate)} days of choosing yourself, every single day. Keep going.`,
        `${profile.name}, you're doing great. ${getDaysSober(profile.sobrietyDate)} days of recovery shows your commitment. Celebrate this moment.`,
        `${profile.name}, what a gift today is. ${getDaysSober(profile.sobrietyDate)} days of freedom. Your perseverance is inspiring.`
      ];
      
      const fallbackEntry: CheckInEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        emotionalState,
        cravingLevel,
        reflection: emotionMessages[emotionalState],
        title: fallbackTitles[emotionalState],
        source: 'Recovery Lock'
      };
      setCurrentReflection(fallbackEntry);
      saveHistory([fallbackEntry, ...history]);
      setScreen('reflection');
    }
  };

  // Loading screen
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="relative mb-6">
          <div className="text-7xl animate-pulse">🔒</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">recovery lock</h1>
        <p className="text-gray-500 mt-2">your daily commitment to recovery</p>
      </div>
    );
  }

  // Onboarding - Story-driven commitment ceremony
  if (screen === 'onboarding') {
    // Shared styles
    const screenStyle: React.CSSProperties = {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: 'white'
    };
    const buttonStyle: React.CSSProperties = {
      width: '100%',
      maxWidth: '320px',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '9999px',
      fontSize: '18px',
      border: 'none',
      cursor: 'pointer'
    };

    const screens = [
      // 0. Opening - Dramatic hook
      <div key="hook" style={{ ...screenStyle, background: '#000' }}>
        <div style={{ fontSize: '64px', marginBottom: '32px', opacity: 0.8 }}>📱</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', lineHeight: 1.2 }}>
          Your phone knows your secrets.
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '48px', textAlign: 'center', maxWidth: '320px' }}>
          It knows when you&apos;re vulnerable. When you&apos;re bored. When you&apos;re lonely.
        </p>
        <button
          onClick={() => setOnboardingStep(1)}
          style={{ ...buttonStyle, background: 'white', color: 'black' }}
        >
          Continue
        </button>
      </div>,

      // 1. The problem deepens
      <div key="problem" style={{ ...screenStyle, background: '#000' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
          And it uses that against you.
        </h2>
        <div style={{ marginBottom: '32px', maxWidth: '320px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '16px' }}>Every notification. Every scroll. Every distraction.</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '16px' }}>Designed to pull you away from what matters.</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Away from your recovery.</p>
        </div>
        <button
          onClick={() => setOnboardingStep(2)}
          style={{ ...buttonStyle, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          I know the feeling
        </button>
      </div>,

      // 2. Statistics - emotional impact
      <div key="stats" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '16px', letterSpacing: '1px' }}>THE AVERAGE PERSON</p>
        <div style={{ fontSize: '80px', fontWeight: 'bold', color: '#f97316', marginBottom: '8px' }}>96</div>
        <p style={{ fontSize: '22px', marginBottom: '32px' }}>phone pickups per day</p>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', maxWidth: '320px', marginBottom: '32px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: '15px', lineHeight: 1.6 }}>
            That&apos;s 96 moments where your addiction whispers.<br/>
            96 chances to slip.<br/>
            96 times you could choose differently.
          </p>
        </div>
        <button
          onClick={() => setOnboardingStep(3)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          What if I could change that?
        </button>
      </div>,

      // 3. The vision / transformation
      <div key="vision" style={{ ...screenStyle, background: 'linear-gradient(to bottom, #ea580c, #c2410c)' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>✨</div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          What if every unlock<br/>strengthened your recovery?
        </h2>
        <div style={{ marginBottom: '32px', maxWidth: '320px' }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: '12px' }}>A moment to pause.</p>
          <p style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: '12px' }}>A moment to breathe.</p>
          <p style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>A moment to remember who you&apos;re becoming.</p>
        </div>
        <button
          onClick={() => setOnboardingStep(4)}
          style={{ ...buttonStyle, background: 'white', color: '#ea580c', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          Show me how
        </button>
      </div>,

      // 4. How it works - step 1
      <div key="how1" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '16px', letterSpacing: '1px' }}>HOW IT WORKS</p>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>1️⃣</div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          You reach for your phone
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
          The same automatic gesture. The same habitual reach. But this time, something different happens.
        </p>
        <button
          onClick={() => setOnboardingStep(5)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          Next
        </button>
      </div>,

      // 5. How it works - step 2
      <div key="how2" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '16px', letterSpacing: '1px' }}>HOW IT WORKS</p>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>2️⃣</div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          Recovery Lock asks:<br/>&quot;How are you feeling?&quot;
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
          A simple check-in. Your emotional state. Your craving level. Just honest awareness.
        </p>
        <button
          onClick={() => setOnboardingStep(6)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          Next
        </button>
      </div>,

      // 6. How it works - step 3
      <div key="how3" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '16px', letterSpacing: '1px' }}>HOW IT WORKS</p>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>3️⃣</div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          You receive a personalized reflection
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
          Wisdom from the 12 steps. Crafted for exactly where you are in this moment. A gentle reminder of your strength.
        </p>
        <button
          onClick={() => setOnboardingStep(7)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          Next
        </button>
      </div>,

      // 7. How it works - result
      <div key="how4" style={{ ...screenStyle, background: 'linear-gradient(to bottom, #16a34a, #15803d)' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔓</div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          Then you continue,<br/>centered and present.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
          Not from avoidance. From awareness. Every unlock becomes a victory. Every day, you get stronger.
        </p>
        <button
          onClick={() => setOnboardingStep(8)}
          style={{ ...buttonStyle, background: 'white', color: '#15803d', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          I&apos;m ready to begin
        </button>
      </div>,

      // 8. Transition to personalization
      <div key="personalize-intro" style={{ ...screenStyle, background: '#1c1917' }}>
        <div style={{ fontSize: '56px', marginBottom: '24px' }}>🤝</div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          Let&apos;s make this yours.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
          A few questions to personalize your recovery experience. Everything stays private on your device.
        </p>
        <button
          onClick={() => setOnboardingStep(9)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          Let&apos;s do it
        </button>
      </div>,

      // 9. Name - warm and personal
      <div key="name" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>STEP 1 OF 5</p>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px' }}>What&apos;s your name?</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', textAlign: 'center' }}>So we can make this personal</p>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Your first name"
          style={{
            width: '100%',
            maxWidth: '320px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '20px',
            textAlign: 'center',
            marginBottom: '32px',
            color: 'white',
            outline: 'none'
          }}
          autoFocus
        />
        <button
          onClick={() => profile.name && setOnboardingStep(10)}
          disabled={!profile.name}
          style={{ ...buttonStyle, background: profile.name ? '#f97316' : 'rgba(249,115,22,0.5)', color: 'white' }}
        >
          Continue
        </button>
      </div>,

      // 10. Recovery program
      <div key="program" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>STEP 2 OF 5</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>What fellowship speaks to you, {profile.name}?</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>This helps us tailor your reflections</p>
        
        <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
          {[
            { id: 'AA', label: 'Alcoholics Anonymous (AA)', emoji: '🍷' },
            { id: 'NA', label: 'Narcotics Anonymous (NA)', emoji: '💊' },
            { id: 'CA', label: 'Cocaine Anonymous (CA)', emoji: '❄️' },
            { id: 'GA', label: 'Gamblers Anonymous (GA)', emoji: '🎰' },
            { id: 'OA', label: 'Overeaters Anonymous (OA)', emoji: '🍽️' },
            { id: 'SA', label: 'Sexaholics Anonymous (SA)', emoji: '💔' },
            { id: 'ACA', label: 'Adult Children of Alcoholics', emoji: '👨‍👩‍👧' },
            { id: 'Al-Anon', label: 'Al-Anon / Alateen', emoji: '💙' },
            { id: 'SLAA', label: 'Sex & Love Addicts Anonymous', emoji: '💕' },
            { id: 'DA', label: 'Debtors Anonymous (DA)', emoji: '💳' },
            { id: 'general', label: 'General Recovery / Other', emoji: '✨' },
          ].map((program) => (
            <button
              key={program.id}
              onClick={() => setProfile({ ...profile, recoveryProgram: program.id })}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: profile.recoveryProgram === program.id ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
                background: profile.recoveryProgram === program.id ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '20px' }}>{program.emoji}</span>
              <span style={{ fontSize: '14px' }}>{program.label}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => profile.recoveryProgram && setOnboardingStep(11)}
          disabled={!profile.recoveryProgram}
          style={{ ...buttonStyle, background: profile.recoveryProgram ? '#f97316' : 'rgba(249,115,22,0.5)', color: 'white' }}
        >
          Continue
        </button>
      </div>,

      // 11. Personal challenge - deeper
      <div key="challenge" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>STEP 3 OF 5</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>What are you working through?</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
          In your own words. This helps us understand your journey.
        </p>
        
        <textarea
          value={profile.primaryChallenge}
          onChange={(e) => setProfile({ ...profile, primaryChallenge: e.target.value })}
          placeholder="I'm working on..."
          rows={4}
          style={{
            width: '100%',
            maxWidth: '320px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            marginBottom: '16px',
            color: 'white',
            resize: 'none',
            outline: 'none'
          }}
        />
        
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '24px', textAlign: 'center' }}>
          🔒 Stored only on your device. Never shared.
        </p>
        
        <button
          onClick={() => setOnboardingStep(12)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          {profile.primaryChallenge ? 'Continue' : 'Skip for now'}
        </button>
      </div>,

      // 12. Sobriety date - milestone focused
      <div key="date" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>STEP 4 OF 5</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>When did your recovery journey begin?</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', textAlign: 'center', fontSize: '14px' }}>This can be your sobriety date, or when you committed to change</p>
        <input
          type="date"
          value={profile.sobrietyDate}
          onChange={(e) => setProfile({ ...profile, sobrietyDate: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          style={{
            width: '100%',
            maxWidth: '320px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '18px',
            textAlign: 'center',
            marginBottom: '32px',
            color: 'white',
            colorScheme: 'dark',
            outline: 'none'
          }}
        />
        <button
          onClick={() => profile.sobrietyDate && setOnboardingStep(13)}
          disabled={!profile.sobrietyDate}
          style={{ ...buttonStyle, background: profile.sobrietyDate ? '#f97316' : 'rgba(249,115,22,0.5)', color: 'white' }}
        >
          Continue
        </button>
      </div>,

      // 13. Why - the deep motivation
      <div key="why" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>STEP 5 OF 6</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Why does recovery matter to you?</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
          This is your anchor. We&apos;ll remind you of it when things get hard.
        </p>
        <textarea
          value={profile.motivation}
          onChange={(e) => setProfile({ ...profile, motivation: e.target.value })}
          placeholder="I'm doing this because..."
          rows={4}
          style={{
            width: '100%',
            maxWidth: '320px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            marginBottom: '32px',
            color: 'white',
            resize: 'none',
            outline: 'none'
          }}
        />
        <button
          onClick={() => setOnboardingStep(14)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          {profile.motivation ? 'Continue' : 'Skip for now'}
        </button>
      </div>,

      // 14. Support Person - who to call in crisis
      <div key="support-person" style={{ ...screenStyle, background: '#1c1917', paddingTop: '40px' }}>
        {/* EMERGENCY BANNER - PROMINENT */}
        <div style={{
          background: '#dc2626',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          width: '100%',
          maxWidth: '340px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
        }}>
          <p style={{ color: 'white', fontSize: '14px', textAlign: 'center', margin: 0, fontWeight: '600', marginBottom: '8px' }}>
            🚨 If your life is in danger, call now:
          </p>
          <p style={{ color: 'white', fontSize: '13px', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            <strong>911</strong> (US/CA) • <strong>999</strong> (UK) • <strong>112</strong> (EU)<br/>
            <strong>000</strong> (AU) • <strong>111</strong> (NZ) • <strong>108</strong> (IN)
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', textAlign: 'center', margin: 0, marginTop: '8px' }}>
            Suicide Hotline: <strong>988</strong> (US) • <strong>116 123</strong> (UK)
          </p>
        </div>

        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>STEP 6 OF 6</p>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          Who can you call when it gets hard?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px', textAlign: 'center', fontSize: '14px', padding: '0 16px', lineHeight: 1.5 }}>
          Your sponsor, trusted friend, family member, counselor, or pastor. One tap away can make all the difference.
        </p>
        
        <input
          type="text"
          value={profile.supportPersonName || ''}
          onChange={(e) => setProfile({ ...profile, supportPersonName: e.target.value })}
          placeholder="Their name (optional)"
          style={{
            width: '100%',
            maxWidth: '320px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            marginBottom: '12px',
            color: 'white',
            outline: 'none'
          }}
        />
        
        <input
          type="tel"
          value={profile.supportPersonPhone || ''}
          onChange={(e) => setProfile({ ...profile, supportPersonPhone: e.target.value })}
          placeholder="Their phone number (optional)"
          style={{
            width: '100%',
            maxWidth: '320px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            marginBottom: '16px',
            color: 'white',
            outline: 'none'
          }}
        />
        
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '24px', textAlign: 'center' }}>
          🔒 Stored only on your device. Never shared.
        </p>
        
        <button
          onClick={() => setOnboardingStep(15)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          {profile.supportPersonPhone ? 'Save & Continue' : 'Skip for now'}
        </button>
      </div>,

      // 15. Check-in mode selection - let user choose intensity
      <div key="checkin-mode" style={{ ...screenStyle, background: '#1c1917' }}>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '8px', letterSpacing: '1px' }}>CHOOSE YOUR STYLE</p>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          How often do you want to check in?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
          You can change this later in settings
        </p>
        
        <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {/* Every App Open option */}
          <button
            onClick={() => setProfile({ ...profile, checkInMode: 'everytime' })}
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: '16px',
              border: profile.checkInMode === 'everytime' ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
              background: profile.checkInMode === 'everytime' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>🔥</span>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Every App Open</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginLeft: '40px' }}>
              Block distracting apps. Check in each time you try to open them. Maximum accountability.
            </p>
            <p style={{ fontSize: '12px', color: '#f97316', marginLeft: '40px', marginTop: '8px' }}>
              ⚡ 10-50+ check-ins per day
            </p>
          </button>

          {/* Scheduled option */}
          <button
            onClick={() => setProfile({ ...profile, checkInMode: 'scheduled' })}
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: '16px',
              border: profile.checkInMode === 'scheduled' ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
              background: profile.checkInMode === 'scheduled' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>🌅</span>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>3 Times Daily</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginLeft: '40px' }}>
              Morning, noon, and night. Deeper reflections at key moments. Sustainable routine.
            </p>
            <p style={{ fontSize: '12px', color: '#22c55e', marginLeft: '40px', marginTop: '8px' }}>
              ✨ Recommended for beginners
            </p>
          </button>
        </div>
        
        <button
          onClick={() => setOnboardingStep(16)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          Continue
        </button>
      </div>,

      // 16. First experience - live demo check-in
      <div key="demo-intro" style={{ ...screenStyle, background: 'linear-gradient(to bottom, #f97316, #ea580c)' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎯</div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          Let&apos;s try your first check-in together.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
          {profile.checkInMode === 'everytime' 
            ? "This is what you'll experience every time you open a blocked app. Takes about 30 seconds."
            : "This is what you'll experience during your daily check-ins. Takes about 30 seconds."
          }
        </p>
        <button
          onClick={() => setOnboardingStep(23)}
          style={{ ...buttonStyle, background: 'white', color: '#ea580c', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          Try it now
        </button>
      </div>,

      // 17. Demo - Emotion slider
      <div key="demo-emotion" style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #10b981, #059669)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white'
      }}>
        <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>SAMPLE CHECK-IN</p>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>
          {emotionLabels[emotionalState]}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          How are you feeling right now?
        </h2>
        <p style={{ opacity: 0.8, marginBottom: '32px' }}>Be honest with yourself</p>
        <input
          type="range"
          min="0"
          max="4"
          value={emotionalState}
          onChange={(e) => setEmotionalState(Number(e.target.value))}
          style={{ width: '100%', maxWidth: '280px', marginBottom: '40px' }}
        />
        <button
          onClick={() => setOnboardingStep(23)}
          style={{
            width: '100%',
            maxWidth: '280px',
            background: 'white',
            color: '#059669',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '9999px',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Next
        </button>
      </div>,

      // 18. Demo - Craving slider
      <div key="demo-craving" style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f43f5e, #e11d48)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white'
      }}>
        <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>SAMPLE CHECK-IN</p>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
          {['😌', '🙂', '😐', '😰', '🔥'][cravingLevel]}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          Any cravings right now?
        </h2>
        <p style={{ opacity: 0.8, marginBottom: '8px' }}>{cravingLabels[cravingLevel]}</p>
        <input
          type="range"
          min="0"
          max="4"
          value={cravingLevel}
          onChange={(e) => setCravingLevel(Number(e.target.value))}
          style={{ width: '100%', maxWidth: '280px', marginBottom: '40px' }}
        />
        <button
          onClick={() => setOnboardingStep(23)}
          style={{
            width: '100%',
            maxWidth: '280px',
            background: 'white',
            color: '#e11d48',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '9999px',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          See my reflection
        </button>
      </div>,

      // 19. Demo - Sample reflection
      <div key="demo-reflection" style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f97316, #ea580c)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🙏</div>
        <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '16px', letterSpacing: '2px' }}>YOUR REFLECTION</p>
        <p style={{ fontSize: '18px', textAlign: 'center', lineHeight: '1.7', marginBottom: '24px', maxWidth: '320px', fontStyle: 'italic' }}>
          &quot;{profile.name}, you showed up today. That matters. Even when it&apos;s hard, even when you don&apos;t feel strong, you&apos;re here. One moment at a time. One breath at a time. You are exactly where you need to be.&quot;
        </p>
        <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '32px' }}>— Step 1: Honesty</p>
        <button
          onClick={() => setOnboardingStep(23)}
          style={{
            width: '100%',
            maxWidth: '280px',
            background: 'white',
            color: '#ea580c',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '9999px',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          That was powerful
        </button>
      </div>,

      // 20. Ask for review - EMOTIONAL PEAK (8-10 min mark)
      <div key="review-ask" style={{ ...screenStyle, background: '#1c1917' }}>
        {!showReviewThanks ? (
          <>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⭐</div>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
              You just completed your first check-in!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
              If this resonated with you, would you take 10 seconds to rate us? It helps others in recovery find this tool.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setReviewRating(star);
                    // Show thank you briefly, then continue
                    setShowReviewThanks(true);
                    setTimeout(() => {
                      setShowReviewThanks(false);
                      setOnboardingStep(23);
                    }, 2000);
                  }}
                  onMouseEnter={() => setReviewRating(star)}
                  onMouseLeave={() => setReviewRating(0)}
                  style={{ 
                    fontSize: '40px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    transform: reviewRating >= star ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                    filter: reviewRating >= star ? 'brightness(1.2)' : 'brightness(0.7)'
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
            <button
              onClick={() => setOnboardingStep(23)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer' }}
            >
              Maybe later
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>💜</div>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
              Thank you!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '320px' }}>
              Your support means the world to us and helps others find their path to recovery.
            </p>
          </>
        )}
      </div>,

      // 21. Commitment ceremony intro
      <div key="commitment-intro" style={{ ...screenStyle, background: '#000' }}>
        <div style={{ fontSize: '56px', marginBottom: '24px' }}>🕯️</div>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          One last thing, {profile.name}.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '320px', marginBottom: '32px' }}>
          Recovery isn&apos;t just about stopping something. It&apos;s about becoming someone. Let&apos;s make a commitment together.
        </p>
        <button
          onClick={() => setOnboardingStep(23)}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          I&apos;m ready
        </button>
      </div>,

      // 22. The Commitment - sacred moment
      <div key="commitment" style={{ ...screenStyle, background: 'linear-gradient(to bottom, #1c1917, #292524)' }}>
        <div style={{ fontSize: '48px', marginBottom: '32px' }}>🔥</div>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '24px', letterSpacing: '3px' }}>MY COMMITMENT</p>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', maxWidth: '340px', marginBottom: '32px' }}>
          <p style={{ fontSize: '18px', textAlign: 'center', lineHeight: 1.6 }}>
            I, <span style={{ color: '#fb923c', fontWeight: '600' }}>{profile.name}</span>, commit to showing up for my recovery.
          </p>
          <p style={{ fontSize: '18px', textAlign: 'center', lineHeight: 1.6, marginTop: '16px' }}>
            Not perfectly. Not fearlessly. But honestly.
          </p>
          <p style={{ fontSize: '18px', textAlign: 'center', lineHeight: 1.6, marginTop: '16px' }}>
            One check-in at a time. One day at a time.
          </p>
          {profile.motivation && (
            <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '24px', fontSize: '14px', fontStyle: 'italic' }}>
              Because: &quot;{profile.motivation}&quot;
            </p>
          )}
        </div>
        <button
          onClick={() => {
            const completeProfile = { 
              ...profile, 
              onboardingComplete: true,
              trialStartDate: new Date().toISOString()
            };
            saveProfile(completeProfile);
            setOnboardingStep(23);
          }}
          style={{ ...buttonStyle, background: '#f97316', color: 'white' }}
        >
          I commit to this
        </button>
      </div>,

      // 23. Celebration / Welcome
      <div key="welcome-final" style={{ ...screenStyle, background: 'linear-gradient(to bottom, #22c55e, #059669)' }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
          Welcome to Recovery Lock, {profile.name}
        </h2>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '24px', maxWidth: '320px', marginBottom: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '56px', fontWeight: 'bold' }}>{getDaysSober(profile.sobrietyDate)}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>days in recovery</p>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: '320px', marginBottom: '16px' }}>
          Every day you&apos;ve chosen recovery is a victory. Let&apos;s keep building on that.
        </p>
        {profile.checkInMode === 'scheduled' && (
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: '14px', marginBottom: '32px' }}>
            📅 You&apos;ll check in 3 times daily
          </p>
        )}
        {profile.checkInMode === 'everytime' && (
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: '14px', marginBottom: '32px' }}>
            🔥 Check-ins enabled for every app open
          </p>
        )}
        <button
          onClick={() => setScreen('home')}
          style={{ ...buttonStyle, background: 'white', color: '#16a34a', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          Begin my journey
        </button>
      </div>
    ];
    
    return screens[onboardingStep];
  }

  // Home screen
  if (screen === 'home') {
    const daysSober = getDaysSober(profile.sobrietyDate);
    const streak = getStreak(history);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const daysLeftInTrial = getDaysLeftInTrial(profile.trialStartDate);
    const showTrialBanner = !subscription.active && daysLeftInTrial <= 3 && daysLeftInTrial > 0;
    
    return (
      <div style={{ minHeight: '100vh', background: '#FFF7ED', display: 'flex', flexDirection: 'column' }}>
        {/* Trial banner */}
        {showTrialBanner && (
          <div 
            onClick={() => setScreen('paywall')}
            style={{
              background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
              padding: '12px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
              ⏰ {daysLeftInTrial} day{daysLeftInTrial !== 1 ? 's' : ''} left in your free trial
            </span>
            <span style={{ color: 'white', fontSize: '13px', opacity: 0.9 }}>
              Upgrade →
            </span>
          </div>
        )}
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          padding: '48px 24px 32px 24px',
          borderRadius: showTrialBanner ? '0' : '0 0 32px 32px',
          boxShadow: '0 4px 20px rgba(234, 88, 12, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '4px' }}>Good {greeting},</p>
              <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{profile.name}</h1>
            </div>
            <button 
              onClick={() => setScreen('history')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: '12px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              📖
            </button>
          </div>
          
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 4px 0' }}>Days Sober</p>
              <p style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{daysSober}</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 4px 0' }}>Check-in Streak</p>
              <p style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{streak} 🔥</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* This Month's Step */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid #FED7AA'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#ea580c', fontSize: '14px', fontWeight: '500' }}>🌟 {new Date().toLocaleString('default', { month: 'long' })}'s Focus</span>
              <span style={{
                background: '#FFEDD5',
                color: '#c2410c',
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '500'
              }}>Step {currentStep.step}</span>
            </div>
            <p style={{ color: '#1f2937', fontWeight: '600', margin: '0 0 8px 0', fontSize: '16px' }}>{currentStep.principle}</p>
            <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.5', margin: '0 0 8px 0' }}>
              "{dailyQuote}"
            </p>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>— {currentStep.name}</p>
          </div>

          {/* Recent check-ins */}
          {history.length > 0 && (
            <div>
              <h3 style={{ color: '#1f2937', fontWeight: '600', marginBottom: '12px', fontSize: '16px' }}>Recent Reflections</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.slice(0, 3).map((entry) => (
                  <div 
                    key={entry.id} 
                    onClick={() => {
                      setCurrentReflection(entry);
                      setScreen('reflection');
                    }}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #f3f4f6',
                      transition: 'box-shadow 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '500', color: '#1f2937', margin: '0 0 4px 0' }}>{entry.title}</p>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{entry.source}</p>
                      </div>
                      <p style={{ color: '#9ca3af', fontSize: '13px', marginLeft: '12px' }}>
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Check-in button */}
        <div style={{ padding: '24px', paddingBottom: '12px', background: 'linear-gradient(to top, #FFF7ED, transparent)' }}>
          <button
            onClick={() => setScreen('checkin-emotion')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: 'white',
              fontWeight: '600',
              padding: '18px',
              borderRadius: '9999px',
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>🔓</span> Check In Now
          </button>
          
          {/* Call Support Person button - only show if they have one */}
          {profile.supportPersonPhone && (
            <a
              href={`tel:${profile.supportPersonPhone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: '#22c55e',
                color: 'white',
                fontWeight: '600',
                padding: '14px',
                borderRadius: '9999px',
                fontSize: '16px',
                marginTop: '12px',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
              }}
            >
              <span>📞</span> Call {profile.supportPersonName || 'Support Person'}
            </a>
          )}
        </div>

        {/* Crisis Resources - Always visible */}
        <div style={{ 
          background: '#fef2f2', 
          margin: '0 16px', 
          padding: '12px 16px', 
          borderRadius: '12px',
          border: '1px solid #fecaca'
        }}>
          <p style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600', margin: '0 0 4px 0', textAlign: 'center' }}>
            🚨 In crisis? You&apos;re not alone.
          </p>
          <p style={{ color: '#7f1d1d', fontSize: '11px', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
            <strong>911</strong> (US) • <strong>988</strong> (Suicide Hotline) • <strong>999</strong> (UK) • <strong>112</strong> (EU)
          </p>
        </div>

        {/* Footer links */}
        <div style={{ 
          padding: '16px 24px 32px', 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          background: '#FFF7ED'
        }}>
          <a href="/privacy" style={{ color: '#9ca3af', fontSize: '12px', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: '#9ca3af', fontSize: '12px', textDecoration: 'none' }}>Terms</a>
          <a href="/support" style={{ color: '#9ca3af', fontSize: '12px', textDecoration: 'none' }}>Support</a>
          <a href="/delete-account" style={{ color: '#9ca3af', fontSize: '12px', textDecoration: 'none' }}>Delete Account</a>
        </div>
      </div>
    );
  }

  // Check-in: Emotional state
  if (screen === 'checkin-emotion') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #10b981, #0d9488)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white',
        position: 'relative'
      }}>
        <style>{`
          input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 12px;
            border-radius: 6px;
            background: rgba(255,255,255,0.3);
            outline: none;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          }
          input[type="range"]::-moz-range-thumb {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          }
        `}</style>
        <button
          onClick={() => setScreen('home')}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            color: 'rgba(255,255,255,0.8)',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        
        <div style={{ fontSize: '80px', marginBottom: '24px', transition: 'all 0.2s' }}>
          {emotionLabels[emotionalState]}
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          How are you feeling?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '40px', fontSize: '16px' }}>
          Be honest with yourself
        </p>
        
        <div style={{ width: '100%', maxWidth: '300px', marginBottom: '40px' }}>
          <input
            type="range"
            min="0"
            max="4"
            value={emotionalState}
            onChange={(e) => setEmotionalState(parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            <span>Struggling</span>
            <span>Great</span>
          </div>
        </div>
        
        <button
          onClick={() => setScreen('checkin-craving')}
          style={{
            width: '100%',
            maxWidth: '300px',
            background: 'white',
            color: '#059669',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '9999px',
            fontSize: '18px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Check-in: Craving level
  if (screen === 'checkin-craving') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f43f5e, #e11d48)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white',
        position: 'relative'
      }}>
        <button
          onClick={() => setScreen('checkin-emotion')}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            color: 'rgba(255,255,255,0.8)',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🌊</div>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          Any cravings today?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '40px', fontSize: '18px' }}>
          {cravingLabels[cravingLevel]}
        </p>
        
        <div style={{ width: '100%', maxWidth: '300px', marginBottom: '40px' }}>
          <input
            type="range"
            min="0"
            max="4"
            value={cravingLevel}
            onChange={(e) => setCravingLevel(parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            <span>None</span>
            <span>Intense</span>
          </div>
        </div>
        
        <button
          onClick={() => setScreen('checkin-feelings')}
          style={{
            width: '100%',
            maxWidth: '300px',
            background: 'white',
            color: '#3b82f6',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '9999px',
            fontSize: '18px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Check-in: Free-text feelings description
  if (screen === 'checkin-feelings') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #c2410c, #9a3412)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white',
        position: 'relative'
      }}>
        <button
          onClick={() => setScreen('checkin-craving')}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            color: 'rgba(255,255,255,0.8)',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>💭</div>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          What&apos;s on your mind?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', textAlign: 'center', padding: '0 16px', fontSize: '15px', lineHeight: '1.5' }}>
          Share what you&apos;re going through right now. This helps personalize your reflection.
        </p>
        
        <textarea
          value={feelingsText}
          onChange={(e) => setFeelingsText(e.target.value)}
          placeholder="I'm feeling anxious about a work meeting... I'm grateful for my family's support... I'm struggling with loneliness today..."
          rows={4}
          style={{
            width: '100%',
            maxWidth: '300px',
            background: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '16px',
            color: '#1c1917',
            marginBottom: '16px',
            resize: 'none',
            outline: 'none',
            lineHeight: '1.5',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        />
        
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>
          Optional - skip if you prefer
        </p>
        
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <button
            onClick={generateReflection}
            style={{
              width: '100%',
              background: 'white',
              color: '#7c3aed',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '9999px',
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              marginBottom: '12px'
            }}
          >
            Get My Reflection
          </button>
          <button
            onClick={() => {
              setFeelingsText('');
              generateReflection();
            }}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: '500',
              padding: '14px',
              borderRadius: '9999px',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  // Generating
  if (screen === 'generating') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f59e0b, #d97706)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '24px', animation: 'bounce 1s infinite' }}>✨</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Creating your reflection...</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>Personalized just for you, {profile.name}</p>
        <div style={{ marginTop: '32px', display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.2s' }}></div>
          <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.4s' }}></div>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  // Reflection
  if (screen === 'reflection' && currentReflection) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f97316, #ea580c)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        color: 'white'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🙏</div>
          <h2 style={{ fontSize: '16px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {currentReflection.title}
          </h2>
          <p style={{ fontSize: '20px', textAlign: 'center', lineHeight: '1.6', marginBottom: '32px', maxWidth: '400px', padding: '0 8px' }}>
            {currentReflection.reflection}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>— {currentReflection.source}</p>
        </div>
        
        <div style={{ paddingBottom: '32px' }}>
          <button
            onClick={() => setScreen('home')}
            style={{
              width: '100%',
              background: 'white',
              color: '#ea580c',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '9999px',
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              marginBottom: '12px'
            }}
          >
            Done
          </button>
          <button
            onClick={() => {
              setEmotionalState(2);
              setCravingLevel(1);
              setFeelingsText('');
              setScreen('checkin-emotion');
            }}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '9999px',
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Check In Again
          </button>
        </div>
      </div>
    );
  }

  // History
  if (screen === 'history') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-b from-orange-500 to-orange-600 p-6 pt-12 pb-8 rounded-b-[32px]">
          <button
            onClick={() => setScreen('home')}
            className="text-white/80 mb-4 active:scale-95 transition"
          >
            ← Back
          </button>
          <h1 className="text-white text-2xl font-bold">Your Journey</h1>
          <p className="text-white/80">{history.length} reflections saved</p>
        </div>
        
        <div className="p-6 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-6xl mb-4">📖</div>
              <p className="font-medium">No reflections yet.</p>
              <p className="text-sm mt-1">Complete a check-in to get started!</p>
            </div>
          ) : (
            history.map((entry) => (
              <div 
                key={entry.id}
                className="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md transition shadow-sm border border-gray-100"
                onClick={() => {
                  setCurrentReflection(entry);
                  setScreen('reflection');
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800">{entry.title}</h3>
                  <span className="text-gray-400 text-sm">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{entry.reflection}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Mood: {emotionLabels[entry.emotionalState]}</span>
                  <span>Craving: {cravingLabels[entry.cravingLevel]}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Paywall screen
  if (screen === 'paywall') {
    const daysLeft = getDaysLeftInTrial(profile.trialStartDate);
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1c1917, #292524)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        color: 'white'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
          
          {daysLeft > 0 ? (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                {daysLeft} Day{daysLeft !== 1 ? 's' : ''} Left in Your Free Trial
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px', textAlign: 'center', maxWidth: '300px' }}>
                Subscribe now to continue your recovery journey without interruption.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                Your Free Trial Has Ended
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px', textAlign: 'center', maxWidth: '300px' }}>
                Subscribe to continue using Recovery Lock and strengthen your recovery.
              </p>
            </>
          )}

          {/* Pricing cards */}
          <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Weekly */}
            <button
              onClick={() => handleCheckout('weekly')}
              disabled={isCheckingSubscription}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                opacity: isCheckingSubscription ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '18px' }}>Weekly</span>
                <span style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>$9.99<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>/wk</span></span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                Cancel anytime
              </p>
            </button>

            {/* Yearly - Best value */}
            <button
              onClick={() => handleCheckout('yearly')}
              disabled={isCheckingSubscription}
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(234,88,12,0.2) 100%)',
                border: '2px solid #f97316',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                opacity: isCheckingSubscription ? 0.6 : 1
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '16px',
                background: '#f97316',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                SAVE 90%
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '18px' }}>Yearly</span>
                <span style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>$49.99<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>/yr</span></span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                Just $0.96/week • Best value
              </p>
            </button>
          </div>

          {/* Features */}
          <div style={{ marginTop: '32px', width: '100%', maxWidth: '340px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
              What you get:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                '✨ Unlimited AI-powered reflections',
                '📊 Track your recovery journey',
                '🎯 Personalized 12-step wisdom',
                '🔥 Streak tracking & motivation',
                '💝 Support the recovery community'
              ].map((feature, i) => (
                <div key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue with trial (if days left) */}
        {daysLeft > 0 && (
          <button
            onClick={() => setScreen('home')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '14px',
              padding: '16px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Continue with free trial ({daysLeft} day{daysLeft !== 1 ? 's' : ''} left)
          </button>
        )}

        {/* Terms */}
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
          5-day free trial, then billed automatically. Cancel anytime.
        </p>

        {/* Legal Links */}
        <div style={{ 
          marginTop: '24px', 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/support" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'none' }}>Support</a>
        </div>
      </div>
    );
  }

  return null;
}
