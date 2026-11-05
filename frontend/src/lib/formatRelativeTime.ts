export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return 'Edited just now';
  if (minutes < 60) return `Edited ${minutes}m ago`;
  if (hours < 24) return `Edited ${hours}h ago`;
  if (days === 1) return 'Edited yesterday';
  if (days < 7) return `Edited ${days} days ago`;
  if (days < 14) return 'Edited last week';
  return `Edited ${Math.floor(days / 7)} weeks ago`;
}
