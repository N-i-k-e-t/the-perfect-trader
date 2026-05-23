'use client';

import { useMemo, useState } from 'react';
import PnLCalendar from '@/components/calendar/PnLCalendar';
import TimelineCalendar from '@/components/calendar/TimelineCalendar';
import { EventCountdownBanner } from '@/components/calendar/EventCountdownBanner';
import { usePerfectTrader } from '@/lib/context';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ShieldCheck, AlertCircle, Zap, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { generateNseFoExpiryEvents, mergeMarketEvents, nextHighImpactEvent } from '@/lib/nse-expiry';

type EventFilter = 'all' | 'high' | 'week';

export default function CalendarPage() {
    const { dailyLogs, marketEvents } = usePerfectTrader();
    const [view, setView] = useState<'grid' | 'timeline'>('grid');
    const [eventFilter, setEventFilter] = useState<EventFilter>('all');

    const allEvents = useMemo(
        () => mergeMarketEvents(marketEvents, generateNseFoExpiryEvents(8)),
        [marketEvents]
    );
    const nextEvent = useMemo(() => nextHighImpactEvent(allEvents), [allEvents]);

    const filteredEvents = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekStr = weekEnd.toISOString().split('T')[0];
        return allEvents
            .filter((e) => e.date >= today)
            .filter((e) => {
                if (eventFilter === 'high') return e.impact === 'high' || e.impact === 'critical';
                if (eventFilter === 'week') return e.date <= weekStr;
                return true;
            })
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [allEvents, eventFilter]);

    const monthlyStats = {
        avgDiscipline: 'B+',
        tradingDays: dailyLogs.length,
        greenDays: dailyLogs.filter(l => (l.pnl || 0) > 0).length,
        disciplineA: dailyLogs.filter(l => l.grade === 'A').length,
    };

    return (
        <div className="flex flex-col gap-10 px-6 py-8 pb-32">
            <header className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center">
                            <Zap size={16} strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Result History</span>
                    </div>
                    <h1 className="text-[32px] font-black tracking-[-0.04em] text-[#1a1a2e] leading-tight text-center">Trading Calendar.</h1>
                    <p className="text-[14px] font-bold text-gray-400 leading-relaxed text-center px-4">
                        See how your discipline impacts your profits over time.
                    </p>
                </div>

                {/* VIEW TOGGLE - PREMIUM STYLE */}
                <div className="flex bg-gray-50 p-1.5 rounded-[24px] border border-gray-100/50 shadow-sm relative self-center">
                    <button 
                        onClick={() => setView('grid')}
                        className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[12px] font-black ${view === 'grid' ? 'text-white' : 'text-gray-400'}`}
                    >
                        <CalendarIcon size={14} /> Grid
                    </button>
                    <button 
                        onClick={() => setView('timeline')}
                        className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[12px] font-black ${view === 'timeline' ? 'text-white' : 'text-gray-400'}`}
                    >
                        <Clock size={14} /> Timeline
                    </button>
                    <motion.div 
                        initial={false}
                        animate={{ x: view === 'grid' ? 0 : '100%' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-[#1a1a2e] rounded-[20px] shadow-lg z-0"
                    />
                </div>
            </header>

            {nextEvent && <EventCountdownBanner event={nextEvent} />}

            <AnimatePresence mode="wait">
                {view === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <PnLCalendar />
                    </motion.div>
                ) : (
                    <motion.div
                        key="timeline"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <TimelineCalendar />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Insights */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#22c55e]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quality</span>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-[#1a1a2e]">{monthlyStats.avgDiscipline}</span>
                        <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{monthlyStats.disciplineA} 'A' Days</p>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#2563eb]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-[#1a1a2e]">{monthlyStats.tradingDays}</span>
                        <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{monthlyStats.greenDays} Profitable</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Crucial Events */}
            <section className="pb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Market Events</h3>
                    <div className="h-[1px] flex-1 bg-gray-50 ml-4" />
                </div>
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                    {(['all', 'high', 'week'] as EventFilter[]).map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setEventFilter(f)}
                            className={`px-4 h-9 rounded-full text-[11px] font-black uppercase whitespace-nowrap ${
                                eventFilter === f ? 'bg-[#1a1a2e] text-white' : 'bg-gray-100 text-gray-400'
                            }`}
                        >
                            {f === 'all' ? 'All' : f === 'high' ? 'High impact' : 'This week'}
                        </button>
                    ))}
                </div>
                <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-50">
                    {filteredEvents.slice(0, 8).map((event, idx, arr) => (
                        <div 
                            key={event.id} 
                            className={`p-5 flex items-center justify-between ${idx !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                                    event.impact === 'critical' || event.impact === 'high'
                                        ? 'bg-red-50 text-red-500'
                                        : event.impact === 'medium'
                                          ? 'bg-yellow-50 text-yellow-600'
                                          : 'bg-gray-50 text-gray-400'
                                }`}>
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-[15px] font-black text-[#1a1a2e]">{event.title}</p>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                                        {new Date(event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} • {event.time}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border ${
                                event.impact === 'critical' || event.impact === 'high'
                                    ? 'text-red-500 bg-red-50 border-red-100'
                                    : event.impact === 'medium'
                                      ? 'text-yellow-700 bg-yellow-50 border-yellow-100'
                                      : 'text-gray-500 bg-gray-50 border-gray-100'
                            }`}>
                                {event.impact}
                            </span>
                        </div>
                    ))}
                    {filteredEvents.length === 0 && (
                        <div className="p-10 text-center">
                            <p className="text-sm font-bold text-gray-300 uppercase tracking-widest italic">No major events detected</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
