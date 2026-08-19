import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-neutral-900 bg-neutral-100 text-neutral-900 focus:border-neutral-900 focus:bg-neutral-100 focus:text-neutral-900'
                    : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-800 focus:border-neutral-300 focus:bg-neutral-50 focus:text-neutral-800'
            } text-sm font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
