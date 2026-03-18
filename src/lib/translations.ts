export type Language = 'en' | 'ta' | 'hi';

export interface Translations {
  welcome: string;
  dashboard: string;
  learningPlan: string;
  assessments: string;
  tracking: string;
  projects: string;
  finalExam: string;
  logout: string;
  selectLanguage: string;
  savePreferences: string;
  voiceInteraction: string;
  voiceDescription: string;
  readyForCert: string;
  takeFinalExam: string;
  buildRealProjects: string;
  exploreProjects: string;
  recentActivity: string;
  aiInsight: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    welcome: "Welcome back",
    dashboard: "Dashboard",
    learningPlan: "My Learning",
    assessments: "Skill Assessments",
    tracking: "Tracking",
    projects: "Projects",
    finalExam: "Final Exam",
    logout: "Logout",
    selectLanguage: "Select Language",
    savePreferences: "Save Preferences",
    voiceInteraction: "Voice Interaction",
    voiceDescription: "Enable voice-based interaction for a hands-free experience.",
    readyForCert: "Ready for Certification?",
    takeFinalExam: "Take Final Exam",
    buildRealProjects: "Build Real Projects",
    exploreProjects: "Explore Projects",
    recentActivity: "Recent Activity",
    aiInsight: "AI Skill Insight"
  },
  ta: {
    welcome: "மீண்டும் வருக",
    dashboard: "டாஷ்போர்டு",
    learningPlan: "எனது கற்றல்",
    assessments: "திறன் மதிப்பீடுகள்",
    tracking: "கண்காணிப்பு",
    projects: "திட்டங்கள்",
    finalExam: "இறுதித் தேர்வு",
    logout: "வெளியேறு",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    savePreferences: "விருப்பங்களைச் சேமிக்கவும்",
    voiceInteraction: "குரல் தொடர்பு",
    voiceDescription: "ஹேண்ட்ஸ்-ஃப்ரீ அனுபவத்திற்கு குரல் அடிப்படையிலான தொடர்பைச் செயல்படுத்தவும்.",
    readyForCert: "சான்றிதழுக்குத் தயாரா?",
    takeFinalExam: "இறுதித் தேர்வை எழுதுங்கள்",
    buildRealProjects: "உண்மையான திட்டங்களை உருவாக்குங்கள்",
    exploreProjects: "திட்டங்களை ஆராயுங்கள்",
    recentActivity: "சமீபத்திய செயல்பாடு",
    aiInsight: "AI திறன் நுண்ணறிவு"
  },
  hi: {
    welcome: "वापस स्वागत है",
    dashboard: "डैशबोर्ड",
    learningPlan: "मेरी शिक्षा",
    assessments: "कौशल मूल्यांकन",
    tracking: "ट्रैकिंग",
    projects: "परियोजनाएं",
    finalExam: "अंतिम परीक्षा",
    logout: "लॉगआउट",
    selectLanguage: "भाषा चुनें",
    savePreferences: "प्राथमिकताएं सहेजें",
    voiceInteraction: "आवाज बातचीत",
    voiceDescription: "हैंड्स-फ्री अनुभव के लिए आवाज-आधारित बातचीत सक्षम करें।",
    readyForCert: "प्रमाणन के लिए तैयार हैं?",
    takeFinalExam: "अंतिम परीक्षा दें",
    buildRealProjects: "वास्तविक परियोजनाएं बनाएं",
    exploreProjects: "परियोजनाओं का अन्वेषण करें",
    recentActivity: "हाल की गतिविधि",
    aiInsight: "AI कौशल अंतर्दृष्टि"
  }
};
