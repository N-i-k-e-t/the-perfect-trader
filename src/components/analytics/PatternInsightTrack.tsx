'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';
import type { PatternInsight } from '@/types/trading';

export default function PatternInsightTrack({ insight }: { insight: PatternInsight }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;
        track('pattern_insight_shown', 'ai', {
            pattern: insight.pattern,
            confidence: insight.confidence,
            agent_source: insight.agentSource,
        });
    }, [insight.id, insight.pattern, insight.confidence, insight.agentSource]);

    return null;
}
