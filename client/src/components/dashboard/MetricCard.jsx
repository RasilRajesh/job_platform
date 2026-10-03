import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({
    label,
    value = 0,
    trendPercent = 12,
    trendDirection = 'up',
    subtitle = 'vs last 30 days',
    icon: Icon,
    color = 'var(--primary)'
}) {
    const isUp = trendDirection === 'up';

    return (
        <div className="bento-tile metric-card">
            <div className="metric-header">
                <span className="metric-label">{label}</span>
                {Icon && (
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-subtle)',
                            display: 'grid',
                            placeItems: 'center',
                            color
                        }}
                    >
                        <Icon size={16} />
                    </div>
                )}
            </div>

            <div>
                <div className="metric-value">{value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`metric-trend ${isUp ? 'up' : 'down'}`}>
                        {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        <span>{isUp ? `+${trendPercent}%` : `-${trendPercent}%`}</span>
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</span>
                </div>
            </div>
        </div>
    );
}
