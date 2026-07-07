import React from 'react';
import { HiOutlineSparkles, HiOutlineCheckCircle } from 'react-icons/hi';

export default function AICopilot({ lead }) {
  if (!lead) return null;

  // 1. Calculate Conversion Probability (Dynamic logical score)
  const calculateScore = () => {
    if (lead.status === 'Converted') return 100;
    if (lead.status === 'Lost') return 5;

    let score = 40; // Base score

    // Status adjustments
    if (lead.status === 'Contacted') score += 20;

    // Contact details adjustments
    if (lead.phone && lead.phone.trim()) score += 10;
    if (lead.email) {
      const isWorkEmail = !lead.email.match(/@(gmail|yahoo|outlook|hotmail|live|icloud)\./i);
      if (isWorkEmail) score += 15;
    }

    // Notes/Engagement frequency
    const noteCount = lead.notes?.length || 0;
    if (noteCount === 0) {
      score -= 10;
    } else if (noteCount <= 2) {
      score += 15;
    } else {
      score += 30;
    }

    // Time decay check (if in active sales cycle)
    const lastUpdate = lead.updated_at ? new Date(lead.updated_at) : new Date(lead.created_at);
    const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 10) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  };

  // 2. Perform Keyword-based Sentiment Logic
  const analyzeSentiment = () => {
    if (lead.status === 'Converted') return { label: 'Delighted (Won)', color: '#0FA968' };
    if (lead.status === 'Lost') return { label: 'Inactive (Lost)', color: '#9A3A3A' };

    const notes = lead.notes || [];
    if (notes.length === 0) return { label: 'Awaiting Dialogue', color: '#847C76' };

    const posWords = ['interested', 'loves', 'wants', 'agreed', 'good', 'happy', 'positive', 'signed', 'schedule', 'demo', 'meeting', 'call', 'yes'];
    const negWords = ['uninterested', 'no response', 'lost', 'refused', 'too expensive', 'budget', 'bad', 'negative', 'cancel', 'not ready', 'no', 'busy'];

    let posCount = 0;
    let negCount = 0;

    notes.forEach((note) => {
      const content = note.content.toLowerCase();
      posWords.forEach(w => { if (content.includes(w)) posCount++; });
      negWords.forEach(w => { if (content.includes(w)) negCount++; });
    });

    if (posCount > negCount) return { label: 'High Receptive (Warm)', color: '#F26639' };
    if (negCount > posCount) return { label: 'Needs Re-engagement (Cold)', color: '#E55B3C' };
    return { label: 'Neutral / Engaging', color: '#E5A93C' };
  };

  // 3. Dynamic Checklist Generation
  const generateActions = () => {
    const actions = [];
    const noteCount = lead.notes?.length || 0;

    if (lead.status === 'New') {
      actions.push({ id: 1, text: 'Initiate standard welcome call or WhatsApp query.' });
    }
    if (lead.status === 'Contacted' && noteCount === 0) {
      actions.push({ id: 2, text: 'Log initial conversation details in the notes.' });
    }
    if (!lead.phone) {
      actions.push({ id: 3, text: 'Request primary mobile number to enable direct reach.' });
    }
    if (lead.email && lead.email.match(/@(gmail|yahoo|outlook|hotmail|live)\./i)) {
      actions.push({ id: 4, text: 'Ask for corporate/work email for official proposal logs.' });
    }
    if (noteCount > 0 && lead.status === 'Contacted') {
      actions.push({ id: 5, text: 'Plan next demo/meeting step based on the client\'s feedback.' });
    }
    if (lead.status === 'Converted') {
      actions.push({ id: 6, text: 'Initiate client onboarding sequence & issue invoice.' });
    }
    if (lead.status === 'Lost') {
      actions.push({ id: 7, text: 'Analyze loss reason & place lead in 90-day recycle bin.' });
    }

    // Default action if none match
    if (actions.length === 0) {
      actions.push({ id: 8, text: 'Keep in active follow-up cycle & nurture engagement.' });
    }

    return actions;
  };

  const score = calculateScore();
  const sentiment = analyzeSentiment();
  const actions = generateActions();

  // Circle path math
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card copilot-card" style={{ padding: '24px', border: '1px solid var(--border-accent)', position: 'relative', overflow: 'hidden' }}>
      {/* Background glowing ambient light */}
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(242, 102, 57, 0.15) 0%, transparent 70%)',
        top: '-20px',
        right: '-20px',
        pointerEvents: 'none'
      }} />

      <div className="flex items-center gap-2 mb-4">
        <HiOutlineSparkles style={{ color: 'var(--accent-primary)', fontSize: '1.25rem' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          INDIC AI COPILOT
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', alignItems: 'center' }}>
        {/* Left: Score Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100px', height: '100px' }}>
              {/* Back track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
              />
              {/* Progress track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="url(#copilotGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
              <defs>
                <linearGradient id="copilotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F26639" />
                  <stop offset="100%" stopColor="#E5A93C" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {score}%
              </span>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                Score
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
            Conversion Probability
          </span>
        </div>

        {/* Right: Insights */}
        <div>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '4px', fontWeight: 500 }}>
              Lead Sentiment Index
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: sentiment.color }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: sentiment.color, display: 'inline-block' }} />
              {sentiment.label}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '4px', fontWeight: 500 }}>
              Lead Engagement Frequency
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {lead.notes?.length || 0} interaction{(lead.notes?.length !== 1) ? 's' : ''} logged
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Actions Checklist */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 600 }}>
          RECOMMENDED ACTION STRATEGY
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {actions.map((act) => (
            <div key={act.id} style={{ display: 'flex', gap: '8px', fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: 1.4, alignItems: 'flex-start' }}>
              <HiOutlineCheckCircle style={{ color: 'var(--accent-secondary)', flexShrink: 0, marginTop: '2px', fontSize: '1rem' }} />
              <span>{act.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
