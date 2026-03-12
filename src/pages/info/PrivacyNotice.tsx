import InfoPageLayout from '@/components/landing/InfoPageLayout';
import { Link } from 'react-router-dom';

const PrivacyNotice = () => (
  <InfoPageLayout title="Privacy Notice">
    <h2 className="text-2xl font-semibold mb-4">Your Personal Information and Barclays: The Principles</h2>
    <p className="mb-4 text-muted-foreground">
      The General Data Protection Regulation (GDPR) and the UK Data Protection Act 2018 require us to tell you about the information we hold about you, what we use it for, and who we share it with. This notice sets out the basis on which any personal data we collect from you, or that you provide to us, will be processed by us.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Barclays' Responsibilities to You</h2>
    <ol className="list-decimal list-inside space-y-3 mb-6 text-muted-foreground">
      <li>We will never sell your personal information to anyone.</li>
      <li>We will respect your privacy and keep your personal information safe. We use leading technologies, security controls and threat detection capabilities to protect you.</li>
      <li>We will only use your personal information for purposes we have told you about, and where we have a lawful basis to do so.</li>
      <li>We will give you control. We make it easy for you to manage your marketing preferences, including opting out of being contacted for marketing purposes by phone, email, text, or post.</li>
    </ol>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Our Privacy Principles</h2>
    <p className="mb-4 text-muted-foreground">We adhere to the following data protection principles:</p>
    <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
      <li><strong>Lawfulness, fairness and transparency</strong> — We process your data lawfully, fairly and in a transparent manner.</li>
      <li><strong>Purpose limitations</strong> — We only collect your data for specified, explicit and legitimate purposes.</li>
      <li><strong>Data minimisation</strong> — We only collect personal data that is necessary in relation to the purposes for which it is processed.</li>
      <li><strong>Accuracy</strong> — We take every reasonable step to ensure that personal data is accurate and, where necessary, kept up to date.</li>
      <li><strong>Storage limitations</strong> — We keep your personal data only for as long as is necessary for the purposes for which it is processed.</li>
      <li><strong>Integrity and confidentiality</strong> — We process your personal data in a manner that ensures appropriate security, including protection against unauthorised or unlawful processing and against accidental loss, destruction or damage.</li>
    </ul>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Information We Collect</h2>
    <p className="mb-4 text-muted-foreground">
      We may collect and process information such as your name, email address, phone number, company affiliation, and details of your interactions with our services. This data is collected when you register, complete forms, correspond with us, or use our digital services.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">How We Use Your Information</h2>
    <p className="mb-4 text-muted-foreground">
      We use information held about you to provide and improve our services, to carry out our obligations arising from any contracts entered into between you and us, to comply with legal and regulatory obligations, and to communicate with you regarding products and services that may be of interest.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Your Rights</h2>
    <p className="mb-4 text-muted-foreground">
      Under the GDPR and UK Data Protection Act 2018, you have a number of rights, including the right to request access to, correction of, or deletion of your personal data, as well as the right to restrict or object to processing in certain circumstances. To exercise these rights, please contact our Data Protection Officer.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">This Website</h2>
    <p className="mb-4 text-muted-foreground">
      This website may use cookies and similar technologies to distinguish you from other users. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site. For detailed information on the cookies we use and the purposes for which we use them, see our{' '}
      <Link to="/cookies-policy" className="text-primary underline">Cookies Policy</Link>.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Contact</h2>
    <p className="text-muted-foreground">
      If you have any questions about this privacy notice or our data protection practices, please contact our Data Protection Officer at: Barclays Bank PLC, 1 Churchill Place, London E14 5HP.
    </p>
  </InfoPageLayout>
);

export default PrivacyNotice;
