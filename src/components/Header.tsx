import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="py-1 px-2 md:px-4 bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="text-primary font-bold text-2xl flex items-center gap-2">
            <img 
              src="/blue logo.svg" 
              alt="Butterfly Logo" 
              className="w-14 h-14"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`transition-colors ${isActive('/') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
          >
            בית
          </Link>
          <Link 
            to="/talents" 
            className={`transition-colors ${isActive('/talents') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
          >
            טאלנטים
          </Link>
          <Link 
            to="/campaigns" 
            className={`transition-colors ${isActive('/campaigns') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
          >
            קמפיינים
          </Link>
          <Link 
            to="/contact" 
            className={`butterfly-button ${isActive('/contact') ? 'bg-primary/90' : ''}`}
          >
            צור קשר
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "סגור תפריט" : "פתח תפריט"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full right-0 left-0 bg-white shadow-md py-4 px-6 z-50">
          <nav className="flex flex-col gap-4">
            <Link 
              to="/" 
              className={`py-2 transition-colors ${isActive('/') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              בית
            </Link>
            <Link 
              to="/talents" 
              className={`py-2 transition-colors ${isActive('/talents') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              טאלנטים
            </Link>
            <Link 
              to="/campaigns" 
              className={`py-2 transition-colors ${isActive('/campaigns') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              קמפיינים
            </Link>
            <Link 
              to="/contact" 
              className="butterfly-button text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              צור קשר
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;