import InfoPageLayout from '@/components/landing/InfoPageLayout';

const Accessibility = () => (
  <InfoPageLayout title="Accessibility">
    <h2 className="text-2xl font-semibold mb-4">Our Accessibility Commitment</h2>
    <p className="mb-4 text-muted-foreground">
      We are committed to making our websites and mobile applications accessible according to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA and EN 301 549 European Standard for Digital Accessibility. We continually work to improve the accessibility and usability of our digital properties to ensure we provide equal access to all of our users.
    </p>
    <p className="mb-6 text-muted-foreground">Our goals include ensuring that our digital services:</p>
    <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
      <li>Can be navigated using a keyboard alone</li>
      <li>Use colours and contrast that are easy to see</li>
      <li>Can be zoomed in without loss of content or functionality</li>
      <li>Provide text alternatives for graphical content</li>
      <li>Work with screen readers and other assistive technologies</li>
    </ul>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Accessible Services and Support</h2>
    <p className="mb-4 text-muted-foreground">
      Barclays is committed to providing accessible services across all of our business areas. For more information about accessible services, please visit:
    </p>
    <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
      <li>
        <a href="https://www.barclays.co.uk/accessibility/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Barclays UK</a> — Personal, Premier and Business Banking accessibility
      </li>
      <li>
        <a href="https://www.barclayscorporate.com/accessibility/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Barclays Corporate Banking</a> — Corporate banking accessibility
      </li>
      <li>
        <a href="https://www.barclaycard.co.uk/accessibility" target="_blank" rel="noopener noreferrer" className="text-primary underline">Barclaycard</a> — Barclaycard accessibility
      </li>
      <li>
        <a href="https://www.barclays.co.uk/wealth-management/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Barclays Wealth Management</a> — Wealth management accessibility
      </li>
      <li>
        <a href="https://www.barclays.com/accessibility/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Barclays US</a> — US consumer banking accessibility
      </li>
    </ul>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Adjust Your Device</h2>
    <p className="mb-4 text-muted-foreground">
      <a href="https://mcmw.abilitynet.org.uk/" target="_blank" rel="noopener noreferrer" className="text-primary underline">AbilityNet</a> provides advice on making your device easier to use if you have a disability. This includes guidance on making text larger, changing your colours, and using your keyboard instead of a mouse.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Working with Our Suppliers</h2>
    <p className="mb-4 text-muted-foreground">
      We work with our suppliers to ensure that the third-party tools and services we use meet our accessibility requirements. We include accessibility requirements in our procurement processes and work with suppliers to remediate any issues identified.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Accessibility Statements and Regulatory Disclosures</h2>
    <p className="mb-4 text-muted-foreground">
      We regularly review and update our accessibility statements. Required regulatory disclosures relating to accessibility are made available in accordance with applicable laws and regulations.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-8">Accessibility Feedback</h2>
    <p className="text-muted-foreground">
      If you experience any difficulty accessing any part of this website, or have suggestions for improving accessibility, please contact us at{' '}
      <a href="mailto:accessibility@barclays.com" className="text-primary underline">accessibility@barclays.com</a>.
      We welcome your feedback and will consider all suggestions for improving accessibility.
    </p>
  </InfoPageLayout>
);

export default Accessibility;
