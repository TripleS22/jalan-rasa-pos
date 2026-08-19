import { useEffect, useState } from 'react';

function formatThousands(value) {
    if (value === '' || value === null || value === undefined) {
        return '';
    }

    return new Intl.NumberFormat('id-ID').format(value);
}

function parseThousands(display) {
    const digitsOnly = display.replace(/[^0-9]/g, '');

    return digitsOnly === '' ? '' : Number(digitsOnly);
}

export default function NumberInput({
    value,
    onChange,
    className = '',
    prefix,
    ...props
}) {
    const [display, setDisplay] = useState(formatThousands(value));

    useEffect(() => {
        setDisplay(formatThousands(value));
    }, [value]);

    function handleChange(e) {
        const raw = parseThousands(e.target.value);
        setDisplay(formatThousands(raw));
        onChange(raw);
    }

    return (
        <div className="relative">
            {prefix && (
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-neutral-400">
                    {prefix}
                </span>
            )}
            <input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={handleChange}
                className={`${prefix ? 'pl-8' : ''} ${className}`}
                {...props}
            />
        </div>
    );
}
