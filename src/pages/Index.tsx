import { Link } from 'react-router-dom';
import { Star, Users, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TalentCarousel from '../components/TalentCarousel';
import ClientsSection from '../components/ClientsSection';
import CampaignsCarousel from '../components/CampaignsCarousel';

const Index = () => {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section - Minimal with just logo */}
        <section className="relative min-h-[25vh] flex items-center justify-center bg-gradient-to-br from-purple-500/20 via-pink-400/15 to-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-500/8 to-blue-600/12"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent"></div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="mb-6 flex justify-center">
              <img 
                src="/BlueFLY.svg" 
                alt="BlueFLY Logo" 
                className="w-32 h-32 md:w-40 md:h-40"
              />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-primary">
              Butterfly Talent Agency
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              סוכנות המשפיענים המובילה בישראל
            </p>
          </div>
        </section>

        {/* Talents Carousel Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="section-title">הטאלנטים שלנו</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                פגשו את המשפיענים המובילים שעובדים איתנו ויוצרים תוכן מדהים
              </p>
            </div>
            <TalentCarousel />
          </div>
        </section>

        {/* Clients Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="section-title">הלקוחות שלנו</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                מותגים מובילים שבחרו לעבוד איתנו
              </p>
            </div>
            <ClientsSection />
            <div className="text-center mt-8">
              <Link to="/clients" className="butterfly-button text-lg px-8 py-3">
                צפה בכל הלקוחות
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="section-title">השירותים שלנו</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                אנחנו מציעים פתרונות שיווק מקיפים עם המשפיענים הטובים ביותר
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Users className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">ניהול קמפיינים</h3>
                <p className="text-gray-600">
                  ניהול מקיף של קמפיינים משלב התכנון ועד לביצוע והמדידה
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">אסטרטגיית תוכן</h3>
                <p className="text-gray-600">
                  פיתוח אסטרטגיות תוכן מותאמות אישית לכל מותג ויעד
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Award className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">ייעוץ מקצועי</h3>
                <p className="text-gray-600">
                  ייעוץ מקצועי לבחירת המשפיענים המתאימים ביותר למותג שלכם
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Campaigns Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="section-title">הקמפיינים שלנו</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                קמפיינים מוצלחים שיצרנו עם הלקוחות והטאלנטים שלנו
              </p>
            </div>
            <CampaignsCarousel />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              מוכנים להתחיל?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              בואו ניצור יחד את הקמפיין הבא שלכם עם המשפיענים הטובים ביותר בישראל
            </p>
            <Link to="/contact" className="butterfly-button-secondary text-lg px-8 py-4">
              צרו קשר עכשיו
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;