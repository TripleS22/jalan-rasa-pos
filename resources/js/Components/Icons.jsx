export function ChevronIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor">
            <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
            />
        </svg>
    );
}

export function IconGrid({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

export function IconCart({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="9" cy="20" r="1" />
            <circle cx="17" cy="20" r="1" />
            <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" />
        </svg>
    );
}

export function IconLayers({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 3 2 8l10 5 10-5-10-5Z" />
            <path d="M2 13l10 5 10-5" />
        </svg>
    );
}

export function IconReceipt({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
    );
}

export function IconFolder({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        </svg>
    );
}

export function IconChart({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" y1="20" x2="4" y2="10" />
            <line x1="10" y1="20" x2="10" y2="4" />
            <line x1="16" y1="20" x2="16" y2="14" />
            <line x1="20" y1="20" x2="4" y2="20" />
        </svg>
    );
}

export function IconDocument({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="5" y="3" width="14" height="18" rx="1" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="13" y2="16" />
        </svg>
    );
}

export function IconBox({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 8 12 3 3 8l9 5 9-5Z" />
            <path d="M3 8v8l9 5 9-5V8" />
            <path d="M12 13v8" />
        </svg>
    );
}

export function IconFlask({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 3h6" />
            <path d="M10 3v6l-6 10a1.5 1.5 0 0 0 1.3 2.2h13.4A1.5 1.5 0 0 0 20 19L14 9V3" />
            <path d="M7 15h10" />
        </svg>
    );
}

export function IconTruck({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="1" y="6" width="13" height="11" rx="1" />
            <path d="M14 10h4l3 3v4h-7z" />
            <circle cx="6" cy="19" r="1.5" />
            <circle cx="16.5" cy="19" r="1.5" />
        </svg>
    );
}

export function IconTrash({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 7h16" />
            <path d="M6 7V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2" />
            <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
        </svg>
    );
}

export function IconWallet({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" />
            <path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4" />
            <rect x="15" y="11" width="6" height="5" rx="1" />
        </svg>
    );
}
