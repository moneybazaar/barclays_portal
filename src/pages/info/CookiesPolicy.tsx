import InfoPageLayout from '@/components/landing/InfoPageLayout';

const CookiesPolicy = () => (
  <InfoPageLayout title="Cookies Policy">
    <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
    <p className="mb-4 text-muted-foreground">Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide information to site owners, and enhance the user experience.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">How We Use Cookies</h2>
    <p className="mb-4 text-muted-foreground">We use cookies to remember your preferences, understand how you use our website, and improve your experience. Some cookies are essential for the website to function, while others help us analyse site usage and personalise content.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">Managing Cookies</h2>
    <p className="text-muted-foreground">You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of this website. For more information on managing cookies, please refer to your browser's help documentation.</p>
  </InfoPageLayout>
);

export default CookiesPolicy;
