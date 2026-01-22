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
const FREE_TRIAL_DAYS = 7;

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
  const [profile, setProfile] = useState<UserProfile>({ name: '', sobrietyDate: '', motivation: '', onboardingComplete: false, recoveryProgram: '', primaryChallenge: '' });
  const [history, setHistory] = useState<CheckInEntry[]>([]);
  const [emotionalState, setEmotionalState] = useState(2);
  const [cravingLevel, setCravingLevel] = useState(1);
  const [feelingsText, setFeelingsText] = useState('');
  const [currentReflection, setCurrentReflection] = useState<CheckInEntry | null>(null);
  const [currentStep, setCurrentStep] = useState(twelveSteps[0]);
  const [dailyQuote, setDailyQuote] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionStatus>({ active: false, status: 'none' });
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

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
        <p className="text-gray-500 mt-2">block your phone until you check in</p>
      </div>
    );
  }

  // Onboarding
  if (screen === 'onboarding') {
    const screens = [
      // Welcome
      <div key="welcome" className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-600 flex flex-col items-center justify-center p-6 text-white">
        <div className="text-8xl mb-6 drop-shadow-lg">🔒</div>
        <h1 className="text-3xl font-bold mb-3">Recovery Lock</h1>
        <p className="text-lg opacity-90 mb-8 text-center">Turn screen time into recovery time</p>
        <button
          onClick={() => setOnboardingStep(1)}
          className="w-full max-w-xs bg-white text-orange-600 font-semibold py-4 rounded-full text-lg shadow-lg active:scale-95 transition"
        >
          Get Started
        </button>
      </div>,
      
      // Screen time shock
      <div key="shock" className="min-h-screen bg-[#292524] flex flex-col items-center justify-center p-6 text-white">
        <div className="text-6xl mb-6">📱</div>
        <h2 className="text-2xl font-bold mb-4 text-center">The average person checks their phone</h2>
        <div className="text-7xl font-bold text-orange-500 mb-4">96x</div>
        <p className="text-lg opacity-70 mb-8 text-center">per day. What if each check-in strengthened your recovery?</p>
        <button
          onClick={() => setOnboardingStep(2)}
          className="w-full max-w-xs bg-orange-500 text-white font-semibold py-4 rounded-full text-lg active:scale-95 transition"
        >
          Continue
        </button>
      </div>,
      
      // Name input
      <div key="name" className="min-h-screen bg-[#292524] flex flex-col items-center justify-center p-6 text-white">
        <h2 className="text-2xl font-bold mb-8">What should we call you?</h2>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Your first name"
          className="w-full max-w-xs bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-lg text-center mb-8 placeholder-white/50 focus:outline-none focus:border-orange-500"
          autoFocus
        />
        <button
          onClick={() => profile.name && setOnboardingStep(3)}
          disabled={!profile.name}
          className="w-full max-w-xs bg-orange-500 text-white font-semibold py-4 rounded-full text-lg disabled:opacity-50 active:scale-95 transition"
        >
          Continue
        </button>
      </div>,
      
      // Recovery focus - program selection
      <div key="recovery-focus" className="min-h-screen bg-[#292524] flex flex-col items-center justify-center p-6 text-white">
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-2xl font-bold mb-2 text-center">What brings you here?</h2>
        <p className="text-white/60 mb-6 text-center text-sm">Select a fellowship or choose "Other" to describe your journey</p>
        
        <div className="w-full max-w-xs space-y-2 mb-6 max-h-64 overflow-y-auto">
          {[
            { id: 'AA', label: 'Alcoholics Anonymous (AA)', emoji: '🍷' },
            { id: 'NA', label: 'Narcotics Anonymous (NA)', emoji: '💊' },
            { id: 'CA', label: 'Cocaine Anonymous (CA)', emoji: '❄️' },
            { id: 'GA', label: 'Gamblers Anonymous (GA)', emoji: '🎰' },
            { id: 'OA', label: 'Overeaters Anonymous (OA)', emoji: '🍽️' },
            { id: 'SA', label: 'Sexaholics Anonymous (SA)', emoji: '💔' },
            { id: 'ACA', label: 'Adult Children of Alcoholics (ACA)', emoji: '👨‍👩‍👧' },
            { id: 'Al-Anon', label: 'Al-Anon / Alateen', emoji: '💙' },
            { id: 'SLAA', label: 'Sex & Love Addicts Anonymous', emoji: '💕' },
            { id: 'DA', label: 'Debtors Anonymous (DA)', emoji: '💳' },
            { id: 'other', label: 'Other / Prefer to describe', emoji: '✨' },
          ].map((program) => (
            <button
              key={program.id}
              onClick={() => setProfile({ ...profile, recoveryProgram: program.id })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left ${
                profile.recoveryProgram === program.id
                  ? 'bg-orange-500/20 border-orange-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{program.emoji}</span>
              <span className="text-sm">{program.label}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => profile.recoveryProgram && setOnboardingStep(4)}
          disabled={!profile.recoveryProgram}
          className="w-full max-w-xs bg-orange-500 text-white font-semibold py-4 rounded-full text-lg disabled:opacity-50 active:scale-95 transition"
        >
          Continue
        </button>
      </div>,
      
      // Personal challenge description
      <div key="challenge" className="min-h-screen bg-[#292524] flex flex-col items-center justify-center p-6 text-white">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2 text-center">What are you working on?</h2>
        <p className="text-white/60 mb-6 text-center text-sm px-4">
          Describe the pattern, behavior, or challenge you're seeking support for. This stays private and helps personalize your reflections.
        </p>
        
        <textarea
          value={profile.primaryChallenge}
          onChange={(e) => setProfile({ ...profile, primaryChallenge: e.target.value })}
          placeholder="Examples:
• Alcohol dependency affecting my relationships
• Compulsive spending and debt
• Codependency patterns from childhood
• Managing anxiety without substances
• Breaking cycles of people-pleasing"
          rows={5}
          className="w-full max-w-xs bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-sm mb-4 placeholder-white/40 resize-none focus:outline-none focus:border-orange-500"
        />
        
        <p className="text-white/40 text-xs mb-6 text-center px-4">
          🔒 Your responses are stored only on your device
        </p>
        
        <button
          onClick={() => setOnboardingStep(5)}
          className="w-full max-w-xs bg-orange-500 text-white font-semibold py-4 rounded-full text-lg active:scale-95 transition"
        >
          {profile.primaryChallenge ? 'Continue' : 'Skip for now'}
        </button>
      </div>,
      
      // Sobriety date
      <div key="date" className="min-h-screen bg-[#292524] flex flex-col items-center justify-center p-6 text-white">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-2xl font-bold mb-2">When did your journey begin?</h2>
        <p className="text-white/60 mb-8 text-center">Your sobriety or recovery start date</p>
        <input
          type="date"
          value={profile.sobrietyDate}
          onChange={(e) => setProfile({ ...profile, sobrietyDate: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          className="w-full max-w-xs bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-lg text-center mb-8 text-white focus:outline-none focus:border-orange-500 [color-scheme:dark]"
        />
        <button
          onClick={() => profile.sobrietyDate && setOnboardingStep(6)}
          disabled={!profile.sobrietyDate}
          className="w-full max-w-xs bg-orange-500 text-white font-semibold py-4 rounded-full text-lg disabled:opacity-50 active:scale-95 transition"
        >
          Continue
        </button>
      </div>,
      
      // Motivation
      <div key="motivation" className="min-h-screen bg-[#292524] flex flex-col items-center justify-center p-6 text-white">
        <div className="text-5xl mb-4">💪</div>
        <h2 className="text-2xl font-bold mb-2">Why are you in recovery?</h2>
        <p className="text-white/60 mb-6 text-center">This helps personalize your experience</p>
        <textarea
          value={profile.motivation}
          onChange={(e) => setProfile({ ...profile, motivation: e.target.value })}
          placeholder="For my family, my health, to be the person I know I can be..."
          rows={4}
          className="w-full max-w-xs bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-lg mb-8 placeholder-white/50 resize-none focus:outline-none focus:border-orange-500"
        />
        <button
          onClick={() => {
            const completeProfile = { 
              ...profile, 
              onboardingComplete: true,
              trialStartDate: new Date().toISOString() // Start free trial
            };
            saveProfile(completeProfile);
            setOnboardingStep(7);
          }}
          className="w-full max-w-xs bg-orange-500 text-white font-semibold py-4 rounded-full text-lg active:scale-95 transition"
        >
          Complete Setup
        </button>
      </div>,
      
      // Ready
      <div key="ready" className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col items-center justify-center p-6 text-white">
        <div className="text-7xl mb-6">✨</div>
        <h2 className="text-3xl font-bold mb-4">You&apos;re all set, {profile.name}!</h2>
        <p className="text-lg opacity-90 mb-8 text-center">
          {getDaysSober(profile.sobrietyDate)} days of recovery and counting.
          <br />Every check-in makes you stronger.
        </p>
        <button
          onClick={() => setScreen('home')}
          className="w-full max-w-xs bg-white text-green-600 font-semibold py-4 rounded-full text-lg shadow-lg active:scale-95 transition"
        >
          Start Using Recovery Lock
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
        <div style={{ padding: '24px', paddingBottom: '32px', background: 'linear-gradient(to top, #FFF7ED, transparent)' }}>
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
          What's on your mind?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', textAlign: 'center', padding: '0 16px', fontSize: '15px', lineHeight: '1.5' }}>
          Share what you're going through right now. This helps personalize your reflection.
        </p>
        
        <textarea
          value={feelingsText}
          onChange={(e) => setFeelingsText(e.target.value)}
          placeholder="I'm feeling anxious about a work meeting... I'm grateful for my family's support... I'm struggling with loneliness today..."
          rows={4}
          style={{
            width: '100%',
            maxWidth: '300px',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '16px',
            color: 'white',
            marginBottom: '16px',
            resize: 'none',
            outline: 'none',
            lineHeight: '1.5'
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
          7-day free trial, then billed automatically. Cancel anytime.
        </p>
      </div>
    );
  }

  return null;
}
