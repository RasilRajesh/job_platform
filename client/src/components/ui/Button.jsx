import React from 'react';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    className = '',
    type = 'button',
    ...props
}) {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const variantClass = `btn-${variant}`;

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        style={{
                            width: 14,
                            height: 14,
                            border: '2px solid currentColor',
                            borderRightColor: 'transparent',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin 0.6s linear infinite'
                        }}
                    />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
                    {children}
                </>
            )}
        </button>
    );
}
