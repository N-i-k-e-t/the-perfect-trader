'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { motion, AnimatePresence, useDragControls, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
    Plus, 
    Mic, 
    Camera, 
    X,
    Sparkles,
    ArrowRight,
    Loader2,
    CheckCircle2,
    ListChecks,
    AlertCircle,
    Shield,
    FileText,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    Check
} from 'lucide-react';
import { usePerfectTrader } from '@/lib/context';
import { track, useModalTracking } from '@/lib/analytics';
import type { BaselineState } from '@/types/trading';

const EMOTION_OPTIONS: { e: string; v: BaselineState; l: string }[] = [
    { e: '😤', v: 'bad', l: 'Tilt' },
    { e: '😐', v: 'neutral', l: 'Neutral' },
    { e: '🙂', v: 'good', l: 'Good' },
    { e: '🔥', v: 'great', l: 'Great' },
];

const SNAP_POINTS = {
    PEEK: 0.7,   // 30% from top (70% down)
    HALF: 0.4,   // 60% from top (40% down)
    FULL: 0.05    // 95% from top (5% down)
};

export default function CaptureHub() {
    const {
        rules,
        addTrade,
        updateTrade,
        showToast,
        isCaptureOpen,
        setCaptureOpen,
        captureMode,
        setCaptureMode,
        editingTrade,
        clearEditingTrade,
    } = usePerfectTrader();

    useModalTracking('capture_hub_modal', isCaptureOpen);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    
    // Snapping Logic
    const [snapPoint, setSnapPoint] = useState(SNAP_POINTS.HALF);
    const dragControls = useDragControls();
    const y = useMotionValue(0);
    const springY = useSpring(y, { damping: 30, stiffness: 200 });

    // Internal Form State for Log Trade (Step-based)
    const [tradeStep, setTradeStep] = useState(1);
    const [tradeResult, setTradeResult] = useState<'WIN' | 'LOSS' | null>(null);
    const [rulesStatus, setRulesStatus] = useState<'ALL' | 'SOME' | null>(null);
    const [noteText, setNoteText] = useState('');

    const [tradeData, setTradeData] = useState({
        ticker: 'NIFTY',
        direction: 'Long' as 'Long' | 'Short',
        entry: '',
        exit: '',
        sl: '',
        size: '',
        risk: 0,
        reward: 0,
        pnl: '',
        notes: '',
        emotion: 'neutral' as BaselineState,
        checkedRules: [] as string[],
        isSystematic: true
    });

    const TRADE_STEPS = 6;

    useEffect(() => {
        if (isCaptureOpen) {
            y.set(window.innerHeight * (captureMode === 'checklist' ? SNAP_POINTS.FULL : SNAP_POINTS.HALF));
            if (editingTrade && captureMode === 'checklist') {
                const followed = editingTrade.rules_followed ?? [];
                const broken = editingTrade.rules_broken ?? [];
                setTradeStep(1);
                setTradeResult((editingTrade.pnl ?? 0) >= 0 ? 'WIN' : 'LOSS');
                setRulesStatus(
                    broken.length === 0 ? 'ALL' : followed.length > 0 ? 'SOME' : 'SOME'
                );
                setTradeData({
                    ticker: editingTrade.pair || 'NIFTY',
                    direction: editingTrade.type === 'Short' ? 'Short' : 'Long',
                    entry: editingTrade.entry ?? '',
                    exit: editingTrade.exit ?? '',
                    sl: editingTrade.plannedSL ?? '',
                    size: '',
                    risk: 0,
                    reward: 0,
                    pnl: editingTrade.pnl != null ? String(editingTrade.pnl) : '',
                    notes: editingTrade.notes ?? '',
                    emotion: (editingTrade.emotion as BaselineState) || 'neutral',
                    checkedRules: followed,
                    isSystematic: true,
                });
            } else if (captureMode === 'checklist') {
                setTradeStep(1);
                setTradeResult(null);
                setRulesStatus(null);
            }
        } else {
            y.set(window.innerHeight);
        }
    }, [isCaptureOpen, captureMode, editingTrade]);

    const handleParseNote = async () => {
        if (!noteText.trim()) {
            showToast('Enter a note first', 'error');
            return;
        }
        setIsProcessing(true);
        const started = Date.now();
        track('ai_diary_scan_started', 'ai', { scan_type: 'note' });
        try {
            const res = await fetch('/api/parse-trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    note: noteText,
                    activeRules: rules.filter((r) => r.isActive !== false),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Parse failed');

            const pnlNum = Number(data.pnl);
            setTradeData((prev) => ({
                ...prev,
                ticker: (data.asset || data.pair || prev.ticker || 'NIFTY').toString().toUpperCase(),
                direction: data.direction === 'Short' ? 'Short' : 'Long',
                entry: data.entry != null ? String(data.entry) : prev.entry,
                exit: data.exit != null ? String(data.exit) : prev.exit,
                pnl: data.pnl != null ? String(data.pnl) : prev.pnl,
                emotion: data.emotion_tags || prev.emotion,
                notes: noteText,
                checkedRules: Array.isArray(data.rules_followed) ? data.rules_followed : prev.checkedRules,
            }));
            setTradeResult(!Number.isNaN(pnlNum) && pnlNum >= 0 ? 'WIN' : 'LOSS');
            if (Array.isArray(data.rules_broken) && data.rules_broken.length > 0) {
                setRulesStatus('SOME');
            } else {
                setRulesStatus('ALL');
            }
            track('ai_diary_scan_completed', 'ai', {
                scan_type: 'note',
                confidence: 0.85,
                fields_extracted: ['ticker', 'direction', 'pnl', 'entry', 'exit'],
                latency_ms: Date.now() - started,
                has_image: false,
            });
            setCaptureMode('checklist');
            setTradeStep(6);
            showToast('Note parsed — review and save', 'success');
        } catch {
            showToast('Could not parse note. Try manual entry.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDragEnd = (event: any, info: any) => {
        const threshold = 100;
        const currentY = y.get();
        const v = info.velocity.y;
        
        const h = window.innerHeight;
        const points = [h * SNAP_POINTS.FULL, h * SNAP_POINTS.HALF, h * SNAP_POINTS.PEEK, h];
        
        // Find closest point
        const closest = points.reduce((prev, curr) => {
            return Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev;
        });

        // Handle Flick down to close
        if (v > 500 && currentY > h * 0.5) {
            reset();
            return;
        }

        y.set(closest);
        if (closest === h) reset();
    };

    const reset = useCallback(() => {
        clearEditingTrade();
        setCaptureOpen(false);
        setCaptureMode('none');
        setIsProcessing(false);
        setIsRecording(false);
        setCapturedImage(null);
        setTradeStep(1);
        setTradeResult(null);
        setRulesStatus(null);
        setNoteText('');
        setTradeData({
            ticker: 'NIFTY',
            direction: 'Long',
            entry: '',
            exit: '',
            sl: '',
            size: '',
            risk: 0,
            reward: 0,
            pnl: '',
            notes: '',
            emotion: 'neutral' as BaselineState,
            checkedRules: [],
            isSystematic: true
        });
    }, [clearEditingTrade, setCaptureOpen, setCaptureMode]);

    useEscapeKey(reset, captureMode !== 'none');

    const handleSaveTrade = () => {
        const isEdit = Boolean(editingTrade);
        const finalRules =
            rulesStatus === 'ALL'
                ? rules.filter((r) => r.isActive !== false).map((r) => r.id)
                : tradeData.checkedRules;

        const tradeId = editingTrade?.id ?? Date.now().toString();
        const brokenIds = rules
            .filter((r) => r.isActive !== false && !finalRules.includes(r.id))
            .map((r) => r.id);
        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];
        const timestamp = now.toISOString();
        const timeOfDay = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata',
        });
        const pnlValue = tradeData.pnl !== '' ? Number(tradeData.pnl) : 0;

        const tradePayload = {
            id: tradeId,
            date: editingTrade?.date?.split('T')[0] ?? todayDate,
            timestamp: editingTrade?.timestamp ?? timestamp,
            time_of_day: editingTrade?.time_of_day ?? timeOfDay,
            pair: tradeData.ticker || 'NIFTY',
            type: tradeData.direction,
            entry: tradeData.entry,
            exit: tradeData.exit,
            plannedSL: tradeData.sl,
            pnl: Number.isNaN(pnlValue) ? 0 : pnlValue,
            rules_followed: finalRules,
            rules_broken: brokenIds,
            emotion: tradeData.emotion as BaselineState,
            notes: tradeData.notes,
        };

        reset();
        showToast(isEdit ? 'Trade updated' : 'Trade logged', 'success');

        if (isEdit) {
            updateTrade(tradePayload, ['pair', 'type', 'entry', 'exit', 'pnl', 'rules', 'emotion', 'notes']);
        } else {
            finalRules.forEach((ruleId) => {
                track('rule_followed_flagged', 'rules', { rule_id: ruleId, trade_id: tradeId });
            });
            brokenIds.forEach((ruleId) => {
                track('rule_violated_flagged', 'rules', {
                    rule_id: ruleId,
                    trade_id: tradeId,
                    session_date: todayDate,
                });
            });
            addTrade(tradePayload);
        }
    };

    if (captureMode === 'none') return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center italic-none">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={reset}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Premium Bottom Sheet */}
            <motion.div
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: window.innerHeight }}
                style={{ y: springY }}
                onDragEnd={handleDragEnd}
                className="relative w-full max-w-[390px] h-[92vh] bg-white rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
            >
                {/* Drag Handle Area */}
                <div 
                    onPointerDown={(e) => dragControls.start(e)}
                    className="flex-none p-6 pb-2 cursor-grab active:cursor-grabbing"
                >
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" />
                </div>

                {/* Dynamic Content */}
                <div className="flex-1 sheet-scroll px-8 pb-32 custom-scrollbar">
                    {captureMode === 'initial' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-4"
                        >
                            <h2 className="text-[32px] font-black text-[#1a1a2e] leading-tight mb-2">Record.</h2>
                            <p className="text-[15px] font-bold text-gray-400 mb-10">Choose your entry mode.</p>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <button onClick={() => setCaptureMode('checklist')} className="aspect-square bg-yellow-50 rounded-[32px] flex flex-col items-center justify-center gap-4 active:scale-95 transition-all text-yellow-600 border border-yellow-100/50 shadow-sm">
                                    <ListChecks size={36} strokeWidth={2.5} />
                                    <span className="font-black text-[14px] uppercase tracking-widest">Log Trade</span>
                                </button>
                                <button onClick={() => setCaptureMode('note')} className="aspect-square bg-orange-50 rounded-[32px] flex flex-col items-center justify-center gap-4 active:scale-95 transition-all text-orange-600 border border-orange-100/50 shadow-sm">
                                    <FileText size={36} strokeWidth={2.5} />
                                    <span className="font-black text-[14px] uppercase tracking-widest">Quick Note</span>
                                </button>
                                <button type="button" disabled className="relative aspect-square bg-red-50/60 rounded-[32px] flex flex-col items-center justify-center gap-4 text-red-400 border border-red-100/50 opacity-70 cursor-not-allowed">
                                    <span className="absolute top-3 right-3 text-[9px] font-black bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">SOON</span>
                                    <Mic size={36} strokeWidth={2.5} />
                                    <span className="font-black text-[14px] uppercase tracking-widest">Voice</span>
                                </button>
                                <button type="button" disabled className="relative aspect-square bg-blue-50/60 rounded-[32px] flex flex-col items-center justify-center gap-4 text-blue-400 border border-blue-100/50 opacity-70 cursor-not-allowed">
                                    <span className="absolute top-3 right-3 text-[9px] font-black bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">SOON</span>
                                    <Camera size={36} strokeWidth={2.5} />
                                    <span className="font-black text-[14px] uppercase tracking-widest">Scan</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {captureMode === 'checklist' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="pt-4 flex flex-col gap-8"
                        >
                            <header>
                                <h2 className="text-[32px] font-black text-[#1a1a2e] leading-tight mb-1">Log Trade.</h2>
                                <p className="text-[14px] font-bold text-gray-400">Step {tradeStep} of {TRADE_STEPS}</p>
                            </header>

                            {/* STEP 1: DIRECTION + RESULT */}
                            {tradeStep === 1 && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-6">
                                    <h3 className="text-xl font-black text-[#1a1a2e]">Direction</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setTradeData({ ...tradeData, direction: 'Long' })}
                                            className={`h-32 rounded-[32px] border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                                tradeData.direction === 'Long'
                                                    ? 'bg-green-50 border-green-500 shadow-lg'
                                                    : 'bg-green-50/40 border-transparent active:border-green-500'
                                            }`}
                                        >
                                            <TrendingUp size={36} className="text-green-500" />
                                            <span className="font-black text-green-600 uppercase tracking-widest text-lg">Long</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTradeData({ ...tradeData, direction: 'Short' })}
                                            className={`h-32 rounded-[32px] border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                                tradeData.direction === 'Short'
                                                    ? 'bg-red-50 border-red-500 shadow-lg'
                                                    : 'bg-red-50/40 border-transparent active:border-red-500'
                                            }`}
                                        >
                                            <TrendingDown size={36} className="text-red-500" />
                                            <span className="font-black text-red-600 uppercase tracking-widest text-lg">Short</span>
                                        </button>
                                    </div>

                                    <h3 className="text-xl font-black text-[#1a1a2e]">Result</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setTradeResult('WIN')}
                                            className={`h-24 rounded-[28px] border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                                tradeResult === 'WIN'
                                                    ? 'bg-green-50 border-green-500 shadow-lg'
                                                    : 'bg-green-50/40 border-transparent active:border-green-500'
                                            }`}
                                        >
                                            <TrendingUp size={28} className="text-green-500" />
                                            <span className="font-black text-green-600 uppercase tracking-widest">Win</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTradeResult('LOSS')}
                                            className={`h-24 rounded-[28px] border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                                tradeResult === 'LOSS'
                                                    ? 'bg-red-50 border-red-500 shadow-lg'
                                                    : 'bg-red-50/40 border-transparent active:border-red-500'
                                            }`}
                                        >
                                            <TrendingDown size={28} className="text-red-500" />
                                            <span className="font-black text-red-600 uppercase tracking-widest">Loss</span>
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={!tradeResult}
                                        onClick={() => setTradeStep(2)}
                                        className="w-full h-16 btn-primary rounded-[24px] font-black text-[14px] uppercase tracking-widest shadow-xl disabled:opacity-40"
                                    >
                                        Continue
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 2: SYMBOL */}
                            {tradeStep === 2 && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-6">
                                    <h3 className="text-xl font-black text-[#1a1a2e]">Symbol</h3>
                                    <input
                                        placeholder="Ticker (e.g. NIFTY)"
                                        value={tradeData.ticker}
                                        onChange={(e) => setTradeData({ ...tradeData, ticker: e.target.value.toUpperCase() })}
                                        className="w-full h-14 bg-gray-50 rounded-2xl px-5 font-bold outline-none border border-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setTradeStep(3)}
                                        className="w-full h-16 btn-primary rounded-[24px] font-black text-[14px] uppercase tracking-widest shadow-xl"
                                    >
                                        Continue
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 3: ENTRY / EXIT / PNL */}
                            {tradeStep === 3 && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-5">
                                    <h3 className="text-xl font-black text-[#1a1a2e]">Prices &amp; P&amp;L</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Entry</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0"
                                                value={tradeData.entry}
                                                onChange={(e) => setTradeData({ ...tradeData, entry: e.target.value })}
                                                className="w-full h-14 bg-gray-50 rounded-2xl px-4 font-bold outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Exit</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0"
                                                value={tradeData.exit}
                                                onChange={(e) => setTradeData({ ...tradeData, exit: e.target.value })}
                                                className="w-full h-14 bg-gray-50 rounded-2xl px-4 font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">P&amp;L (₹)</span>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            placeholder={tradeResult === 'WIN' ? 'e.g. 500' : 'e.g. -200'}
                                            value={tradeData.pnl}
                                            onChange={(e) => setTradeData({ ...tradeData, pnl: e.target.value })}
                                            className="w-full h-14 bg-gray-50 rounded-2xl px-5 font-bold outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setTradeStep(4)}
                                        className="w-full h-16 btn-primary rounded-[24px] font-black text-[14px] uppercase tracking-widest shadow-xl"
                                    >
                                        Continue
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 4: RULES */}
                            {tradeStep === 4 && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-6">
                                    <h3 className="text-xl font-black text-[#1a1a2e]">Did you follow your rules?</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => { setRulesStatus('ALL'); setTradeStep(5); }}
                                            className="h-28 bg-blue-50 rounded-[28px] border-2 border-transparent active:border-blue-500 transition-all flex flex-col items-center justify-center gap-2 px-4 text-center"
                                        >
                                            <CheckCircle2 size={24} className="text-blue-500" />
                                            <span className="font-black text-blue-600 uppercase tracking-widest text-[11px]">YES, ALL</span>
                                        </button>
                                        <button 
                                            onClick={() => { setRulesStatus('SOME'); }}
                                            className={`h-28 rounded-[28px] border-2 transition-all flex flex-col items-center justify-center gap-2 px-4 text-center ${rulesStatus === 'SOME' ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white shadow-xl' : 'bg-gray-50 border-transparent text-gray-400'}`}
                                        >
                                            <AlertCircle size={24} className={rulesStatus === 'SOME' ? 'text-white' : 'text-gray-300'} />
                                            <span className={`font-black uppercase tracking-widest text-[11px] ${rulesStatus === 'SOME' ? 'text-white' : 'text-gray-400'}`}>BROKE SOME</span>
                                        </button>
                                    </div>

                                    {rulesStatus === 'SOME' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-4">
                                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Check rules you FOLLOWED:</p>
                                            {rules.filter(r => r.isActive !== false).map(rule => (
                                                <button 
                                                    key={rule.id}
                                                    onClick={() => {
                                                        const current = tradeData.checkedRules;
                                                        setTradeData({
                                                            ...tradeData, 
                                                            checkedRules: current.includes(rule.id) ? current.filter(id => id !== rule.id) : [...current, rule.id]
                                                        });
                                                    }}
                                                    className={`flex items-center gap-4 p-4 rounded-[24px] border transition-all ${tradeData.checkedRules.includes(rule.id) ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-100'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${tradeData.checkedRules.includes(rule.id) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200'}`}>
                                                        {tradeData.checkedRules.includes(rule.id) && <Check size={14} strokeWidth={4} />}
                                                    </div>
                                                    <span className={`text-[14px] font-bold ${tradeData.checkedRules.includes(rule.id) ? 'text-[#1a1a2e]' : 'text-gray-300'}`}>
                                                        {rule.text}
                                                    </span>
                                                </button>
                                            ))}
                                            <button 
                                                type="button"
                                                onClick={() => setTradeStep(5)}
                                                className="w-full h-16 btn-primary rounded-[24px] font-black text-[14px] uppercase tracking-widest mt-4 shadow-xl mb-4"
                                            >
                                                Continue
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 5: EMOTION */}
                            {tradeStep === 5 && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-6">
                                    <h3 className="text-xl font-black text-[#1a1a2e]">How did you feel?</h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {EMOTION_OPTIONS.map((item) => (
                                            <button
                                                key={item.v}
                                                type="button"
                                                onClick={() => setTradeData({ ...tradeData, emotion: item.v })}
                                                className={`flex flex-col items-center justify-center gap-1 h-24 rounded-[28px] border-2 ${
                                                    tradeData.emotion === item.v
                                                        ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white'
                                                        : 'bg-white border-gray-100 text-gray-400'
                                                }`}
                                            >
                                                <span className="text-2xl">{item.e}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest">{item.l}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setTradeStep(6)}
                                        className="w-full h-16 btn-primary rounded-[24px] font-black text-[14px] uppercase tracking-widest shadow-xl"
                                    >
                                        Continue
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 6: NOTES + SAVE */}
                            {tradeStep === 6 && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-6">
                                    <h3 className="text-xl font-black text-[#1a1a2e]">Notes (optional)</h3>
                                    <textarea 
                                        placeholder="What happened on this trade?" 
                                        rows={3}
                                        value={tradeData.notes}
                                        onChange={(e) => setTradeData({ ...tradeData, notes: e.target.value })}
                                        className="w-full bg-gray-50 rounded-[28px] p-6 font-bold text-[#1a1a2e] outline-none border border-gray-100 resize-none"
                                    />
                                    <div className="flex flex-col gap-4 mt-2">
                                        <button 
                                            type="button"
                                            onClick={handleSaveTrade}
                                            disabled={isProcessing}
                                            className="w-full h-20 btn-primary rounded-[32px] font-black text-[18px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader2 className="animate-spin" /> : <>{editingTrade ? 'UPDATE TRADE' : 'SAVE TRADE'}</>}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setTradeStep(5)}
                                            className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {captureMode === 'note' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 flex flex-col gap-6">
                            <header>
                                <h2 className="text-[32px] font-black text-[#1a1a2e] leading-tight mb-1">Quick Note</h2>
                                <p className="text-[14px] font-bold text-gray-400">Paste or type — AI extracts trade fields.</p>
                            </header>
                            <textarea
                                placeholder="e.g. Long NIFTY 24500 entry, exited 24580, +₹800, broke my stop rule..."
                                rows={6}
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="w-full bg-gray-50 rounded-[28px] p-6 font-bold text-[#1a1a2e] outline-none border border-gray-100 resize-none"
                            />
                            <button
                                type="button"
                                onClick={handleParseNote}
                                disabled={isProcessing}
                                className="w-full h-16 btn-primary rounded-[28px] font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={22} /> : <>Parse with AI <Sparkles size={18} /></>}
                            </button>
                            <button
                                type="button"
                                onClick={() => setCaptureMode('checklist')}
                                className="w-full h-14 text-gray-400 font-black text-[13px] uppercase tracking-widest"
                            >
                                Enter manually instead
                            </button>
                        </motion.div>
                    )}

                    {(captureMode === 'voice' || captureMode === 'photo') && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pt-20 flex flex-col items-center text-center gap-8 px-4">
                            <div className="w-24 h-24 rounded-[32px] bg-gray-100 text-gray-400 flex items-center justify-center">
                                {captureMode === 'voice' ? <Mic size={42} /> : <Camera size={42} />}
                            </div>
                            <div>
                                <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1 rounded-full mb-3">Coming soon</span>
                                <h2 className="text-[26px] font-black text-[#1a1a2e] mb-2">
                                    {captureMode === 'voice' ? 'Voice capture' : 'Scan capture'}
                                </h2>
                                <p className="text-[15px] font-bold text-gray-400">This mode is not available in beta yet. Use Quick Note or manual log.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCaptureMode('checklist')}
                                className="w-full h-16 btn-primary rounded-[24px] font-black text-[14px] uppercase tracking-widest active:scale-95"
                            >
                                Log trade manually
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
