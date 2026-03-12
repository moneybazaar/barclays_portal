import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

interface InfoPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const InfoPageLayout = ({ title, children }: InfoPageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">{title}</h1>
        </div>
      </div>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none text-foreground">
          {children}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default InfoPageLayout;
