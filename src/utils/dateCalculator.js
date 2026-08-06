// Date Calculator for Naitik & Raj
// Anniversary Start: 21 June 2026 at 5:16 AM

export function getRelationshipTime() {
  const startDate = new Date('2026-06-21T05:16:00');
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  return {
    totalDays,
    hours,
    minutes,
    startDateFormatted: '21 June 2026, 5:16 AM',
    displayText: `${totalDays} days`
  };
}
