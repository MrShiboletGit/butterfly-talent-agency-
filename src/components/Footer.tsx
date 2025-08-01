import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12 px-6 md:px-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Butterfly</h3>
            <p className="mb-4">סוכנות הטאלנטים המובילה בישראל למשפיעני רשת</p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/butterfly___agency" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-secondary transition-colors">בית</Link>
              </li>
              <li>
                <Link to="/talents" className="hover:text-secondary transition-colors">טאלנטים</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-secondary transition-colors">צור קשר</Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-secondary transition-colors">הצהרת נגישות</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">צור קשר</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:contact@butterfly-talent.com" className="hover:text-secondary transition-colors">contact@butterfly-talent.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a href="https://api.whatsapp.com/send/?phone=972509145461&text=%D7%94%D7%99%D7%99+%D7%90%D7%A9%D7%9E%D7%97+%D7%9C%D7%A7%D7%91%D7%9C+%D7%A4%D7%A8%D7%98%D7%99%D7%9D+%D7%91%D7%90%D7%98%D7%A8%D7%A4%D7%9C%D7%99%D7%99+" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">+972-50-914-5461</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Butterfly Talent Agency. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;