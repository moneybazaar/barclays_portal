import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-primary border-b border-primary/10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
            {/* Mobile: Eagle only */}
            <img 
              src="/barclays-eagle.svg" 
              alt="Barclays" 
              className="h-8 w-auto sm:hidden" 
            />
            {/* Tablet/Desktop: Full logo */}
            <img 
              src="/barclays-logo.svg" 
              alt="Barclays" 
              className="hidden sm:block h-10 md:h-12 w-auto object-contain" 
            />
            <div className="border-l border-primary-foreground/20 pl-3 hidden sm:block">
              <span className="text-primary-foreground text-sm font-semibold">Investment Bank</span>
            </div>
          </Link>
          <div className="text-primary-foreground text-xs sm:text-sm font-semibold">Client Portal</div>
        </div>
      </div>
    </header>
  );
};
