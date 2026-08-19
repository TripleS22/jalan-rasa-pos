import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-neutral-900 text-neutral-900 focus:border-neutral-900'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800 focus:border-neutral-300 focus:text-neutral-800') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
