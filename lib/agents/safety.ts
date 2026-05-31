// Content safety filter for agent goals.
// Blocks inputs that could produce dangerous, illegal, or off-topic content.

interface SafetyResult {
  allowed: boolean;
  reason?: string;
}

// Patterns that indicate the user is trying to abuse the formulation agent
// for purposes outside supplement/nutraceutical formulation.
const BLOCKED_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  // Disease treatment / Rx drug claims
  {
    pattern: /\b(cure|treat|diagnose|prevent|heal)\b.{0,40}\b(cancer|diabetes|alzheimer|hiv|aids|covid|hepatitis|parkinson|depression|schizophrenia)\b/i,
    reason: "Disease treatment claims are not permitted. Use structure/function language instead (e.g. 'supports healthy blood sugar').",
  },
  // Controlled / prescription substances
  {
    pattern: /\b(steroids?|anabolic|testosterone\s+inject|sarm|peptide\s+inject|hgh|human\s+growth\s+hormone|ephedra|ephedrine|dmaa|dmha|dnp|2,4-dinitrophenol)\b/i,
    reason: "Controlled substances and banned compounds cannot be formulated through this platform.",
  },
  // Pharmaceutical synthesis
  {
    pattern: /\b(synthesize|manufacture|synthesise)\b.{0,30}\b(drug|pharmaceutical|narcotic|opioid|amphetamine|methamphetamine|cocaine|fentanyl)\b/i,
    reason: "Pharmaceutical drug synthesis is not within scope.",
  },
  // Extreme / dangerous doses
  {
    pattern: /\b(\d{4,}\s*g|\d{3,}\s*kg|lethal dose|ld50|overdose|toxic dose)\b/i,
    reason: "Extremely high or dangerous doses are not permitted.",
  },
  // Weapons / explosives
  {
    pattern: /\b(explosive|poison|weapon|bomb|nerve agent|ricin|sarin|cyanide)\b/i,
    reason: "This content is not permitted.",
  },
  // Minors
  {
    pattern: /\b(children under 3|infants?|newborn|toddler).{0,30}\b(supplement|formula|dose|pill|capsule)\b/i,
    reason: "Supplement formulations for infants and toddlers under 3 require clinical oversight and cannot be auto-generated.",
  },
];

// Max goal length enforced server-side
export const MAX_GOAL_LENGTH = 2000;

// Minimum meaningful goal length
export const MIN_GOAL_LENGTH = 10;

export function checkGoalSafety(goal: string): SafetyResult {
  const trimmed = goal.trim();

  if (trimmed.length < MIN_GOAL_LENGTH) {
    return { allowed: false, reason: "Goal is too short. Describe what you want to formulate." };
  }

  if (trimmed.length > MAX_GOAL_LENGTH) {
    return { allowed: false, reason: `Goal exceeds ${MAX_GOAL_LENGTH} characters.` };
  }

  for (const { pattern, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { allowed: false, reason };
    }
  }

  return { allowed: true };
}

// Per-user per-day agent run limit (tracked via agent_runs table)
export const AGENT_DAILY_LIMIT = 50;
