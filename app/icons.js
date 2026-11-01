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
  mark: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Optical Viewfinder Corner Brackets */}
      <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M4 17v2a1 1 0 0 0 1 1h2M17 20h2a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      {/* Letter F Precision Monogram with Chamfered Arms */}
      <path d="M7.5 5.5h8.8l-.9 2.6a.6.6 0 0 1-.5.3H10.5v3.2h4.5l-.6 2.2a.6.6 0 0 1-.5.4h-3.4V18a1 1 0 0 1-2 0V5.5z" fill="#ffffff" />
      {/* Golden AI Muse Spark */}
      <path d="M17.5 13.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z" fill="#fbbf24" />
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
  car: (s) => <Icon size={s} d={<path d="M3 16v-2l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 9l2 5v2" />} extra={<><path d="M3 16h18" /><circle cx="7.5" cy="18.5" r="1.8" /><circle cx="16.5" cy="18.5" r="1.8" /></>} />,
  sparkles: (s) => <Icon size={s} d={<path d="M12 3l1.9 4.8L18.7 9.7l-4.8 1.9L12 16.4l-1.9-4.8L5.3 9.7l4.8-1.9L12 3zM19 17l1 2.5 2.5 1-2.5 1L19 24l-1-2.5-2.5-1 2.5-1 1-2.5z" />} />,
  copy: (s) => <Icon size={s} d={<rect x="9" y="9" width="13" height="13" rx="2" />} extra={<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />} />,
  copied: (s) => <Icon size={s} d={<path d="M20 6L9 17l-5-5" />} />,
  zoom: (s) => <Icon size={s} d={<circle cx="11" cy="11" r="8" />} extra={<><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" /></>} />,
  close: (s) => <Icon size={s} d={<path d="M18 6L6 18M6 6l12 12" />} />,
  checkCircle: (s) => <Icon size={s} d={<circle cx="12" cy="12" r="10" />} extra={<path d="M9 12l2 2 4-4" />} />,
  shield: (s) => <Icon size={s} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} extra={<path d="M9 12l2 2 4-4" />} />,
  arrowLeft: (s) => <Icon size={s} d={<path d="M19 12H5M12 19l-7-7 7-7" />} />,
  arrowRight: (s) => <Icon size={s} d={<path d="M5 12h14M12 5l7 7-7 7" />} />,
  upload: (s) => <Icon size={s} d={<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />} />,
  info: (s) => <Icon size={s} d={<circle cx="12" cy="12" r="10" />} extra={<path d="M12 16v-4M12 8h.01" />} />,
  share: (s) => <Icon size={s} d={<circle cx="18" cy="5" r="3" />} extra={<><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></>} />,
  star: (s) => <Icon size={s} d={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" />} />
};
