'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  Percent, 
  CheckCircle2, 
  ChevronDown,
  Globe
} from 'lucide-react';
import Link from 'next/link';

interface LandingClientProps {
  initialUser: { name: string; email: string } | null;
}

export default function LandingClient({ initialUser }: LandingClientProps) {
  const [user] = useState(initialUser);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: 'كيف يعمل نظام دفع العربون (Split Payment)؟',
      a: 'عند إنشاء طلب، يرسل النظام رابط دفع للعميل بقيمة رسوم التوصيل فقط (مثلاً 600 دج). بعد دفع العميل عبر بطاقته الذهبية أو CIB، يتم تأكيد الطلب تلقائياً وتوصيله بواسطة شركة الشحن، والتي تقوم بتحصيل باقي سعر المنتج نقداً عند الاستلام.'
    },
    {
      q: 'هل بوابة الدفع SofizPay آمنة ومتوافقة؟',
      a: 'نعم، بوابة SofizPay تستخدم تشفير 256-bit AES وتعمل بالتكامل المباشر مع شبكة SATIM وبريد الجزائر المعتمدة رسمياً، مما يضمن معالجة جميع الدفعات وفق القوانين واللوائح المعمول بها.'
    },
    {
      q: 'هل أحتاج لسجل تجاري لاستخدام المنصة؟',
      a: 'لا تحتاج لسجل تجاري للبدء. يمكنك التسجيل والبدء في وضع طلباتك واستقبال المدفوعات على حسابك في المنصة، والتحويل لاحقاً لأي حساب بنكي أو بريدي (CCP).'
    }
  ];

  return (
    <div className="landing-wrapper" style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#070a13',
      backgroundImage: 'radial-gradient(circle at 50% -20%, #1e1b4b 0%, transparent 60%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-primary)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Ambient glowing blobs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <style dangerouslySetInnerHTML={{ __html: `
        * {
          font-family: 'Cairo', 'Outfit', sans-serif !important;
        }
        .glow-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(160px);
          opacity: 0.12;
          pointer-events: none;
          z-index: 1;
        }
        .glow-orb-1 {
          background: var(--primary);
          top: 10%;
          right: 5%;
          animation: float-1 25s infinite ease-in-out;
        }
        .glow-orb-2 {
          background: var(--secondary);
          bottom: 25%;
          left: 5%;
          animation: float-2 20s infinite ease-in-out;
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.1); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(40px, -30px) scale(0.9); }
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 8%;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          background: rgba(7, 10, 19, 0.7);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .landing-logo-icon {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: white;
          font-size: 20px;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }
        .landing-logo-text {
          font-size: 24px;
          font-weight: 900;
          background: linear-gradient(to right, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Nav links & CTA buttons */
        .nav-link {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 600;
          transition: all 0.25s;
          cursor: pointer;
        }
        .nav-link:hover {
          color: white;
        }

        /* Shared sections */
        .section-padding {
          padding: 80px 8%;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .section-padding {
            padding: 50px 24px;
          }
        }
        .section-title {
          font-size: 36px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 16px;
          color: white;
        }
        .section-subtitle {
          font-size: 16px;
          color: #94a3b8;
          text-align: center;
          max-width: 600px;
          margin: 0 auto 50px auto;
          line-height: 1.6;
        }

        /* Widgets & layouts */
        .widget-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .widget-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.3);
          background: rgba(15, 23, 42, 0.6);
          box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.15);
        }
        .mock-cib-card {
          background: linear-gradient(135deg, #1e1b4b 0%, #0c0a0f 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          color: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        /* Hero styles */
        .hero-btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: white;
          border: none;
          padding: 16px 36px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.35);
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.5);
        }
        .hero-btn-secondary {
          background: rgba(255, 255, 255, 0.03);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px 36px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .hero-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.2);
        }



        /* FAQ accordion */
        .faq-item {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }
        .faq-question {
          width: 100%;
          padding: 20px 24px;
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          font-weight: 700;
          text-align: right;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .faq-answer {
          padding: 0 24px 20px 24px;
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.6;
          display: none;
        }
        .faq-answer.show {
          display: block;
        }

        @media (max-width: 640px) {
          .hidden-mobile {
            display: none !important;
          }
        }
      ` }} />

      {/* Premium Navbar */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="landing-logo-icon">Dz</div>
          <span className="landing-logo-text">DzDropship</span>
        </div>
        
        {/* Navigation links & User actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <nav className="hidden-mobile" style={{ display: 'flex', gap: '20px', marginLeft: '20px' }} dir="rtl">
            <span onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link">عن المنصة</span>
            <span onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link">المميزات</span>
            <span onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link">الأسئلة الشائعة</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <Link 
                  href="/dashboard"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  لوحة التحكم
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    background: 'transparent',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/login?tab=register"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                  }}
                >
                  ابدأ مجاناً
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding" style={{ 
        textAlign: 'center', 
        paddingTop: '100px', 
        paddingBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Version Badge */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(139, 92, 246, 0.08)', 
          border: '1px solid rgba(139, 92, 246, 0.2)',
          color: '#c084fc', 
          padding: '6px 14px', 
          borderRadius: '100px', 
          marginBottom: '28px', 
          fontSize: '13px', 
          fontWeight: '700' 
        }}>
          <Sparkles size={14} className="animate-pulse" />
          <span>منصة الدروبشيبينغ الأكثر تكاملاً للجزائر</span>
        </div>

        {/* Title */}
        <h1 style={{ 
          fontSize: '56px', 
          fontWeight: '900', 
          lineHeight: '1.25', 
          marginBottom: '24px', 
          maxWidth: '850px',
          color: 'white'
        }}>
          أدر مبيعاتك في الجزائر وودّع المرتجعات مع نظام <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>الدفع الإلكتروني المسبق</span>
        </h1>

        {/* Sub-description */}
        <p style={{ 
          fontSize: '19px', 
          color: '#94a3b8', 
          lineHeight: '1.7', 
          maxWidth: '700px',
          marginBottom: '40px',
          fontWeight: '400'
        }}>
          المنصة الوحيدة في الجزائر التي تمكنك من دمج الدفع عند الاستلام (COD) مع أمان تحصيل رسوم الشحن (العربون) مسبقاً عبر بطاقات CIB والذهبية لتضمن جدية زبائنك وتزيد من تسليم طلبياتك.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
          <Link href={user ? '/dashboard' : '/login?tab=register'} className="hero-btn-primary">
            <span>ابدأ مجاناً الآن / Get Started</span>
            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </Link>
          <button 
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} 
            className="hero-btn-secondary"
          >
            <span>تعرف على آلية العمل / About Us</span>
          </button>
        </div>

        {/* Visual Previews Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px', 
          width: '100%', 
          maxWidth: '1000px',
          marginTop: '20px'
        }}>
          {/* Card 1: Visual Card Simulator */}
          <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'right' }} dir="rtl">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold', background: 'var(--success-light)', padding: '2px 8px', borderRadius: '20px' }}>
                دعم بوابة SofizPay
              </span>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>بوابة دفع إلكترونية ذكية</h4>
            </div>

            <div className="mock-cib-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', opacity: 0.8 }}>CIB / EDAHABIYA</div>
                <div style={{ width: '28px', height: '18px', backgroundColor: '#eab308', borderRadius: '3px' }} />
              </div>
              <div style={{ fontSize: '15px', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '8px' }}>
                6283 •••• •••• 9410
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', opacity: 0.6 }}>
                <span>DZ RESELLER ACCOUNT</span>
                <span>DZD</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              ربط فوري وموثوق مع بريد الجزائر والشبكة البنكية الوطنية لمعالجة البطاقات دون تعقيدات برمجية.
            </p>
          </div>

          {/* Card 2: Visual split logic statistics */}
          <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right' }} dir="rtl">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', padding: '6px', borderRadius: '6px' }}>
                <Percent size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>نظام حماية التوصيل</h4>
                <p style={{ fontSize: '11px', color: '#64748b' }}>معدل تسليم الشحنات</p>
              </div>
            </div>
            
            <div style={{ margin: '14px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '40px', fontWeight: '900', color: 'white', background: 'linear-gradient(to right, #38bdf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'sans-serif' }}>
                94.2%
              </span>
              <p style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                <CheckCircle2 size={12} />
                <span>الحد من إلغاء الشحنات بنسبة 90%</span>
              </p>
            </div>
            
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              يدفع المشتري قيمة التوصيل إلكترونياً لضمان مصداقيته، ثم يكمل دفع قيمة المنتج نقداً عند الاستلام.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="section-padding" style={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.02)',
        backgroundColor: 'rgba(5, 7, 13, 0.4)'
      }}>
        <h2 className="section-title">من نحن / عن منصة DzDropship</h2>
        <p className="section-subtitle">
          جسر الربط الذكي لتخفيف أعباء وخسائر التجارة الإلكترونية والدروبشيبينغ في الجزائر
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1.2fr', 
          gap: '50px', 
          alignItems: 'center',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {/* Left Visual representation */}
          <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '3px solid var(--primary)' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'white', textAlign: 'right' }} dir="rtl">دورة حياة الشحنة الآمنة:</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }} dir="rtl">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                <span>يقوم التاجر بإنشاء طلب استيراد مباشر (AliExpress) أو محلي (تاجر جملة).</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <span>يختار العميل طريقة الدفع المفضلة لديه (دفع عند الاستلام، إلكتروني كامل، أو دفع مجزأ).</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                <span>تتم معالجة وضمان الدفوعات الإلكترونية مسبقاً بشكل آمن عبر بوابة SofizPay بالذهبية أو CIB.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</div>
                <span>تتم تسوية المدفوعات والتحقق من تحصيلات التوصيل والربحية تلقائياً في لوحة التحكم.</span>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div style={{ textAlign: 'right' }} dir="rtl">
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>نحن هنا لحل أكبر عقبة في التجارة الإلكترونية بالجزائر</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '15px', marginBottom: '20px' }}>
              يعاني تجار التجارة الإلكترونية والدروبشيبينغ في الجزائر من معدلات مرتجعات هائلة تتجاوز أحياناً 50% بسبب تراجع العملاء عند وصول مندوب التوصيل، مما يسبب خسائر فادحة في تكاليف الشحن.
            </p>
            <p style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '15px', marginBottom: '24px' }}>
              من خلال دمج واجهة دفع <strong>SofizPay</strong>، أنشأنا أول نظام **Split Cash on Delivery** في الجزائر. يلتزم الزبون بجدية الشراء عن طريق دفع تكلفة الشحن مسبقاً إلكترونياً بالبطاقة، وفي حالة الرفض، لا يتحمل التاجر خسارة الشحن.
            </p>
            <Link href={user ? '/dashboard' : '/login'} className="hero-btn-primary" style={{ padding: '12px 28px', fontSize: '14px' }}>
              <span>تصفح لوحة التحكم الآن</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section id="features-section" className="section-padding" style={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.02)'
      }}>
        <h2 className="section-title">مميزات منصتنا بالتفصيل</h2>
        <p className="section-subtitle">
          كل ما تحتاجه لإطلاق تجارة إلكترونية ذكية وخالية من المخاطر المالية
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {/* Feature 1 */}
          <div className="widget-card" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '14px' }} dir="rtl">
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '10px', width: 'fit-content' }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>لوحة إدارة ومراقبة الطلبيات</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              واجهة متطورة لمراقبة طلباتك وإدارتها، سواء كنت تستورد مباشرة من AliExpress أو تعتمد على الموردين وتجار الجملة المحليين في الجزائر.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="widget-card" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '14px' }} dir="rtl">
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '10px', width: 'fit-content' }}>
              <CreditCard size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>خيارات دفع مرنة ومتكاملة</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              دعم كامل لثلاث طرق دفع يختارها العميل: الدفع نقداً عند الاستلام (COD)، الدفع الإلكتروني الكامل، أو الدفع الهجين (عربون الشحن مسبقاً والباقي عند الاستلام).
            </p>
          </div>

          {/* Feature 3 */}
          <div className="widget-card" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '14px' }} dir="rtl">
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '10px', width: 'fit-content' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>بوابة دفع SofizPay الوطنية</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              تكامل آمن ومباشر مع بوابة SofizPay لمعالجة معاملات البطاقة الذهبية لبريد الجزائر وبطاقات CIB البنكية الوطنية دون أي تعقيد.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="widget-card" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '14px' }} dir="rtl">
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '10px', width: 'fit-content' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>مطابقة وتسويات مالية ذكية</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              نظام لمطابقة الحسابات وتسوية مبالغ العربون المستلمة إلكترونياً مع تتبع المبالغ التي يجب تحصيلها نقداً عند الاستلام أولاً بأول.
            </p>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section id="faq-section" className="section-padding" style={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.02)',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 className="section-title">الأسئلة الشائعة (FAQ)</h2>
        <p className="section-subtitle">إجابات عن استفساراتك المتعلقة بالدفع والشحن والتشغيل</p>

        <div>
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => toggleFaq(index)}>
                <ChevronDown size={18} style={{ 
                  transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: activeFaq === index ? 'var(--primary)' : '#64748b'
                }} />
                <span>{item.q}</span>
              </button>
              <div className={`faq-answer ${activeFaq === index ? 'show' : ''}`} dir="rtl">
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Footer */}
      <footer style={{ 
        marginTop: 'auto', 
        padding: '50px 8%', 
        borderTop: '1px solid rgba(255, 255, 255, 0.03)', 
        background: 'rgba(5, 7, 13, 0.6)', 
        backdropFilter: 'blur(10px)',
        textAlign: 'center', 
        fontSize: '13px', 
        color: '#64748b',
        zIndex: 10 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span>© {new Date().getFullYear()} DzDropship. جميع الحقوق محفوظة.</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>بوابة دفع إلكترونية آمنة بواسطة حلول SofizPay للجزائر.</span>
        </div>
      </footer>
    </div>
  );
}
