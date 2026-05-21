import { redirect } from 'next/navigation';

/** Legacy route — app home is `/today`. */
export default function DashboardRedirect() {
    redirect('/today');
}
