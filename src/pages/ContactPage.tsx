import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { sendEmail } from '@/integrations/core';

interface LocationState {
  talentName?: string;
  message?: string;
}

const ContactPage = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: state?.message || '',
    privacyPolicy: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Update message when location state changes
    if (state?.message) {
      setFormData(prev => ({
        ...prev,
        message: state.message || ''
      }));
    }
  }, [state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyPolicy) {
      alert('עליך לאשר את מדיניות הפרטיות כדי להמשיך');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await sendEmail({
        to: 'contact@butterfly-talent.com',
        subject: state?.talentName 
          ? `התעניינות בטאלנט: ${state.talentName}`
          : `פנייה חדשה מהאתר - ${formData.name}`,
        body: `
          פנייה חדשה מהאתר:
          
          שם: ${formData.name}
          אימייל: ${formData.email}
          טלפון: ${formData.phone}
          חברה: ${formData.company}
          
          הודעה:
          ${formData.message}
        `
      });

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        privacyPolicy: false
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">צור קשר</h1>
              <p className="text-xl">
                {state?.talentName 
                  ? `התעניינות בשיתוף פעולה עם ${state.talentName}`
                  : 'נשמח לשמוע ממך ולעזור לך להגשים את הפרויקט הבא שלך'
                }
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-3xl font-bold mb-8">בואו נתחיל לעבוד יחד</h2>
                <p className="text-gray-600 mb-8">
                  אנחנו כאן כדי לעזור לכם ליצור קמפיינים מדהימים עם המשפיענים המובילים בישראל. 
                  צרו איתנו קשר ונתחיל לתכנן את הפרויקט הבא שלכם.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">אימייל</h3>
                      <a href="mailto:contact@butterfly-talent.com" className="text-gray-600 hover:text-primary">
                        contact@butterfly-talent.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">טלפון</h3>
                      <a href="https://api.whatsapp.com/send/?phone=972509145461&text=%D7%94%D7%99%D7%99+%D7%90%D7%A9%D7%9E%D7%97+%D7%9C%D7%A7%D7%91%D7%9C+%D7%A4%D7%A8%D7%98%D7%99%D7%9D+%D7%91%D7%90%D7%98%D7%A8%D7%A4%D7%9C%D7%99%D7%99+" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                        +972-50-914-5461
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">כתובת</h3>
                      <p className="text-gray-600">תל אביב, ישראל</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-6">שלחו לנו הודעה</h3>
                
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
                    ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
                    אירעה שגיאה בשליחת ההודעה. אנא נסו שוב.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        שם מלא *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        אימייל *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        טלפון
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        חברה
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      הודעה *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="ספרו לנו על הפרויקט שלכם..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacyPolicy"
                      name="privacyPolicy"
                      required
                      checked={formData.privacyPolicy}
                      onChange={handleCheckboxChange}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="privacyPolicy" className="text-sm text-gray-700 leading-relaxed">
                      אני מאשר/ת שהפרטים שמסרתי בטופס ישמשו לצורך יצירת קשר בלבד, בהתאם ל{' '}
                      <a 
                        href="/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        מדיניות הפרטיות
                      </a>{' '}
                      של האתר אשר לינק אליה נמצא בתחתית כל עמוד.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full butterfly-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      'שולח...'
                    ) : (
                      <>
                        שלח הודעה
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;