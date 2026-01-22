import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface GenerateRequest {
  name: string;
  daysSober: number;
  motivation: string;
  emotionalState: number; // 0-4 (struggling to great)
  cravingLevel: number; // 0-4 (none to intense)
  feelingsText: string; // User's own description of how they're feeling
  checkInCount: number;
  recoveryProgram: string; // AA, NA, CA, GA, OA, SA, etc.
  primaryChallenge: string; // User's self-described challenge
}

const emotionDescriptions = [
  'struggling and having a hard day',
  'feeling a bit uncertain or low',
  'doing okay, feeling neutral',
  'feeling good and positive',
  'feeling great and grateful'
];

const cravingDescriptions = [
  'no cravings',
  'mild cravings',
  'moderate cravings',
  'strong cravings',
  'intense cravings they\'re fighting through'
];

// The 12 Steps mapped to months - this creates natural thematic rotation
const twelveSteps = [
  { // January - Step 1
    step: 1,
    name: "Powerlessness",
    text: "We admitted we were powerless over alcohol—that our lives had become unmanageable.",
    themes: ["surrender", "honesty", "acceptance", "humility", "admitting limitations", "letting go of control"],
    spiritualPrinciple: "Honesty"
  },
  { // February - Step 2
    step: 2,
    name: "Hope",
    text: "Came to believe that a Power greater than ourselves could restore us to sanity.",
    themes: ["hope", "faith", "open-mindedness", "belief", "trust in something greater", "possibility of healing"],
    spiritualPrinciple: "Hope"
  },
  { // March - Step 3
    step: 3,
    name: "Faith",
    text: "Made a decision to turn our will and our lives over to the care of God as we understood Him.",
    themes: ["surrender", "trust", "faith", "letting go", "turning it over", "acceptance of guidance"],
    spiritualPrinciple: "Faith"
  },
  { // April - Step 4
    step: 4,
    name: "Courage",
    text: "Made a searching and fearless moral inventory of ourselves.",
    themes: ["courage", "self-examination", "honesty", "facing fears", "self-awareness", "truth"],
    spiritualPrinciple: "Courage"
  },
  { // May - Step 5
    step: 5,
    name: "Integrity",
    text: "Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.",
    themes: ["integrity", "confession", "vulnerability", "connection", "releasing shame", "truth-telling"],
    spiritualPrinciple: "Integrity"
  },
  { // June - Step 6
    step: 6,
    name: "Willingness",
    text: "Were entirely ready to have God remove all these defects of character.",
    themes: ["willingness", "readiness", "openness to change", "preparation", "letting go of defects"],
    spiritualPrinciple: "Willingness"
  },
  { // July - Step 7
    step: 7,
    name: "Humility",
    text: "Humbly asked Him to remove our shortcomings.",
    themes: ["humility", "asking for help", "releasing ego", "spiritual growth", "transformation"],
    spiritualPrinciple: "Humility"
  },
  { // August - Step 8
    step: 8,
    name: "Brotherly Love",
    text: "Made a list of all persons we had harmed, and became willing to make amends to them all.",
    themes: ["love", "forgiveness", "responsibility", "healing relationships", "willingness to repair"],
    spiritualPrinciple: "Brotherly Love"
  },
  { // September - Step 9
    step: 9,
    name: "Justice",
    text: "Made direct amends to such people wherever possible, except when to do so would injure them or others.",
    themes: ["justice", "making amends", "responsibility", "healing", "righting wrongs", "restoration"],
    spiritualPrinciple: "Justice"
  },
  { // October - Step 10
    step: 10,
    name: "Perseverance",
    text: "Continued to take personal inventory and when we were wrong promptly admitted it.",
    themes: ["perseverance", "daily practice", "self-awareness", "promptness", "ongoing growth", "vigilance"],
    spiritualPrinciple: "Perseverance"
  },
  { // November - Step 11
    step: 11,
    name: "Spiritual Awareness",
    text: "Sought through prayer and meditation to improve our conscious contact with God as we understood Him.",
    themes: ["prayer", "meditation", "spiritual connection", "seeking guidance", "conscious contact", "inner peace"],
    spiritualPrinciple: "Spiritual Awareness"
  },
  { // December - Step 12
    step: 12,
    name: "Service",
    text: "Having had a spiritual awakening as the result of these steps, we tried to carry this message to alcoholics, and to practice these principles in all our affairs.",
    themes: ["service", "giving back", "spiritual awakening", "carrying the message", "gratitude in action", "living the principles"],
    spiritualPrinciple: "Service"
  }
];

// Get current month's step (0-indexed: January = 0)
function getCurrentStep() {
  const month = new Date().getMonth();
  return twelveSteps[month];
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { name, daysSober, motivation, emotionalState, cravingLevel, feelingsText, checkInCount, recoveryProgram, primaryChallenge } = body;

    // Get this month's step for thematic content
    const currentStep = getCurrentStep();
    const monthName = new Date().toLocaleString('default', { month: 'long' });

    // Map recovery program to fellowship name for natural language
    const programNames: Record<string, string> = {
      'AA': 'Alcoholics Anonymous',
      'NA': 'Narcotics Anonymous',
      'CA': 'Cocaine Anonymous',
      'GA': 'Gamblers Anonymous',
      'OA': 'Overeaters Anonymous',
      'SA': 'Sexaholics Anonymous',
      'ACA': 'Adult Children of Alcoholics',
      'Al-Anon': 'Al-Anon',
      'SLAA': 'Sex & Love Addicts Anonymous',
      'DA': 'Debtors Anonymous',
      'other': 'their recovery program'
    };
    const fellowshipName = programNames[recoveryProgram] || 'their recovery program';

    // If no API key, return thoughtful fallback
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(generateFallback(name, daysSober, emotionalState, cravingLevel, feelingsText, checkInCount, currentStep));
    }

    const prompt = `You are a compassionate recovery coach creating a brief, personalized reflection for someone in addiction recovery. Be warm, supportive, and grounded in recovery principles.

Context about this person:
- Name: ${name}
- Days in recovery: ${daysSober}
- Recovery fellowship: ${fellowshipName}${recoveryProgram && recoveryProgram !== 'other' ? ` (${recoveryProgram})` : ''}
- Their specific challenge/pattern they're working on: "${primaryChallenge || 'general recovery and personal growth'}"
- Their personal motivation for recovery: "${motivation || 'Personal growth and health'}"
- Current emotional state: ${emotionDescriptions[emotionalState]}
- Craving level: ${cravingDescriptions[cravingLevel]}
${feelingsText ? `- What they shared about how they're feeling: "${feelingsText}"` : ''}
- This is check-in #${checkInCount} for them

MONTHLY THEME (${monthName} - Step ${currentStep.step}):
"${currentStep.text}"
Spiritual Principle: ${currentStep.spiritualPrinciple}
Key themes to weave in: ${currentStep.themes.join(', ')}

Write a 2-3 sentence personalized reflection that:
1. Uses their name naturally (not at the very start)
2. ${feelingsText ? 'Directly addresses what they shared about their feelings' : 'Acknowledges their current emotional state and craving level appropriately'}
3. Weaves in the monthly step's spiritual principle or themes naturally
4. References their specific challenge or pattern when relevant (but sensitively)
5. Is encouraging without being preachy
6. Feels fresh and personal, not generic
7. Uses language appropriate to their fellowship (e.g., "clean" for NA, "abstinent" for OA)

${emotionalState <= 1 ? 'They need extra support and gentle encouragement today. Connect the step themes to finding strength in difficulty.' : ''}
${cravingLevel >= 3 ? 'Acknowledge their strength in facing cravings/urges. Relate to the step principle of ' + currentStep.spiritualPrinciple.toLowerCase() + '.' : ''}
${daysSober < 30 ? 'They are in early recovery - celebrate every day as a victory.' : ''}
${daysSober >= 365 ? 'Acknowledge their significant milestone while keeping them grounded in daily practice.' : ''}
${feelingsText ? 'IMPORTANT: Since they took the time to share their feelings, make sure the reflection directly speaks to what they wrote.' : ''}
${primaryChallenge ? 'Consider how the current step themes relate to their specific challenge of: ' + primaryChallenge : ''}

Respond with ONLY a JSON object in this exact format:
{"reflection": "your reflection text here"}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status);
      return NextResponse.json(generateFallback(name, daysSober, emotionalState, cravingLevel, feelingsText, checkInCount, currentStep));
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    // Parse the JSON response
    let reflection = '';
    try {
      const parsed = JSON.parse(content);
      reflection = parsed.reflection;
    } catch {
      // If JSON parsing fails, use the raw text
      reflection = content.replace(/[{}"\n]/g, '').replace('reflection:', '').trim();
    }

    // Title based on the current step's spiritual principle
    const title = currentStep.spiritualPrinciple;
    const source = `Step ${currentStep.step} - ${currentStep.name}`;

    return NextResponse.json({
      reflection,
      title,
      source
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reflection' },
      { status: 500 }
    );
  }
}

function generateFallback(
  name: string, 
  daysSober: number, 
  emotionalState: number, 
  cravingLevel: number,
  feelingsText: string,
  checkInCount: number,
  currentStep: typeof twelveSteps[0]
) {
  // Step-themed reflections for each emotional state
  const stepReflections: { [key: number]: string[] } = {
    // Step 1 - Powerlessness/Honesty (January)
    1: [
      `The courage to be honest with yourself today, ${name}, is the foundation of your ${daysSober} days. In admitting what we cannot control, we find what we can.`,
      `${name}, ${daysSober} days of choosing honesty over denial. Today, let that truth be your strength, not your burden.`,
      `Even on hard days, ${name}, honesty with yourself is the greatest gift. ${daysSober} days built on that foundation cannot be shaken.`
    ],
    // Step 2 - Hope (February)
    2: [
      `Hope isn't just a feeling, ${name}—it's the ${daysSober} days of evidence that healing is real. Trust the process today.`,
      `${name}, ${daysSober} days ago you took a leap of faith. That hope has carried you here. Let it carry you through today.`,
      `When doubt creeps in, ${name}, remember: ${daysSober} days of hope made manifest. You are living proof that change is possible.`
    ],
    // Step 3 - Faith (March)
    3: [
      `Letting go isn't giving up, ${name}—it's trusting the journey. ${daysSober} days of faith, one day at a time.`,
      `${name}, ${daysSober} days of turning it over. Today, trust that you don't have to carry everything alone.`,
      `Faith isn't certainty, ${name}. It's ${daysSober} days of showing up anyway. That's the kind of faith that transforms.`
    ],
    // Step 4 - Courage (April)
    4: [
      `The courage to look within, ${name}, has given you ${daysSober} days of freedom. Self-awareness is strength.`,
      `${name}, ${daysSober} days of facing yourself with honesty. That's not easy—that's courageous.`,
      `Every day you choose growth over comfort, ${name}. ${daysSober} days of courage, one honest moment at a time.`
    ],
    // Step 5 - Integrity (May)
    5: [
      `${name}, ${daysSober} days of living your truth. Integrity isn't perfection—it's alignment between who you are and how you live.`,
      `Speaking your truth takes courage, ${name}. ${daysSober} days of walking in integrity, even when it's hard.`,
      `The weight you've released through honesty, ${name}, has made room for ${daysSober} days of freedom. That's integrity in action.`
    ],
    // Step 6 - Willingness (June)
    6: [
      `Willingness opens doors that force cannot, ${name}. ${daysSober} days of saying yes to change.`,
      `${name}, ${daysSober} days of being ready—not perfect, but willing. That's all growth asks of us.`,
      `Your willingness to grow, ${name}, has built ${daysSober} days of transformation. Stay open to what today brings.`
    ],
    // Step 7 - Humility (July)
    7: [
      `Humility isn't weakness, ${name}—it's the wisdom behind ${daysSober} days of asking for help when you need it.`,
      `${name}, ${daysSober} days of letting go of pride and embracing progress. Humility has served you well.`,
      `The strength to admit you don't have all the answers, ${name}, has given you ${daysSober} days of growth. That's true humility.`
    ],
    // Step 8 - Brotherly Love (August)
    8: [
      `Love heals what willpower alone cannot, ${name}. ${daysSober} days of mending—starting with yourself.`,
      `${name}, ${daysSober} days of opening your heart to healing. Love yourself today as you work to love others.`,
      `The relationships worth repairing start with the one you have with yourself, ${name}. ${daysSober} days of that work in progress.`
    ],
    // Step 9 - Justice (September)
    9: [
      `Making things right isn't about perfection, ${name}—it's about ${daysSober} days of honest effort to heal.`,
      `${name}, ${daysSober} days of taking responsibility and making amends. That takes real courage.`,
      `Justice in recovery means fairness to yourself too, ${name}. ${daysSober} days of balanced healing.`
    ],
    // Step 10 - Perseverance (October)
    10: [
      `Daily practice is the secret, ${name}. ${daysSober} days of perseverance, built one honest day at a time.`,
      `${name}, ${daysSober} days of showing up and taking inventory. Persistence is your superpower.`,
      `The willingness to course-correct, ${name}, has kept you on track for ${daysSober} days. Keep going.`
    ],
    // Step 11 - Spiritual Awareness (November)
    11: [
      `In the quiet moments, ${name}, you've found strength for ${daysSober} days. Keep seeking that inner peace.`,
      `${name}, ${daysSober} days of conscious contact with something greater. Your spirit knows the way.`,
      `Meditation and reflection have anchored ${daysSober} days of your journey, ${name}. Trust your inner wisdom today.`
    ],
    // Step 12 - Service (December)
    12: [
      `Your recovery lights the way for others, ${name}. ${daysSober} days of awakening, now shared with the world.`,
      `${name}, ${daysSober} days of transformation. The best way to keep it is to give it away.`,
      `Service multiplies what we've received, ${name}. ${daysSober} days of gifts worth sharing. You are the message.`
    ]
  };

  // Get reflections for current step
  const stepMessages = stepReflections[currentStep.step] || stepReflections[1];
  let reflection = stepMessages[Math.floor(Math.random() * stepMessages.length)];
  
  // Adjust for emotional state
  if (emotionalState <= 1) {
    const supportAddons = [
      ` Be gentle with yourself today—${currentStep.spiritualPrinciple.toLowerCase()} includes self-compassion.`,
      ` Hard days are part of the journey. ${currentStep.spiritualPrinciple} means meeting yourself where you are.`,
      ` Even struggle is progress, ${name}. ${currentStep.spiritualPrinciple.toLowerCase()} shines brightest in difficulty.`
    ];
    reflection += supportAddons[Math.floor(Math.random() * supportAddons.length)];
  }
  
  // Add craving-specific encouragement
  if (cravingLevel >= 3) {
    const cravingAddons = [
      ` This craving will pass. Your ${daysSober} days prove you're stronger than any urge.`,
      ` Cravings are waves—they rise and fall. You've ridden ${daysSober} days of them. Ride this one too.`,
      ` Feel the craving, acknowledge it, and let it go. ${daysSober} days of practice has prepared you for this moment.`
    ];
    reflection += cravingAddons[Math.floor(Math.random() * cravingAddons.length)];
  }

  return { 
    reflection, 
    title: currentStep.spiritualPrinciple,
    source: `Step ${currentStep.step} - ${currentStep.name}`
  };
}
