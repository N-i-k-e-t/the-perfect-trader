import { ImageResponse } from 'next/og';
import { APP_NAME } from '@/lib/brand';

export const runtime = 'edge';
export const alt = `${APP_NAME} — Trade your plan. Every session.`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    background: '#1a1a2e',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: 64,
                    }}
                >
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            background: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1a1a2e',
                            fontSize: 28,
                            fontWeight: 900,
                            marginBottom: 32,
                        }}
                    >
                        PT
                    </div>
                    <div style={{ fontSize: 56, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
                        {APP_NAME}
                    </div>
                    <div style={{ fontSize: 28, color: '#9ca3af', marginTop: 16 }}>
                        Trade your plan. Every session.
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                        {['AI Coach', 'Daily Grade', 'Rule Streaks'].map((pill) => (
                            <div
                                key={pill}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: 999,
                                    background: 'rgba(16,185,129,0.15)',
                                    color: '#10b981',
                                    fontSize: 18,
                                    fontWeight: 700,
                                }}
                            >
                                {pill}
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    style={{
                        width: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 48,
                    }}
                >
                    <div
                        style={{
                            width: 220,
                            height: 220,
                            borderRadius: 110,
                            border: '16px solid #10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <span style={{ fontSize: 72, fontWeight: 900, color: '#10b981' }}>A</span>
                        <span style={{ fontSize: 20, color: '#9ca3af', marginTop: 8 }}>94% discipline</span>
                    </div>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 48,
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1a1a2e',
                        fontSize: 18,
                        fontWeight: 800,
                    }}
                >
                    Beta — the-perfect-trader.vercel.app
                </div>
            </div>
        ),
        { ...size }
    );
}
