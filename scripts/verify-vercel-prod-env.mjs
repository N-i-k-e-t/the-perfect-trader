import { readFileSync, existsSync } from 'fs';

const path = process.argv[2] ?? '.env.vercel.prod.check3';
if (!existsSync(path)) {
    console.error('Missing', path, '- run: npx vercel env pull', path, '--environment=production --yes');
    process.exit(1);
}
const t = readFileSync(path, 'utf8');
const anon = t.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"/)?.[1];
const url = t.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]*)"/)?.[1];
console.log('NEXT_PUBLIC_SUPABASE_URL:', url || '(empty)');
if (anon) {
    const ref = JSON.parse(Buffer.from(anon.split('.')[1], 'base64url')).ref;
    console.log('anon JWT project ref:', ref);
    console.log('URL matches JWT:', url === `https://${ref}.supabase.co`);
}
process.exit(url && anon && url.includes('firqlsjixojnrofycwbs') ? 0 : 1);
