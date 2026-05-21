import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BETA_USER_CAP, IS_BETA } from '@/lib/config';

export async function GET() {
    if (!IS_BETA) {
        return NextResponse.json({
            max: 999999,
            current: 0,
            remaining: 999999,
            allowed: true,
            full: false,
        });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_beta_capacity');

    if (error || !data) {
        return NextResponse.json({
            max: BETA_USER_CAP,
            current: 0,
            remaining: BETA_USER_CAP,
            allowed: true,
            full: false,
            fallback: true,
        });
    }

    return NextResponse.json(data);
}
