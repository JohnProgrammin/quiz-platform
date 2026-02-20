const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src', 'i18n', 'locales', 'en.json');
const data = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Auth Update
data.auth.welcomeBack = "Welcome back! Ready to crush your goals today?";
data.auth.startLearningSmarter = "Unlock your brain's true potential with AI";

// Dashboard
data.dashboard.welcome = "Welcome back, {{name}}! Let's make today count! 🚀";

// Results
data.results.perfectScore = "Flawless victory! You're a natural master. 🏆";
data.results.great = "Incredible job! You're so close to absolute perfection. 🌟";
data.results.good = "Solid effort! Let's turn those mistakes into stepping stones. 💪";
data.results.keepPracticing = "Every master was once a beginner. Keep pushing! 🔥";

// Upgrade & Subscription
data.upgrade.upgradeDescription = "Stop guessing. Start mastering. Unlock unlimited AI tutors and laser-focused feedback to dominate your exams.";
data.subscription.upgradeBenefits = "Level up your brain. Unlock Premium to learn 10x faster and leave your competition behind.";
data.subscription.unlockLearning = "Don't let limits hold you back. Unlock your full potential with Pro.";

// Landing - Hero
data.landing.hero.title = "Dominate Your Exams";
data.landing.hero.titleSpan = "In Half The Time";
data.landing.hero.subtitle = "Stop struggling with massive textbooks.";
data.landing.hero.subtitleStrong = "Let our world-class AI turn your notes into hyper-addictive mastery paths";
data.landing.hero.subtitleCta = "so you can learn faster, retain forever, and easily become the top 1%.";
data.landing.hero.startLearning = "START YOUR ASCENT FOR FREE";

// Landing - Features
data.landing.features.why = "Your Unfair Advantage";
data.landing.features.title = "Because Average Isn't Good Enough";
data.landing.features.subtitle = "We didn't just build a quiz app. We built an elite mastery engine designed to permanently wire your brain for success.";
data.landing.features.startFree = "Zero Risk, Pure Reward";
data.landing.features.startFreeDesc = "Experience the future of learning instantly. No credit card required to start transforming your grades.";
data.landing.features.findWeaknesses = "Surgical Precision";
data.landing.features.findWeaknessesDesc = "Our AI instantly diagnoses your knowledge gaps to save you hundreds of hours of wasted study time.";
data.landing.features.personalized = "Your Elite Private Tutor";
data.landing.features.personalizedDesc = "Available 24/7. Never gets tired. Dedicated solely to unlocking your absolute maximum potential.";

// Landing - Steps
data.landing.steps.how = "The Mastery Blueprint";
data.landing.steps.title = "From Overwhelmed to Unstoppable";
data.landing.steps.subtitle = "Three effortless steps to definitively lock complex information into your brain.";
data.landing.steps.uploadNotes = "Dump Your Brain";
data.landing.steps.uploadNotesDesc = "Throw your messy PDFs, docs, or raw text at us. We handle the heavy lifting.";
data.landing.steps.generateQuiz = "Watch The Magic";
data.landing.steps.generateQuizDesc = "Our AI instantly processes your material into high-yield, brain-sticky practice sessions.";
data.landing.steps.learnImprove = "Achieve Dominance";
data.landing.steps.learnImproveDesc = "Annihilate your weak points, watch your confidence soar, and completely destroy your exams.";

// Landing - Pricing
data.landing.pricing.label = "Invest In Your Future";
data.landing.pricing.title = "Unlock Your Ultimate Potential";
data.landing.pricing.subtitle = "For the price of a cup of coffee, get the definitive academic unfair advantage. Cancel literally anytime.";
data.landing.pricing.proDesc = "Unlock the elite toolkit to effortlessly crush any subject and accelerate your success.";
data.landing.pricing.premiumDesc = "The ultimate VIP experience. A world-class private AI tutor in your pocket, 24/7.";
data.landing.pricing.upgradePro = "CLAIM YOUR ADVANTAGE";
data.landing.pricing.goPremium = "BECOME UNSTOPPABLE";

// Pricing page details
data.pricing.forSeriousLearners = "For students who refuse to settle for average.";
data.pricing.forMasterySeekers = "For those destined to be the absolute best.";

// CTA
data.landing.cta.title = "Your Future Starts Right Now";
data.landing.cta.subtitle = "Join the elite ranks of students who are learning 10x faster and completely dominating their classes.";
data.landing.cta.cta = "UNLOCK YOUR POTENTIAL NOW";

fs.writeFileSync(enPath, JSON.stringify(data, null, 2));
console.log('Successfully updated en.json!');
