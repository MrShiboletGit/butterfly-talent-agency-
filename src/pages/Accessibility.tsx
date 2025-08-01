import Header from '../components/Header';
import Footer from '../components/Footer';

const Accessibility = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-primary mb-8 text-center">
              הצהרת נגישות
            </h1>
            
            <div className="space-y-6 text-right">
              <section>
                <h2 className="text-xl font-bold text-primary mb-4">א. כללי</h2>
                <p className="text-gray-700 leading-relaxed">
                  סוכנות Butterfly שואפת להבטיח כי שירותיה יהיו נגישים לאנשים עם מוגבלויות. 
                  הסוכנות השקיעה משאבים רבים כדי להבטיח שהאתר שלה יהיה קל לשימוש ונגיש לאנשים עם מוגבלות, 
                  מתוך אמונה חזקה שלכל אדם יש את הזכות לחיות בכבוד, בשוויון, בנוחות ובעצמאות.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-primary mb-4">ב. נגישות האתר Butterfly</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  סוכנות Butterfly מספקת נגישות לאתר האינטרנט באמצעות תוסף נגישות ייעודי, 
                  בנוסף לשימוש בהגדרות נגישות בתבניות האתר.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  התוכנות מאפשרות לשפר את עמידת האתר בהנחיות הנגישות לתוכן אינטרנט.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  האתר נבנה והותאם לדפדפני Chrome, FireFox ו-EDGE העדכניים ביותר וכן לתצוגה בטלפונים ניידים 
                  חכמים מסוג iPhone ואנדרואיד בגרסאות העדכניות ביותר.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-primary mb-4">ג. הפעלת תפריט הנגישות</h2>
                <p className="text-gray-700 leading-relaxed">
                  ניתן להפעיל את תפריט הנגישות על ידי לחיצה על סמל תפריט הנגישות המופיע בצידי הדף.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-primary mb-4">ד. צור קשר</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  סוכנות Butterfly ממשיכה במאמציה לשפר את הנגישות של האתר והשירותים באופן מתמיד 
                  מתוך אמונה שחובתנו המוסרית הקולקטיבית היא לאפשר שימוש רצוף, נגיש ובלתי-מוגבל 
                  גם עבור אלה מאיתנו עם מוגבלויות.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  למרות מאמצינו להפוך את כל התוכן והתכנים באתרנו להיות נגישים לחלוטין, 
                  ייתכן שחלק מהתכנים עדיין לא הותאם במלואו לסטנדרטים המחמירים ביותר של נגישות. 
                  זה יכול להיות תוצאה של אי מציאה או חוסר זיהוי של הפתרון הטכנולוגי המתאים ביותר.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  בסוכנותנו אין קבלת קהל.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אם נתקלת בקשיים בתוכן האתר או שאת/ה זקוק לסיוע בכל חלק באתר שלנו, 
                  אנא צור/י איתנו קשר כמפורט להלן ואנו נשמח לסייע לך.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אם ברצונך לדווח על בעיית נגישות, יש לך שאלות או זקוק לסיוע, אנא צור קשר עימנו:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    <strong>דואר אלקטרוני:</strong> contact@butterfly-talent.com
                  </p>
                  <p className="text-gray-700">
                    <strong>נייד:</strong> +972-50-914-5461
                  </p>
                </div>
              </section>

              <section className="border-t pt-6">
                <p className="text-sm text-gray-500 text-center">
                  <strong>תאריך עדכון:</strong> הצהרת הנגישות עודכנה ביום 1 באוגוסט 2025.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Accessibility; 