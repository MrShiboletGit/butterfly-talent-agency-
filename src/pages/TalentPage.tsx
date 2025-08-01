import { useParams, Link, useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, ArrowRight, X, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import talentsData from '../data/talents.json';

// Custom TikTok icon component
const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
  </svg>
);

const TalentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const talent = talentsData.find(t => t.id === id);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (!talent) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
            <Star size={40} className="text-primary opacity-50" />
          </div>
          <h1 className="text-2xl font-bold mb-4">המשפיען לא נמצא</h1>
          <Link to="/" className="butterfly-button">חזרה לדף הבית</Link>
        </div>
        <Footer />
      </>
    );
  }

  const handleInterestClick = () => {
    navigate('/contact', {
      state: {
        talent: talent.name,
        message: `אני מעוניין בשיתוף פעולה עם ${talent.name}`
      }
    });
  };

  const openImageModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  const closeImageModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsImageModalOpen(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Back Button */}
        <div className="container mx-auto px-6 pt-6">
          <Link to="/talents" className="inline-flex items-center text-primary hover:text-secondary transition-colors mb-6">
            <ArrowRight size={20} className="ml-2" />
            חזרה לטאלנטים
          </Link>
        </div>

        {/* Main Content - Large Centered Image with Side Info */}
        <section className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Side - Stats & Data with Name */}
            <div className="xl:col-span-3 order-2 xl:order-1">
              {/* Talent Name and Category */}
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{talent.name}</h1>
                <p className="text-lg md:text-xl text-gray-600">{talent.category}</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Star size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">נתונים</h2>
                    <p className="text-sm text-gray-600">סטטיסטיקות</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Total Followers */}
                  <div className="text-center p-4 bg-primary/10 rounded-xl">
                    <h3 className="text-sm text-gray-600 mb-1">סה"כ עוקבים</h3>
                    <p className="text-3xl font-bold text-primary">{new Intl.NumberFormat('he-IL').format(talent.totalFollowers)}</p>
                  </div>

                  {/* Platform Breakdown */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">פירוט לפי פלטפורמה</h3>
                    <div className="space-y-3">
                      {talent.platformFollowers.map((channel, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg" 
                             style={{
                               backgroundColor: channel.platform === 'instagram' ? '#fdf2f8' : 
                                               channel.platform === 'youtube' ? '#fef2f2' : 
                                               channel.platform === 'tiktok' ? '#f9fafb' : '#eff6ff'
                             }}>
                          <div className="flex items-center gap-2">
                            {channel.platform === 'instagram' && <Instagram size={18} className="text-pink-500" />}
                            {channel.platform === 'youtube' && <Youtube size={18} className="text-red-500" />}
                            {channel.platform === 'tiktok' && <TikTokIcon size={18} />}
                            {channel.platform === 'facebook' && <Facebook size={18} className="text-blue-500" />}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {channel.platform === 'instagram' ? 'Instagram' :
                                 channel.platform === 'youtube' ? 'YouTube' :
                                 channel.platform === 'tiktok' ? 'TikTok' :
                                 channel.platform === 'facebook' ? 'Facebook' : channel.platform}
                              </span>
                              <span className="text-xs text-gray-500">{channel.name}</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold">{new Intl.NumberFormat('he-IL').format(channel.followers)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - MUCH LARGER Main Image */}
            <div className="xl:col-span-6 order-1 xl:order-2">
              <div className="relative group mb-8">
                <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
                  <img 
                    src={talent.imageUrl} 
                    alt={talent.name} 
                    className="w-full h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] object-cover rounded-2xl cursor-pointer hover:opacity-95 transition-all duration-300"
                    loading="eager"
                    onClick={(e) => openImageModal(e)}
                  />
                  <div className="absolute inset-4 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-2xl flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                      לחץ להגדלה
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex justify-center gap-4 mb-8 flex-wrap">
                {talent.platformFollowers.map((channel, index) => (
                  <a key={index} href={channel.url} target="_blank" rel="noopener noreferrer" 
                     className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
                     title={`${channel.platform} - ${channel.name}`}>
                    {channel.platform === 'instagram' && <Instagram size={24} className="text-pink-500" />}
                    {channel.platform === 'youtube' && <Youtube size={24} className="text-red-500" />}
                    {channel.platform === 'tiktok' && <TikTokIcon size={24} />}
                    {channel.platform === 'facebook' && <Facebook size={24} className="text-blue-500" />}
                  </a>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button 
                  onClick={handleInterestClick}
                  className="butterfly-button text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  התעניינות בשיתוף פעולה
                </button>
              </div>
            </div>

            {/* Right Side - Bio & Additional Info */}
            <div className="xl:col-span-3 order-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Sparkles size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">פרטים</h2>
                    <p className="text-sm text-gray-600">מידע נוסף</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">תיאור</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{talent.bio}</p>
                  </div>

                  {/* Strengths */}
                  {talent.strengths && talent.strengths.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">תחומי התמחות</h3>
                      <div className="flex flex-wrap gap-2">
                        {talent.strengths.map((strength, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audience Info */}
                  {talent.audience && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">קהל יעד</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">גילאים:</span>
                          <span className="font-medium">{talent.audience.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">מגדר:</span>
                          <span className="font-medium">{talent.audience.gender}</span>
                        </div>

                      </div>
                    </div>
                  )}


                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Image Modal - Full Screen */}
        {isImageModalOpen && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={(e) => closeImageModal(e)}
          >
            <div className="relative max-w-7xl max-h-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeImageModal();
                }}
                className="absolute -top-16 right-0 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
                aria-label="סגור"
              >
                <X size={32} />
              </button>
              <img
                src={talent.imageUrl}
                alt={talent.name}
                className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default TalentPage;