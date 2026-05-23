import MarketingDocLayout from '@/components/marketing/MarketingDocLayout';
import ContactForm from '@/components/marketing/ContactForm';

export default function ContactPage() {
    return (
        <MarketingDocLayout
            title="Talk to Niket directly."
            subtitle="Beta users get direct access. No support ticket system."
        >
            <ContactForm />
        </MarketingDocLayout>
    );
}
