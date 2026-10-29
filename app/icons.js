/* Shared stroke icon set (currentColor). Used by landing + app. */
function Icon({ d, size = 20, extra }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}{extra}
    </svg>
  );
}

export const I = {
  plug: (s) => <Icon size={s} d={<rect x="9" y="8" width="6" height="9" rx="1.5" />} extra={<><path d="M10.5 8V3M13.5 8V3" /><path d="M12 17v5" /></>} />,
  mark: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 3H13.5L12.61 7H10V10H11.94L11.28 13H10V21H6Z M14.1 3H18V7H13.21Z M12.54 10H15V13H11.88Z" />
    </svg>
  ),
  camera: (s) => <Icon size={s} d={<path d="M4 8h3l2-3h6l2 3h3v11H4z" />} extra={<circle cx="12" cy="13" r="3.5" />} />,
  mic: (s) => <Icon size={s} d={<rect x="9" y="3" width="6" height="11" rx="3" />} extra={<path d="M5 11a7 7 0 0 0 14 0M12 18v3" />} />,
  stop: (s) => <Icon size={s} d={<rect x="6" y="6" width="12" height="12" rx="2" />} />,
  wrench: (s) => <Icon size={s} d={<path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7z" />} />,
  alert: (s) => <Icon size={s} d={<path d="M12 3 2 20h20L12 3z" />} extra={<path d="M12 10v4M12 17.5v.5" />} />,
  check: (s) => <Icon size={s} d={<path d="M4 12.5 9.5 18 20 6.5" />} />,
  chat: (s) => <Icon size={s} d={<path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />} />,
  image: (s) => <Icon size={s} d={<rect x="3" y="4" width="18" height="16" rx="2" />} extra={<circle cx="9" cy="10" r="1.6" />} />,
  retake: (s) => <Icon size={s} d={<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />} />,
  chev: (s) => <Icon size={s} d={<path d="M9 6l6 6-6 6" />} />,
  video: (s) => <Icon size={s} d={<rect x="2" y="6" width="13" height="12" rx="2" />} extra={<path d="M15 10l7-3v10l-7-3" />} />,
  activity: (s) => <Icon size={s} d={<path d="M3 12h4l3 8 4-16 3 8h4" />} />,
  bike: (s) => <Icon size={s} d={<circle cx="6" cy="17" r="3.5" />} extra={<><circle cx="18" cy="17" r="3.5" /><path d="M6 17l4-7h5l3 7M10 10h4l2 4" /></>} />,
  sun: (s) => <Icon size={s} d={<circle cx="12" cy="12" r="4" />} extra={<path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />} />,
  phone: (s) => <Icon size={s} d={<rect x="7" y="2" width="10" height="20" rx="2.5" />} extra={<path d="M11 18.5h2" />} />,
  car: (s) => <Icon size={s} d={<path d="M3 16v-2l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 9l2 5v2" />} extra={<><path d="M3 16h18" /><circle cx="7.5" cy="18.5" r="1.8" /><circle cx="16.5" cy="18.5" r="1.8" /></>} />
};
