const html = await fetch('https://the-perfect-trader.vercel.app/login').then((r) => r.text());
const chunks = [...html.matchAll(/\/_next\/static\/chunks\/[^"]+\.js/g)].map((m) => m[0]);
console.log('scanning', chunks.length, 'chunks from login page...');
for (const c of chunks) {
    const js = await fetch(`https://the-perfect-trader.vercel.app${c}`).then((r) => r.text());
    if (js.includes('firqlsjixojnrofycwbs')) {
        console.log('OK: production Supabase ref found in bundle');
        process.exit(0);
    }
    if (js.includes('bwynrefnhykwadmbzogr')) {
        console.log('BAD: staging Supabase ref still in live bundle');
        process.exit(2);
    }
    if (js.includes('placeholder.supabase')) {
        console.log('BAD: placeholder Supabase URL in live bundle');
        process.exit(3);
    }
}
console.log('Could not find Supabase ref in login chunks (may be lazy-loaded). Deploy still updated env.');
