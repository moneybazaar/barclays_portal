import { Linkedin, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  aboutUs: [
    { label: 'Careers', href: 'https://search.jobs.barclays/investment-bank' },
    { label: 'Citizenship', href: 'https://home.barclays/citizenship/' },
    { label: 'Investor Relations', href: 'https://home.barclays/investor-relations/' },
    { label: 'News', href: 'https://home.barclays/news/' },
    { label: 'Sponsorship', href: 'https://home.barclays/sponsorships/' },
    { label: 'Barclays Live', href: 'https://live.barcap.com/' },
    { label: 'BARX', href: 'https://www.barxis.com/' },
  ],
  otherIBWebsites: [
    { label: 'Barclays Indices', href: 'https://indices.cib.barclays/' },
    { label: 'Barclays Investment Managers', href: 'https://www.barclaysinvestmentmanagers.com/' },
    { label: 'Barclays Japan', href: 'https://japan.cib.barclays/' },
    { label: 'BARX Investor Solutions', href: 'https://www.barxis.com/' },
  ],
  otherBarclaysWebsites: [
    { label: 'Barclaycard', href: 'https://www.barclaycard.co.uk/' },
    { label: 'Barclays Group', href: 'https://home.barclays/' },
    { label: 'Corporate Banking', href: 'https://www.barclayscorporate.com/' },
    { label: 'Personal, Premier and Business Banking', href: 'https://www.barclays.co.uk/' },
    { label: 'Private Bank', href: 'https://privatebank.barclays.com/' },
    { label: 'Wealth Management', href: 'https://www.barclays.co.uk/wealth-management/' },
  ],
  legal: [
    { label: 'Important information', href: 'https://www.ib.barclays/important-information.html' },
    { label: 'Privacy Notice', href: 'https://www.ib.barclays/privacy-and-cookie-policy.html' },
    { label: 'Disclosures', href: 'https://www.ib.barclays/disclosures.html' },
    { label: 'Accessibility', href: 'https://www.ib.barclays/accessibility.html' },
    { label: 'Cookies policy', href: 'https://www.ib.barclays/privacy-and-cookie-policy.html' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: 'https://www.linkedin.com/showcase/barclays-investment-bank', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/barclaysib/', label: 'Instagram' },
  { icon: Youtube, href: 'https://www.youtube.com/@barclaysib', label: 'YouTube' },
];

const LandingFooter = () => {
  return (
    <footer className="bg-barclays-navy text-white">
      {/* FDIC Disclosure Bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <img 
              src="/fdic-logo.svg" 
              alt="FDIC" 
              className="h-5 w-auto"
            />
            <p className="text-sm text-foreground italic">
              FDIC-Insured - Backed by the full faith and credit of the U.S. Government
            </p>
          </div>
        </div>
      </div>

      {/* Social Media Bar */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Follow us</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* About Us Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">About Us</h3>
            <ul className="space-y-3">
              {footerLinks.aboutUs.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Other IB websites Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Other IB websites</h3>
            <ul className="space-y-3">
              {footerLinks.otherIBWebsites.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Other Barclays Websites Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Other Barclays Websites</h3>
            <ul className="space-y-3">
              {footerLinks.otherBarclaysWebsites.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Strip */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/barclays-logo.svg" 
                alt="Barclays" 
                className="h-6 w-auto brightness-0 invert" 
              />
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-white/70">
              {footerLinks.legal.map((link, index) => (
                <span key={link.label} className="flex items-center gap-4">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                  {index < footerLinks.legal.length - 1 && (
                    <span className="text-white/30">|</span>
                  )}
                </span>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-white/60">
              © Barclays {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
