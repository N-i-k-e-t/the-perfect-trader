import type { Trade } from '@/types/trading';

export function exportTradesToCsv(trades: Trade[], filename = 'perfect-trader-trades.csv') {
    const headers = [
        'id',
        'date',
        'pair',
        'type',
        'entry',
        'exit',
        'pnl',
        'emotion',
        'rules_followed',
        'rules_broken',
        'notes',
    ];
    const rows = trades.map((t) =>
        [
            t.id,
            t.date,
            t.pair,
            t.type,
            t.entry ?? '',
            t.exit ?? '',
            t.pnl ?? '',
            t.emotion ?? '',
            (t.rules_followed ?? []).join(';'),
            (t.rules_broken ?? []).join(';'),
            (t.notes ?? '').replace(/"/g, '""'),
        ]
            .map((v) => `"${String(v)}"`)
            .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
