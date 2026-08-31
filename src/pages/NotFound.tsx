import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center bg-gray-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-6xl font-bold text-primary mb-4">404</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">הדף לא נמצא</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            הקישור שהגעתם אליו שבור או שהדף הוסר. אפשר לחזור לדף הבית או לעבור לטאלנטים ולקמפיינים שלנו.
          </p>
          {/* Links, not <a href>, so we navigate in-app instead of reloading everything. */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/" className="butterfly-button">
              חזרה לדף הבית
            </Link>
            <Link
              to="/talents"
              className="px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors font-medium"
            >
              הטאלנטים שלנו
            </Link>
            <Link
              to="/campaigns"
              className="px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors font-medium"
            >
              הקמפיינים שלנו
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
