import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-primary border-b border-primary/10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img 
              src="/barclays-logo.svg" 
              alt="Barclays" 
              className="h-6 w-auto sm:h-8 object-contain" 
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
