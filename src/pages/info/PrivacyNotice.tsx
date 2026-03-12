import InfoPageLayout from '@/components/landing/InfoPageLayout';

const PrivacyNotice = () => (
  <InfoPageLayout title="Privacy Notice">
    <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
    <p className="mb-4 text-muted-foreground">Barclays Investment Bank is committed to protecting and respecting your privacy. This notice sets out the basis on which any personal data we collect from you, or that you provide to us, will be processed by us.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">Information We Collect</h2>
    <p className="mb-4 text-muted-foreground">We may collect and process information such as your name, email address, phone number, company affiliation, and details of your interactions with our services. This data is collected when you register, complete forms, or correspond with us.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">How We Use Your Information</h2>
    <p className="mb-4 text-muted-foreground">We use information held about you to provide and improve our services, to comply with legal and regulatory obligations, and to communicate with you regarding products and services that may be of interest.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">Your Rights</h2>
    <p className="text-muted-foreground">You have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, please contact our Data Protection Officer.</p>
  </InfoPageLayout>
);

export default PrivacyNotice;
