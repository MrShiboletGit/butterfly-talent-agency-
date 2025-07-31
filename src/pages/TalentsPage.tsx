import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import talentsData from '../data/talents.json';
import { Search } from 'lucide-react';

const TalentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(talentsData.map(talent => talent.category)));

  // Filter talents based on search and category
  const filteredTalents = talentsData.filter(talent => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         talent.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? talent.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8 text-center">הטאלנטים שלנו</h1>
          
          {/* Search and Filter */}
          <div className="mb-12 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="חיפוש לפי שם או קטגוריה..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">כל הקטגוריות</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Talents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTalents.map((talent) => (
              <Link 
                key={talent.id} 
                to={`/talent/${talent.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img 
                      src={talent.imageUrl} 
                      alt={talent.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-medium">צפה בפרופיל</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{talent.name}</h3>
                    <p className="text-sm text-gray-600">{talent.category}</p>
                    <div className="mt-2 text-xs bg-secondary/10 text-primary px-2 py-1 rounded-full inline-block">
                      {new Intl.NumberFormat('he-IL').format(talent.totalFollowers)} עוקבים
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {filteredTalents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">לא נמצאו טאלנטים התואמים את החיפוש</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TalentsPage;