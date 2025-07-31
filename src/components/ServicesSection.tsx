import { Users, TrendingUp, Video, ShoppingBag, Award, BarChart } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const services: Service[] = [
  {
    id: '1',
    title: 'ניהול משפיענים',
    description: 'ליווי מקצועי ואישי למשפיענים, פיתוח קריירה, ייעוץ תוכן ואסטרטגיה',
    icon: <Users className="h-8 w-8" />
  },
  {
    id: '2',
    title: 'קמפיינים שיווקיים',
    description: 'תכנון וביצוע קמפיינים עם משפיענים מותאמים למטרות השיווקיות שלכם',
    icon: <TrendingUp className="h-8 w-8" />
  },
  {
    id: '3',
    title: 'הפקת תוכן',
    description: 'הפקת תוכן איכותי ומקצועי - סרטונים, תמונות ופוסטים לכל הפלטפורמות',
    icon: <Video className="h-8 w-8" />
  },
  {
    id: '4',
    title: 'שיווק מוצרים',
    description: 'קידום מוצרים ושירותים באמצעות משפיענים בצורה אותנטית ואפקטיבית',
    icon: <ShoppingBag className="h-8 w-8" />
  },
  {
    id: '5',
    title: 'אירועים וכנסים',
    description: 'ארגון והפקת אירועים עם משפיענים, מפגשי מעריצים וכנסים מקצועיים',
    icon: <Award className="h-8 w-8" />
  },
  {
    id: '6',
    title: 'אנליטיקס ומדידה',
    description: 'מדידה וניתוח של ביצועי קמפיינים, דוחות מפורטים והמלצות לשיפור',
    icon: <BarChart className="h-8 w-8" />
  }
];

const ServicesSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="section-title">השירותים שלנו</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="p-6 border border-gray-100 rounded-lg hover:shadow-lg transition-shadow bg-white"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-primary mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;