import { Link } from 'react-router-dom';
import { Eye, Heart, Share, Users } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  imageUrl: string;
  category: string;
  kpis: {
    views: number;
    engagement: number;
    shares: number;
    reach: number;
  };
}

const projects: Project[] = [
  {
    id: '1',
    title: 'קמפיין קיץ 2023',
    client: 'קוקה קולה',
    description: 'קמפיין ברשתות החברתיות עם 5 משפיענים מובילים שהגיע לחשיפה של מעל 2 מיליון צפיות',
    imageUrl: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'קמפיין דיגיטלי',
    kpis: {
      views: 2100000,
      engagement: 150000,
      shares: 25000,
      reach: 1800000
    }
  },
  {
    id: '2',
    title: 'השקת מוצר חדש',
    client: 'סמסונג',
    description: 'השקת סדרת הגלקסי החדשה עם משפיעני טכנולוגיה מובילים',
    imageUrl: 'https://images.unsplash.com/photo-1550029402-226115b7c579?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'השקת מוצר',
    kpis: {
      views: 1500000,
      engagement: 120000,
      shares: 18000,
      reach: 1200000
    }
  },
  {
    id: '3',
    title: 'סדרת תוכן לנוער',
    client: 'משרד החינוך',
    description: 'סדרת תוכן חינוכית בנושא בטיחות ברשת עם משפיענים אהובים על בני נוער',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'תוכן חינוכי',
    kpis: {
      views: 800000,
      engagement: 95000,
      shares: 12000,
      reach: 650000
    }
  }
];

const ProjectsSection = () => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="section-title">הפרויקטים שלנו</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                  {project.category}
                </span>
                <h3 className="text-xl font-bold mt-3">{project.title}</h3>
                <p className="text-sm text-gray-600 mt-1">עבור: {project.client}</p>
                <p className="mt-3 text-gray-700 text-sm">{project.description}</p>
                
                {/* KPIs */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye size={14} className="text-primary" />
                    <span className="font-medium">{formatNumber(project.kpis.views)}</span>
                    <span className="text-gray-500">צפיות</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart size={14} className="text-primary" />
                    <span className="font-medium">{formatNumber(project.kpis.engagement)}</span>
                    <span className="text-gray-500">מעורבות</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Share size={14} className="text-primary" />
                    <span className="font-medium">{formatNumber(project.kpis.shares)}</span>
                    <span className="text-gray-500">שיתופים</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={14} className="text-primary" />
                    <span className="font-medium">{formatNumber(project.kpis.reach)}</span>
                    <span className="text-gray-500">הגעה</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/projects" className="butterfly-button-outline">
            לכל הפרויקטים
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;