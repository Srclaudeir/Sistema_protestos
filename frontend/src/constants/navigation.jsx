// src/constants/navigation.jsx
export const navigationItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: (className = "h-5 w-5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 21V4" />
        <rect fill="none" x="4" y="8" width="6" height="12" rx="1.2" />
        <rect fill="none" x="14" y="3" width="6" height="8" rx="1.2" />
        <rect fill="none" x="14" y="13" width="6" height="8" rx="1.2" />
        <rect fill="none" x="4" y="4" width="6" height="3" rx="1.2" />
      </svg>
    ),
  },
  {
    path: "/clientes",
    label: "Cooperados",
    icon: (className = "h-5 w-5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.5 9a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
        <path d="M4 21a8 8 0 0116 0" />
      </svg>
    ),
  },
  {
    path: "/contratos",
    label: "Contratos",
    icon: (className = "h-5 w-5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 3h8l6 6v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
        <path d="M14 3v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </svg>
    ),
  },
  {
    path: "/protestos",
    label: "Protestos",
    icon: (className = "h-5 w-5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16v6H4z" />
        <path d="M4 10l3 11h10l3-11" />
        <path d="M12 4v17" />
      </svg>
    ),
  },
  {
    path: "/avalistas",
    label: "Avalistas",
    icon: (className = "h-5 w-5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l7 4v5c0 4.418-3.134 8.775-7 10-3.866-1.225-7-5.582-7-10V7l7-4z" />
        <path d="M10 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    path: "/especies",
    label: "Espécies",
    icon: (className = "h-5 w-5") => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];
