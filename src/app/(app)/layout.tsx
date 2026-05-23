import AppShell from '@/components/AppShell';
import AppRouteTransition from '@/components/AppRouteTransition';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppShell>
            <AppRouteTransition>{children}</AppRouteTransition>
        </AppShell>
    );
}
