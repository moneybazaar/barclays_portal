import InfoPageLayout from '@/components/landing/InfoPageLayout';
import { Link } from 'react-router-dom';

const CookiesPolicy = () => (
  <InfoPageLayout title="Cookies Policy">
    <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
    <p className="mb-4 text-muted-foreground">
      Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide information to site owners, and enhance the user experience. Cookies may be set by the website you are visiting ("first-party cookies") or by third parties ("third-party cookies").
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">How We Use Cookies</h2>
    <p className="mb-4 text-muted-foreground">
      We use cookies and similar technologies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse and also allows us to improve our site. We use the following categories of cookies:
    </p>

    <h3 className="text-xl font-semibold mb-3 mt-6">Essential Cookies</h3>
    <p className="mb-4 text-muted-foreground">
      These cookies are strictly necessary for the operation of our website. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies as the website cannot function properly without them.
    </p>

    <h3 className="text-xl font-semibold mb-3 mt-6">Analytical / Performance Cookies</h3>
    <p className="mb-4 text-muted-foreground">
      These cookies allow us to recognise and count the number of visitors to our website and to see how visitors move around. This helps us to improve the way our website works, for example by ensuring that users are finding what they are looking for easily. All information these cookies collect is aggregated and therefore anonymous.
    </p>

    <h3 className="text-xl font-semibold mb-3 mt-6">Functional Cookies</h3>
    <p className="mb-4 text-muted-foreground">
      These cookies are used to recognise you when you return to our website. This enables us to personalise our content for you, greet you by name and remember your preferences (for example, your choice of language or region).
    </p>

    <h3 className="text-xl font-semibold mb-3 mt-6">Targeting / Advertising Cookies</h3>
    <p className="mb-4 text-muted-foreground">
      These cookies record your visit to our website, the pages you have visited and the links you have followed. We may use this information to make our website and the advertising displayed on it more relevant to your interests. We may also share this information with third parties for this purpose.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Managing Cookies</h2>
    <p className="mb-4 text-muted-foreground">
      Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser. You can set your browser to refuse all or some cookies, or to alert you when cookies are being set. Please note that if you disable or refuse cookies, some parts of this website may become inaccessible or not function properly.
    </p>
    <p className="mb-4 text-muted-foreground">
      To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit{' '}
      <a href="https://www.aboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.aboutcookies.org</a> or{' '}
      <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.allaboutcookies.org</a>.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Changes to This Policy</h2>
    <p className="mb-4 text-muted-foreground">
      We may update this Cookies Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Further Information</h2>
    <p className="text-muted-foreground">
      For more information about how we use your personal data, please see our{' '}
      <Link to="/privacy-notice" className="text-primary underline">Privacy Notice</Link>.
      If you have any questions about our use of cookies, please contact us at: Barclays Bank PLC, 1 Churchill Place, London E14 5HP.
    </p>
  </InfoPageLayout>
);

export default CookiesPolicy;
