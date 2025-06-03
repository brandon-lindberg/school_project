import React from 'react';

interface AddToCalendarButtonProps {
  start: string | Date;
  summary?: string;
  description?: string;
  location?: string;
  durationMinutes?: number;
}

export default function AddToCalendarButton({
  start,
  summary = 'Interview Scheduled',
  description = '',
  location = '',
  durationMinutes = 30,
}: AddToCalendarButtonProps) {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  // Format dates as YYYYMMDDTHHMMSSZ
  const formatDate = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) + 'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) + 'Z'
    );
  };

  const dtStart = formatDate(startDate);
  const dtEnd = formatDate(endDate);

  // Google Calendar link
  const googleUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(summary)}` +
    `&dates=${dtStart}/${dtEnd}` +
    (description ? `&details=${encodeURIComponent(description)}` : '') +
    (location ? `&location=${encodeURIComponent(location)}` : '');

  // iCal data URI
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyInternationalSchools//Interview Event//EN',
    'BEGIN:VEVENT',
    `UID:${dtStart}-${Math.random().toString(36).substr(2, 9)}@myinternationalschools`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    description && `DESCRIPTION:${description}`,
    location && `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  const icsData = encodeURIComponent(icsLines);
  const icsUri = `data:text/calendar;charset=utf-8,${icsData}`;

  return (
    <div className="flex space-x-2 mt-2">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
      >
        Google Calendar
      </a>
      <a
        href={icsUri}
        className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-md"
      >
        iCal / Outlook
      </a>
    </div>
  );
}
