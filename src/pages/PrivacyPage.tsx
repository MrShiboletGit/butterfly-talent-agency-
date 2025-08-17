import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-right">
            מדיניות פרטיות – מר שיבולת
          </h1>
          
          <div className="text-right space-y-6 text-gray-700 leading-relaxed">
            <p>
              חברת באטרפליי שיווק ויחסי ציבור בע״מ ח.פ 517061966 ואתר הרשת של החברה (להלן: "האתר") מודה לכם על בחירתכם לגלוש באתר. האתר מכבד את פרטיות המשתמשים והגולשים בו ורואה חשיבות רבה בשמירה עליה.
            </p>
            
            <p>
              מדיניות פרטיות זו מהווה חלק בלתי נפרד מתנאי השימוש של האתר.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. המידע הנאסף באתר</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.1.</h3>
                  <p>
                    בעת מילוי טופס יצירת קשר באתר, יתבקש המשתמש למסור פרטים אישיים כגון: שם מלא, שם ארגון, מספר טלפון וכתובת דואר אלקטרוני פעילה. מסירת פרטים אלו אינה חובה על פי חוק, אולם ללא מסירתם לא ניתן יהיה לספק מענה לפנייתך.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.2.</h3>
                  <p>
                    בנוסף למידע זה, האתר עושה שימוש בכלי ניטור וסטטיסטיקה של Google (כגון Google Search Console או Google Analytics), אשר אוספים מידע אנונימי באופן אוטומטי, לרבות באמצעות קובצי עוגיות (Cookies). מידע זה עשוי לכלול: כתובת IP, סוג דפדפן, זמני גלישה, עמודים שנצפו, מקור ההפניה לאתר ונתונים טכניים נוספים.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">1.3.</h3>
                  <p>
                    המידע שנמסר על ידך בטופס יחד עם המידע הסטטיסטי כאמור לעיל יכונו להלן: "המידע הנאסף".
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. שימוש במידע</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.1.</h3>
                  <p>
                    האתר ו/או מי מטעמו רשאים לעשות שימוש במידע הנאסף לצרכים הבאים:
                  </p>
                  <ul className="list-disc mr-6 mt-2 space-y-1">
                    <li>מענה לפניות שהתקבלו באמצעות טופס יצירת הקשר.</li>
                    <li>שיפור חוויית המשתמש ותפקוד האתר.</li>
                    <li>ניתוח אנונימי של נתוני גלישה ושימוש באתר.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.2.</h3>
                  <p>
                    המידע לא ישמש לצורכי דיוור ישיר, פרסום מותאם אישית או העברה לגורמים מסחריים.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. העברת מידע לצדדים שלישיים</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.1.</h3>
                  <p>
                    האתר לא יעביר מידע מזהה לצדדים שלישיים, אלא באחד מהמקרים הבאים:
                  </p>
                  <ul className="list-disc mr-6 mt-2 space-y-1">
                    <li>קבלת הסכמה מפורשת מהמשתמש;</li>
                    <li>דרישה על פי דין או צו שיפוטי;</li>
                    <li>לצורך הגנה על זכויות האתר או צד שלישי במקרה של הפרת תנאי השימוש;</li>
                    <li>במקרה של מיזוג או העברת פעילות האתר לגוף אחר, ובתנאי שהגוף החדש יתחייב לשמור על מדיניות זו.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.2.</h3>
                  <p>
                    האתר רשאי להעביר מידע סטטיסטי, כללי ואינו אישי, לצורכי ניתוח ושיפור.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. אבטחת מידע</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4.1.</h3>
                  <p>
                    האתר נוקט באמצעים סבירים לשם שמירה על המידע הנאסף ומניעת גישה בלתי מורשית, כגון שימוש בפרוטוקול HTTPS.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4.2.</h3>
                  <p>
                    עם זאת, אין אפשרות להבטיח חסינות מוחלטת מפני חדירה למערכות מחשב או ניסיונות פריצה, והאתר אינו מתחייב שהשירותים באתר יהיו חסינים לחלוטין.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. זכויות המשתמש</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.1.</h3>
                  <p>
                    בהתאם לחוק הגנת הפרטיות, התשמ"א–1981, עומדת לכל אדם הזכות לעיין במידע שנאסף אודותיו, לבקש את מחיקתו או תיקונו.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.2.</h3>
                  <p>
                    בקשה כאמור תימסר באמצעות פרטי הקשר המפורטים בסעיף 7 להלן.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.3.</h3>
                  <p>
                    מובהר כי בחירה שלא למסור פרטים בטופס יצירת הקשר עשויה למנוע מענה לפנייתך.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. שינויים במדיניות</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">6.1.</h3>
                  <p>
                    האתר שומר לעצמו את הזכות לשנות מעת לעת את מדיניות הפרטיות.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">6.2.</h3>
                  <p>
                    השימוש באתר לאחר שינוי במדיניות יהווה הסכמה למדיניות המעודכנת.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">6.3.</h3>
                  <p>
                    במקרה של שינוי מהותי במדיניות תפורסם הודעה מתאימה באתר.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. יצירת קשר</h2>
              <p className="mb-4">
                לשאלות, בקשות עיון או מחיקה של מידע אישי, ניתן לפנות אלינו באמצעות:
              </p>
              
              <div className="space-y-2">
                <p><strong>דוא"ל:</strong> contact@butterfly-talent.com</p>
                <p><strong>טלפון:</strong> 0507822986</p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                <strong>תאריך עדכון אחרון:</strong> 17.08.2025
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPage; 