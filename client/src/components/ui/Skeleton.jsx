import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', className = '', style = {} }) {
    return (
        <div
            className={`skeleton ${className}`.trim()}
            style={{
                width,
                height,
                borderRadius,
                ...style
            }}
            aria-hidden="true"
        />
    );
}

export function JobCardSkeleton() {
    return (
        <div className="job-card" style={{ gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Skeleton width="44px" height="44px" borderRadius="var(--radius-md)" />
                <div style={{ flex: 1, display: 'grid', gap: '6px' }}>
                    <Skeleton width="65%" height="18px" />
                    <Skeleton width="40%" height="13px" />
                </div>
            </div>
            <Skeleton width="90px" height="24px" borderRadius="var(--radius-pill)" />
            <div style={{ display: 'flex', gap: '6px', margin: '8px 0' }}>
                <Skeleton width="60px" height="22px" borderRadius="var(--radius-pill)" />
                <Skeleton width="75px" height="22px" borderRadius="var(--radius-pill)" />
                <Skeleton width="50px" height="22px" borderRadius="var(--radius-pill)" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <Skeleton width="100px" height="34px" borderRadius="var(--radius-md)" />
                <Skeleton width="34px" height="34px" borderRadius="var(--radius-sm)" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ cols = 5 }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i}>
                    <Skeleton width={i === 0 ? '70%' : '50%'} height="16px" />
                </td>
            ))}
        </tr>
    );
}

export function BentoTileSkeleton({ height = '140px' }) {
    return (
        <div className="bento-tile" style={{ minHeight: height, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
            <Skeleton width="40%" height="14px" />
            <Skeleton width="60%" height="32px" />
            <Skeleton width="30%" height="12px" />
        </div>
    );
}

export default Skeleton;
