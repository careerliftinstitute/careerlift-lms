document.addEventListener("DOMContentLoaded", function() {
    // ১. নোটিশের HTML কন্টেন্ট
    const noticeHTML = `
        <div class="top-bar-container">
            <div class="ticker-wrap">
                <div class="ticker-item bangla-text">
                    🔴 বিশেষ বিজ্ঞপ্তি: গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের প্রধানমন্ত্রীর কার্যালয়ের অধীনস্থ <strong>NSDA অনুমোদিত</strong> 'Care Giving' কোর্সে ১০০% সরকারি স্কলারশিপে ভর্তি চলছে! নিয়মিত ক্লাসে উপস্থিত থাকলে থাকছে দৈনিক যাতায়াত ভাতা। আসন সংখ্যা সীমিত, তাই আজই আবেদন করুন। 🔴
                </div>
            </div>
        </div>
    `;

    // ২. নোটিশের CSS স্টাইল (ডাইনামিক ভাবে যুক্ত করা হচ্ছে)
    const style = document.createElement('style');
    style.innerHTML = `
        .top-bar-container {
            background: linear-gradient(to right, #dc2626, #b91c1c);
            color: white; height: 40px; display: flex; align-items: center;
            overflow: hidden; position: fixed; top: 0; left: 0; width: 100%; z-index: 2000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-family: 'Hind Siliguri', sans-serif;
        }
        .ticker-wrap { width: 100%; overflow: hidden; white-space: nowrap; }
        .ticker-item {
            display: inline-block; padding-left: 100%;
            animation: ticker 30s linear infinite;
            font-size: 0.95rem; font-weight: 600;
        }
        .ticker-item:hover { animation-play-state: paused; cursor: default; }
        @keyframes ticker {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
        }
        /* Navbar কে নিচে নামানোর জন্য */
        body.has-notice .navbar { top: 40px !important; transition: top 0.3s; }
        body.has-notice .hero, 
        body.has-notice .hero-home { padding-top: 140px !important; }
        
        /* মোবাইলের জন্য */
        @media (max-width: 768px) {
            body.has-notice .navbar { top: 40px !important; }
            body.has-notice .hero { padding-top: 130px !important; }
        }
    `;
    document.head.appendChild(style);

    // ৩. বডির শুরুতে নোটিশ যোগ করা
    const body = document.body;
    const div = document.createElement('div');
    div.innerHTML = noticeHTML;
    
    // বডির একদম শুরুতে ইনজেক্ট করা
    body.prepend(div);
    
    // ৪. বডিতে একটি ক্লাস যুক্ত করা যাতে CSS দিয়ে Navbar নিচে নামানো যায়
    body.classList.add('has-notice');
});