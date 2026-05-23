'use client';

import { useState, useMemo } from 'react';
import { useModalTracking } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerfectTrader } from '@/lib/context';
import { Plus, GripVertical, ChevronDown, X } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

type Tab = 'active' | 'playbooks' | 'library';
type Category = 'All' | 'Psychology' | 'Risk' | 'Entry' | 'Exit' | 'Sizing';

const SEED_SUGGESTIONS = [
    { text: 'Never risk more than 1% per trade', emoji: '🛡️', category: 'Risk' as Category },
    { text: 'No trades in the first 15 minutes', emoji: '🕘', category: 'Entry' as Category },
    { text: 'Stop after 3 trades per day', emoji: '🔢', category: 'Sizing' as Category },
];

const LIBRARY_SECTIONS = [
    {
        title: '📖 Livermore',
        category: 'Risk',
        rules: [
            { text: 'Never average losses', emoji: '📉', category: 'Risk' },
            { text: 'Buy rising stocks, sell falling', emoji: '📈', category: 'Entry' },
            { text: 'Speculation is a hard business', emoji: '🏛️', category: 'Psychology' },
        ],
    },
    {
        title: '🧠 Douglas',
        category: 'Psychology',
        rules: [
            { text: 'Predefine risk on every trade', emoji: '🛡️', category: 'Risk' },
            { text: 'Completely accept the risk', emoji: '🤝', category: 'Psychology' },
            { text: 'Act on edges without reservation', emoji: '⚡', category: 'Entry' },
        ],
    },
    {
        title: '📐 Tharp',
        category: 'Sizing',
        rules: [
            { text: 'Focus on R-multiples', emoji: '🔢', category: 'Sizing' },
            { text: 'Your bias is the enemy', emoji: '🧠', category: 'Psychology' },
        ],
    },
    {
        title: '🎯 Day Trading',
        category: 'Entry',
        rules: [
            { text: 'No trades in first 15 mins', emoji: '🕘', category: 'Entry' },
            { text: 'Max 3 trades per day', emoji: '🔢', category: 'Sizing' },
            { text: 'Exit all positions before close', emoji: '🔔', category: 'Exit' },
        ],
    },
];

export default function RulesPage() {
    const { rules, playbooks, addRule, toggleRuleActive, dailyLogs, showToast } = usePerfectTrader();

    const [activeTab, setActiveTab] = useState<Tab>('active');
    const [libCategory, setLibCategory] = useState<Category>('All');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [ruleTextError, setRuleTextError] = useState<string | null>(null);
    useModalTracking('rule_create_modal', isSheetOpen);

    const [ruleText, setRuleText] = useState('');
    const [ruleEmoji, setRuleEmoji] = useState('🎯');
    const [ruleCategory, setRuleCategory] = useState<Category>('Psychology');
    const [importOpen, setImportOpen] = useState(false);
    const [importText, setImportText] = useState('');

    const activeRules = useMemo(() => rules.filter((r) => r.isActive !== false), [rules]);

    const getCompliance = (ruleId: string) => {
        const last30Days = Array.from({ length: 30 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        });
        const followedDays = dailyLogs.filter(
            (log) => last30Days.includes(log.date) && log.rulesChecked.includes(ruleId)
        ).length;
        const percentage = Math.round((followedDays / 30) * 100);
        return { count: followedDays, percent: percentage };
    };

    const handleImportRules = () => {
        const lines = importText
            .split(/\n|;/)
            .map((l) => l.replace(/^[-•*\d.)]+\s*/, '').trim())
            .filter((l) => l.length > 3);
        if (lines.length === 0) {
            showToast('Paste one rule per line', 'info');
            return;
        }
        lines.forEach((text, i) => {
            addRule({
                id: `import_${Date.now()}_${i}`,
                text,
                emoji: '🎯',
                category: 'Psychology',
                isActive: true,
            });
        });
        showToast(`${lines.length} rules imported`, 'success');
        setImportText('');
        setImportOpen(false);
    };

    const handleSaveRule = () => {
        if (!ruleText.trim()) {
            setRuleTextError('Describe your rule in one clear sentence');
            return;
        }
        setRuleTextError(null);
        addRule({
            id: `rule_${Date.now()}`,
            text: ruleText.trim(),
            emoji: ruleEmoji,
            category: ruleCategory,
            isActive: true,
        });
        showToast('Rule added to your system', 'success');
        setRuleText('');
        setIsSheetOpen(false);
    };

    const addSeedRule = (seed: (typeof SEED_SUGGESTIONS)[0]) => {
        addRule({
            id: `seed_${Date.now()}`,
            text: seed.text,
            emoji: seed.emoji,
            category: seed.category,
            isActive: true,
        });
        showToast('Rule added', 'success');
    };

    const emojiOptions = ['🎯', '🛡️', '🧠', '📉', '📈', '🤝', '⚡', '🔢', '🔔', '🌍', '📊', '🕯️'];

    return (
        <div className="min-h-[100dvh] bg-white flex flex-col pb-[calc(env(safe-area-inset-bottom)+120px)] max-w-[390px] mx-auto w-full overflow-x-hidden">
            <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-[#f3f4f6] flex flex-col px-4 pt-2">
                <div className="flex items-center justify-between mb-4 min-h-[44px]">
                    <h1 className="text-[20px] font-semibold text-[#111827]">My Trading Plan</h1>
                    <button
                        type="button"
                        onClick={() => setIsSheetOpen(true)}
                        className="min-h-[44px] px-5 rounded-xl btn-primary text-[14px] font-semibold flex items-center gap-2 active:scale-[0.97] shadow-sm"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Add Rule
                    </button>
                </div>

                <div className="flex w-full overflow-x-auto gap-6 pb-0 scrollbar-hide">
                    {(
                        [
                            ['active', 'Active Rules'],
                            ['playbooks', 'Playbooks'],
                            ['library', 'Rule Library'],
                        ] as const
                    ).map(([tab, label]) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 text-[14px] font-semibold shrink-0 border-b-2 min-h-[44px] ${
                                activeTab === tab
                                    ? 'border-[#1a1a2e] text-[#111827]'
                                    : 'border-transparent text-[#9ca3af]'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-4 flex-1 pt-4">
                {activeTab === 'active' && (
                    <button
                        type="button"
                        onClick={() => setImportOpen((o) => !o)}
                        className="w-full mb-4 min-h-[44px] rounded-2xl border border-dashed border-[#f3f4f6] text-[14px] font-medium text-[#6b7280] active:scale-[0.97]"
                    >
                        {importOpen ? 'Hide import' : 'Paste rules as text →'}
                    </button>
                )}
                {importOpen && activeTab === 'active' && (
                    <div className="mb-4 flex flex-col gap-3 p-4 rounded-2xl bg-[#f3f4f6] border border-[#f3f4f6]">
                        <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="One rule per line"
                            className="w-full min-h-[100px] rounded-lg p-3 text-[16px] font-medium border border-[#f3f4f6] bg-white"
                        />
                        <button
                            type="button"
                            onClick={handleImportRules}
                            className="min-h-[44px] btn-primary rounded-xl font-semibold text-[14px]"
                        >
                            Import rules
                        </button>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {activeTab === 'active' ? (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-3"
                        >
                            {activeRules.length > 0 ? (
                                activeRules.map((rule) => {
                                    const stats = getCompliance(rule.id);
                                    return (
                                        <div
                                            key={rule.id}
                                            className="bg-white rounded-2xl p-4 border border-[#f3f4f6] shadow-sm flex items-center gap-3 min-h-[72px]"
                                        >
                                            <span className="text-[#9ca3af] shrink-0" aria-hidden>
                                                <GripVertical size={20} />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl shrink-0">{rule.emoji}</span>
                                                    <span className="text-[15px] font-semibold text-[#111827] leading-snug line-clamp-2">
                                                        {rule.text}
                                                    </span>
                                                </div>
                                                <span className="text-[12px] font-medium text-[#6b7280] mt-1 block">
                                                    Followed {stats.count}/30 days ({stats.percent}%)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleRuleActive(rule.id)}
                                                aria-label={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                                                className={`min-w-[52px] min-h-[44px] rounded-full p-1 flex items-center shrink-0 ${
                                                    rule.isActive ? 'bg-[#10b981] justify-end' : 'bg-[#e5e7eb] justify-start'
                                                }`}
                                            >
                                                <span className="w-6 h-6 bg-white rounded-full shadow-sm block" />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 flex flex-col gap-6">
                                    <EmptyState
                                        emoji="📔"
                                        title="Trading plan pending"
                                        description="Add the rules you break when it hurts most."
                                        ctaText="Browse library"
                                        onCtaClick={() => setActiveTab('library')}
                                    />
                                    <div className="flex flex-col gap-3">
                                        <p className="text-[12px] font-medium text-[#9ca3af] uppercase tracking-wide text-center">
                                            Quick starts
                                        </p>
                                        {SEED_SUGGESTIONS.map((seed) => (
                                            <button
                                                key={seed.text}
                                                type="button"
                                                onClick={() => addSeedRule(seed)}
                                                className="w-full min-h-[44px] px-4 py-3 rounded-2xl border border-[#f3f4f6] bg-white text-left flex items-center gap-3 active:scale-[0.97]"
                                            >
                                                <span className="text-xl">{seed.emoji}</span>
                                                <span className="text-[14px] font-medium text-[#111827]">{seed.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : activeTab === 'playbooks' ? (
                        <motion.div
                            key="playbooks"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-4"
                        >
                            {playbooks.length > 0 ? (
                                playbooks.map((pb) => (
                                    <div
                                        key={pb.id}
                                        className="bg-[#1a1a2e] rounded-2xl p-6 text-white shadow-md"
                                    >
                                        <h3 className="text-[18px] font-semibold mb-2">{pb.name}</h3>
                                        <p className="text-[14px] text-white/70 mb-4 leading-relaxed">{pb.description}</p>
                                        <div className="flex flex-col gap-2">
                                            {pb.rules.map((ruleId) => {
                                                const rule = rules.find((r) => r.id === ruleId);
                                                return rule ? (
                                                    <div
                                                        key={ruleId}
                                                        className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10 min-h-[44px]"
                                                    >
                                                        <span>{rule.emoji}</span>
                                                        <span className="text-[14px] font-medium text-white/90">{rule.text}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8">
                                    <EmptyState
                                        emoji="🏆"
                                        title="Create your playbook"
                                        description="Group rules for a specific strategy (e.g. trend following)."
                                        ctaText="Create playbook"
                                        onCtaClick={() => showToast('Playbook creator coming soon!', 'info')}
                                    />
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="library"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                {(['All', 'Psychology', 'Risk', 'Entry', 'Exit', 'Sizing'] as Category[]).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setLibCategory(cat)}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap text-[12px] font-medium min-h-[44px] ${
                                            libCategory === cat
                                                ? 'bg-[#1a1a2e] text-white'
                                                : 'bg-[#f3f4f6] text-[#6b7280]'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {LIBRARY_SECTIONS.map((section, idx) => {
                                const visibleRules = section.rules.filter(
                                    (r) => libCategory === 'All' || r.category === libCategory
                                );
                                if (visibleRules.length === 0) return null;

                                return (
                                    <div key={idx} className="flex flex-col gap-3">
                                        <h3 className="text-[12px] font-medium text-[#9ca3af] uppercase tracking-wide px-1">
                                            {section.title}
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            {visibleRules.map((rule, j) => {
                                                const isAdded = rules.some((r) => r.text === rule.text);
                                                return (
                                                    <div
                                                        key={j}
                                                        className="bg-white rounded-2xl p-4 flex items-center justify-between border border-[#f3f4f6] min-h-[44px]"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className="text-xl shrink-0">{rule.emoji}</span>
                                                            <p className="text-[14px] font-medium text-[#111827]">{rule.text}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            disabled={isAdded}
                                                            onClick={() => {
                                                                addRule({
                                                                    id: `lib_${Date.now()}_${j}`,
                                                                    ...rule,
                                                                    isActive: true,
                                                                });
                                                                showToast('Rule imported', 'success');
                                                            }}
                                                            className={`min-h-[44px] px-4 rounded-xl text-[12px] font-semibold ${
                                                                isAdded
                                                                    ? 'text-[#10b981] bg-emerald-50'
                                                                    : 'bg-[#10b981] text-white'
                                                            }`}
                                                        >
                                                            {isAdded ? 'Added' : '+ Add'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {isSheetOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSheetOpen(false)}
                            className="fixed inset-0 bg-black/40 z-[150]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed left-1/2 -translate-x-1/2 bottom-0 z-[160] w-full max-w-[390px] bg-white rounded-t-2xl p-6 pb-[calc(env(safe-area-inset-bottom)+24px)] flex flex-col gap-6"
                        >
                            <div className="w-12 h-1 bg-[#f3f4f6] rounded-full mx-auto" />
                            <div className="flex items-center justify-between">
                                <h2 className="text-[18px] font-semibold text-[#111827]">Create rule</h2>
                                <button
                                    type="button"
                                    onClick={() => setIsSheetOpen(false)}
                                    className="min-w-[44px] min-h-[44px] rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#6b7280]"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                {emojiOptions.map((e) => (
                                    <button
                                        key={e}
                                        type="button"
                                        onClick={() => setRuleEmoji(e)}
                                        className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                                            ruleEmoji === e ? 'bg-[#1a1a2e] text-white' : 'bg-[#f3f4f6]'
                                        }`}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-medium text-[#6b7280]">Rule detail</label>
                                    <textarea
                                        value={ruleText}
                                        onChange={(e) => {
                                            setRuleText(e.target.value);
                                            if (ruleTextError) setRuleTextError(null);
                                        }}
                                        placeholder="e.g. Never risk more than 2% per trade"
                                        className="w-full bg-white rounded-lg p-4 text-[16px] font-medium text-[#111827] border border-[#f3f4f6] min-h-[100px]"
                                    />
                                    {ruleTextError && (
                                        <p className="text-[14px] text-[#ef4444]">{ruleTextError}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-medium text-[#6b7280]">Category</label>
                                    <div className="relative">
                                        <select
                                            value={ruleCategory}
                                            onChange={(e) => setRuleCategory(e.target.value as Category)}
                                            className="w-full bg-white rounded-lg px-4 min-h-[52px] text-[16px] font-medium text-[#111827] border border-[#f3f4f6] appearance-none"
                                        >
                                            {['Psychology', 'Risk', 'Entry', 'Exit', 'Sizing'].map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={20}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSaveRule}
                                    className="w-full min-h-[52px] btn-primary rounded-xl font-semibold text-[16px] shadow-sm active:scale-[0.97] mt-2"
                                >
                                    Save rule
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
