let cached: Record<string, string | number | boolean | null> | null = null;

function detectOs(ua: string): string {
    if (/Windows NT 10/.test(ua)) return 'Windows 10+';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad/.test(ua)) return 'iOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Unknown';
}

function detectBrowser(ua: string): { name: string; version: string } {
    const edge = ua.match(/Edg\/(\d+)/);
    if (edge) return { name: 'Edge', version: edge[1] };
    const chrome = ua.match(/Chrome\/(\d+)/);
    if (chrome && !/Edg/.test(ua)) return { name: 'Chrome', version: chrome[1] };
    const safari = ua.match(/Version\/(\d+).*Safari/);
    if (safari) return { name: 'Safari', version: safari[1] };
    const firefox = ua.match(/Firefox\/(\d+)/);
    if (firefox) return { name: 'Firefox', version: firefox[1] };
    return { name: 'Unknown', version: '' };
}

function deviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
}

export function getDeviceInfo(): Record<string, string | number | boolean | null> {
    if (cached) return cached;
    if (typeof window === 'undefined') {
        cached = { device_type: 'desktop' };
        return cached;
    }

    const ua = navigator.userAgent;
    const { name, version } = detectBrowser(ua);
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;

    cached = {
        device_type: deviceType(),
        os: detectOs(ua),
        browser: name,
        browser_version: version,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        is_pwa: window.matchMedia('(display-mode: standalone)').matches,
        is_touch: 'ontouchstart' in window,
        connection_type: conn?.effectiveType ?? null,
    };
    return cached;
}
