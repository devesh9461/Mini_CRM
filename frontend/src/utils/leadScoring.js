export function calculateLeadScore(lead) {
  let score = 50;

  const daysOld = (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) score += 20;
  else if (daysOld < 30) score += 10;
  else if (daysOld < 90) score += 5;

  if (lead.status === 'Converted') score += 25;
  else if (lead.status === 'Contacted') score += 15;
  else if (lead.status === 'New') score += 5;

  const noteCount = lead.notes_count || lead.notes?.length || 0;
  score += Math.min(noteCount * 5, 20);

  if (lead.email) score += 5;
  if (lead.phone) score += 5;

  return Math.min(Math.max(score, 0), 100);
}

export function getScoreColor(score) {
  if (score >= 80) return 'var(--status-converted)';
  if (score >= 60) return 'var(--status-contacted)';
  if (score >= 40) return 'var(--status-new)';
  return 'var(--status-lost)';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  if (score >= 40) return 'Cool';
  return 'Cold';
}
