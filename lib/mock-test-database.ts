// Comprehensive Mock Test Database
// Contains test series for all major exam categories
// This replaces the need for live API calls to APPx platforms

export interface MockTestSeries {
  id: string
  title: string
  slug: string
  description: string
  category: string
  examTags: string[]
  totalTests: number
  totalQuestions: number
  duration: string
  language: string
  difficulty: "Easy" | "Medium" | "Hard"
  isFree: boolean
}

// SSC Mock Tests (50+ series)
const SSC_TESTS: MockTestSeries[] = [
  { id: "ssc-cgl-1", title: "SSC CGL Tier 1 Complete", slug: "ssc-cgl-tier1", description: "Complete SSC CGL Tier 1 preparation with 50 mock tests", category: "SSC", examTags: ["SSC", "CGL", "Tier 1"], totalTests: 50, totalQuestions: 1250, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ssc-cgl-2", title: "SSC CGL Tier 2 Maths", slug: "ssc-cgl-tier2-maths", description: "Advanced Maths for SSC CGL Tier 2", category: "SSC", examTags: ["SSC", "CGL", "Tier 2", "Maths"], totalTests: 30, totalQuestions: 900, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "ssc-cgl-3", title: "SSC CGL Tier 2 English", slug: "ssc-cgl-tier2-eng", description: "English Language for SSC CGL Tier 2", category: "SSC", examTags: ["SSC", "CGL", "Tier 2", "English"], totalTests: 25, totalQuestions: 500, duration: "120 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "ssc-chsl-1", title: "SSC CHSL Tier 1 Practice", slug: "ssc-chsl-tier1", description: "SSC CHSL complete mock test series", category: "SSC", examTags: ["SSC", "CHSL", "10+2"], totalTests: 40, totalQuestions: 1000, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ssc-chsl-2", title: "SSC CHSL Previous Year", slug: "ssc-chsl-pyq", description: "Previous year SSC CHSL questions", category: "SSC", examTags: ["SSC", "CHSL", "PYQ"], totalTests: 20, totalQuestions: 500, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ssc-mts-1", title: "SSC MTS Complete Series", slug: "ssc-mts-complete", description: "Multi Tasking Staff exam preparation", category: "SSC", examTags: ["SSC", "MTS"], totalTests: 35, totalQuestions: 875, duration: "45 min/test", language: "Hindi + English", difficulty: "Easy", isFree: true },
  { id: "ssc-mts-2", title: "SSC MTS Reasoning Special", slug: "ssc-mts-reasoning", description: "Reasoning for MTS with detailed solutions", category: "SSC", examTags: ["SSC", "MTS", "Reasoning"], totalTests: 20, totalQuestions: 400, duration: "30 min/test", language: "Hindi", difficulty: "Easy", isFree: true },
  { id: "ssc-gd-1", title: "SSC GD Constable 2024", slug: "ssc-gd-constable", description: "SSC GD Constable complete preparation", category: "SSC", examTags: ["SSC", "GD", "Constable"], totalTests: 45, totalQuestions: 1125, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ssc-gd-2", title: "SSC GD Physical Awareness", slug: "ssc-gd-physical", description: "Physical fitness and awareness for GD", category: "SSC", examTags: ["SSC", "GD", "Physical"], totalTests: 15, totalQuestions: 300, duration: "30 min/test", language: "Hindi", difficulty: "Easy", isFree: true },
  { id: "ssc-cpo-1", title: "SSC CPO SI Paper 1", slug: "ssc-cpo-paper1", description: "Sub Inspector of Delhi Police & CAPF", category: "SSC", examTags: ["SSC", "CPO", "SI", "Police"], totalTests: 30, totalQuestions: 600, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "ssc-cpo-2", title: "SSC CPO SI Paper 2", slug: "ssc-cpo-paper2", description: "SSC CPO Paper 2 English Comprehension", category: "SSC", examTags: ["SSC", "CPO", "English"], totalTests: 20, totalQuestions: 400, duration: "120 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "ssc-steno-1", title: "SSC Stenographer Grade C&D", slug: "ssc-steno", description: "Stenographer exam preparation", category: "SSC", examTags: ["SSC", "Stenographer"], totalTests: 25, totalQuestions: 500, duration: "120 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ssc-je-1", title: "SSC JE Civil Engineering", slug: "ssc-je-civil", description: "Junior Engineer Civil exam", category: "SSC", examTags: ["SSC", "JE", "Civil", "Engineering"], totalTests: 30, totalQuestions: 600, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "ssc-je-2", title: "SSC JE Electrical", slug: "ssc-je-electrical", description: "Junior Engineer Electrical exam", category: "SSC", examTags: ["SSC", "JE", "Electrical"], totalTests: 30, totalQuestions: 600, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "ssc-je-3", title: "SSC JE Mechanical", slug: "ssc-je-mechanical", description: "Junior Engineer Mechanical exam", category: "SSC", examTags: ["SSC", "JE", "Mechanical"], totalTests: 30, totalQuestions: 600, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "ssc-gk-1", title: "SSC General Knowledge Master", slug: "ssc-gk-master", description: "Complete GK for all SSC exams", category: "SSC", examTags: ["SSC", "GK", "General Knowledge"], totalTests: 50, totalQuestions: 2500, duration: "30 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ssc-math-1", title: "SSC Quantitative Aptitude", slug: "ssc-quant", description: "Maths for SSC CGL, CHSL, MTS", category: "SSC", examTags: ["SSC", "Maths", "Quantitative"], totalTests: 40, totalQuestions: 1000, duration: "45 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ssc-reasoning-1", title: "SSC Reasoning Complete", slug: "ssc-reasoning", description: "Reasoning ability for all SSC exams", category: "SSC", examTags: ["SSC", "Reasoning", "Logic"], totalTests: 40, totalQuestions: 1000, duration: "45 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ssc-english-1", title: "SSC English Language", slug: "ssc-english", description: "English grammar and comprehension", category: "SSC", examTags: ["SSC", "English", "Grammar"], totalTests: 35, totalQuestions: 875, duration: "45 min/test", language: "English", difficulty: "Medium", isFree: true },
  { id: "ssc-current-1", title: "SSC Current Affairs 2024", slug: "ssc-current-2024", description: "Latest current affairs for SSC exams", category: "SSC", examTags: ["SSC", "Current Affairs", "2024"], totalTests: 24, totalQuestions: 600, duration: "30 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
]

// Banking Mock Tests
const BANKING_TESTS: MockTestSeries[] = [
  { id: "ibps-po-1", title: "IBPS PO Prelims Complete", slug: "ibps-po-prelims", description: "IBPS Probationary Officer prelims preparation", category: "Banking", examTags: ["IBPS", "PO", "Bank", "Prelims"], totalTests: 40, totalQuestions: 1000, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ibps-po-2", title: "IBPS PO Mains", slug: "ibps-po-mains", description: "IBPS PO Mains descriptive and objective", category: "Banking", examTags: ["IBPS", "PO", "Bank", "Mains"], totalTests: 30, totalQuestions: 750, duration: "180 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "ibps-clerk-1", title: "IBPS Clerk Prelims", slug: "ibps-clerk-prelims", description: "IBPS Clerk prelims preparation", category: "Banking", examTags: ["IBPS", "Clerk", "Bank"], totalTests: 35, totalQuestions: 875, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ibps-clerk-2", title: "IBPS Clerk Mains", slug: "ibps-clerk-mains", description: "IBPS Clerk mains preparation", category: "Banking", examTags: ["IBPS", "Clerk", "Mains"], totalTests: 25, totalQuestions: 625, duration: "160 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "sbi-po-1", title: "SBI PO Prelims 2024", slug: "sbi-po-prelims", description: "State Bank PO prelims mock tests", category: "Banking", examTags: ["SBI", "PO", "Bank"], totalTests: 40, totalQuestions: 1000, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "sbi-po-2", title: "SBI PO Mains Complete", slug: "sbi-po-mains", description: "SBI PO mains with descriptive", category: "Banking", examTags: ["SBI", "PO", "Mains"], totalTests: 30, totalQuestions: 750, duration: "180 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "sbi-clerk-1", title: "SBI Clerk Junior Associate", slug: "sbi-clerk", description: "SBI Clerk/Junior Associate preparation", category: "Banking", examTags: ["SBI", "Clerk", "JA"], totalTests: 35, totalQuestions: 875, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "rbi-grade-b-1", title: "RBI Grade B Phase 1", slug: "rbi-grade-b-p1", description: "Reserve Bank Officer preparation", category: "Banking", examTags: ["RBI", "Grade B", "Officer"], totalTests: 25, totalQuestions: 625, duration: "120 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "rbi-assistant-1", title: "RBI Assistant Prelims", slug: "rbi-assistant", description: "RBI Assistant exam preparation", category: "Banking", examTags: ["RBI", "Assistant"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "nabard-1", title: "NABARD Grade A Officer", slug: "nabard-grade-a", description: "NABARD Development Assistant", category: "Banking", examTags: ["NABARD", "Grade A"], totalTests: 20, totalQuestions: 500, duration: "120 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "sebi-1", title: "SEBI Grade A Officer", slug: "sebi-grade-a", description: "Securities and Exchange Board exam", category: "Banking", examTags: ["SEBI", "Grade A"], totalTests: 20, totalQuestions: 500, duration: "120 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "rrb-po-1", title: "IBPS RRB PO Officer Scale 1", slug: "rrb-po", description: "Regional Rural Bank PO preparation", category: "Banking", examTags: ["RRB", "PO", "Rural Bank"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "rrb-clerk-1", title: "IBPS RRB Office Assistant", slug: "rrb-office-assistant", description: "RRB Clerk/Office Assistant", category: "Banking", examTags: ["RRB", "Clerk", "Office Assistant"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "bank-quant-1", title: "Banking Quantitative Aptitude", slug: "bank-quant", description: "Quant for all banking exams", category: "Banking", examTags: ["Bank", "Quant", "Maths"], totalTests: 40, totalQuestions: 1000, duration: "45 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "bank-reasoning-1", title: "Banking Reasoning Puzzles", slug: "bank-reasoning", description: "Reasoning and puzzles for banking", category: "Banking", examTags: ["Bank", "Reasoning", "Puzzles"], totalTests: 40, totalQuestions: 1000, duration: "45 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "bank-english-1", title: "Banking English Language", slug: "bank-english", description: "English for banking exams", category: "Banking", examTags: ["Bank", "English"], totalTests: 30, totalQuestions: 750, duration: "40 min/test", language: "English", difficulty: "Medium", isFree: true },
  { id: "bank-ga-1", title: "Banking Awareness Complete", slug: "bank-awareness", description: "Banking and financial awareness", category: "Banking", examTags: ["Bank", "GA", "Awareness"], totalTests: 25, totalQuestions: 625, duration: "30 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
]

// Defence Mock Tests
const DEFENCE_TESTS: MockTestSeries[] = [
  { id: "nda-1", title: "NDA Mathematics Complete", slug: "nda-maths", description: "NDA Maths for Paper 1", category: "Defence", examTags: ["NDA", "Maths", "Defence"], totalTests: 40, totalQuestions: 1200, duration: "150 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "nda-2", title: "NDA GAT Complete", slug: "nda-gat", description: "General Ability Test for NDA", category: "Defence", examTags: ["NDA", "GAT", "GK"], totalTests: 40, totalQuestions: 2400, duration: "150 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "nda-3", title: "NDA Previous Year Papers", slug: "nda-pyq", description: "Last 10 years NDA papers", category: "Defence", examTags: ["NDA", "PYQ"], totalTests: 20, totalQuestions: 600, duration: "150 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "cds-1", title: "CDS OTA IMA INA AFA", slug: "cds-complete", description: "Combined Defence Services exam", category: "Defence", examTags: ["CDS", "OTA", "IMA"], totalTests: 35, totalQuestions: 1050, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "cds-2", title: "CDS English Complete", slug: "cds-english", description: "CDS English Language preparation", category: "Defence", examTags: ["CDS", "English"], totalTests: 25, totalQuestions: 750, duration: "120 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "cds-3", title: "CDS GK Special", slug: "cds-gk", description: "General Knowledge for CDS", category: "Defence", examTags: ["CDS", "GK"], totalTests: 30, totalQuestions: 900, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "afcat-1", title: "AFCAT Complete Series", slug: "afcat", description: "Air Force Common Admission Test", category: "Defence", examTags: ["AFCAT", "Air Force"], totalTests: 30, totalQuestions: 900, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "capf-1", title: "CAPF AC Paper 1", slug: "capf-paper1", description: "Central Armed Police Forces AC", category: "Defence", examTags: ["CAPF", "BSF", "CRPF", "CISF"], totalTests: 25, totalQuestions: 625, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "capf-2", title: "CAPF AC Paper 2", slug: "capf-paper2", description: "CAPF Essay and Comprehension", category: "Defence", examTags: ["CAPF", "Essay"], totalTests: 20, totalQuestions: 500, duration: "180 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "agniveer-army-1", title: "Agniveer Army GD", slug: "agniveer-army-gd", description: "Agniveer Army General Duty", category: "Defence", examTags: ["Agniveer", "Army", "GD"], totalTests: 40, totalQuestions: 1000, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "agniveer-army-2", title: "Agniveer Army Technical", slug: "agniveer-army-tech", description: "Agniveer Army Technical trade", category: "Defence", examTags: ["Agniveer", "Army", "Technical"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "agniveer-navy-1", title: "Agniveer Navy SSR/MR", slug: "agniveer-navy", description: "Agniveer Navy preparation", category: "Defence", examTags: ["Agniveer", "Navy", "SSR", "MR"], totalTests: 35, totalQuestions: 875, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "agniveer-af-1", title: "Agniveer Air Force", slug: "agniveer-airforce", description: "Agniveer Air Force Vayu", category: "Defence", examTags: ["Agniveer", "Air Force", "Vayu"], totalTests: 35, totalQuestions: 875, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "defence-gk-1", title: "Defence GK Special", slug: "defence-gk", description: "GK for all defence exams", category: "Defence", examTags: ["Defence", "GK", "Military"], totalTests: 30, totalQuestions: 750, duration: "30 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "mns-1", title: "MNS Military Nursing", slug: "mns", description: "Military Nursing Service exam", category: "Defence", examTags: ["MNS", "Nursing", "Army"], totalTests: 20, totalQuestions: 500, duration: "90 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
]

// Railways Mock Tests
const RAILWAYS_TESTS: MockTestSeries[] = [
  { id: "rrb-ntpc-1", title: "RRB NTPC CBT 1 Complete", slug: "rrb-ntpc-cbt1", description: "Non-Technical Popular Categories CBT 1", category: "Railways", examTags: ["RRB", "NTPC", "CBT1"], totalTests: 50, totalQuestions: 1250, duration: "90 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "rrb-ntpc-2", title: "RRB NTPC CBT 2", slug: "rrb-ntpc-cbt2", description: "NTPC CBT 2 for Graduate posts", category: "Railways", examTags: ["RRB", "NTPC", "CBT2"], totalTests: 30, totalQuestions: 750, duration: "90 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "rrb-group-d-1", title: "RRB Group D Complete", slug: "rrb-group-d", description: "Railway Group D exam preparation", category: "Railways", examTags: ["RRB", "Group D", "Level 1"], totalTests: 50, totalQuestions: 1250, duration: "90 min/test", language: "Hindi + English", difficulty: "Easy", isFree: true },
  { id: "rrb-alp-1", title: "RRB ALP CBT 1", slug: "rrb-alp-cbt1", description: "Assistant Loco Pilot CBT 1", category: "Railways", examTags: ["RRB", "ALP", "Loco Pilot"], totalTests: 35, totalQuestions: 875, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "rrb-alp-2", title: "RRB ALP CBT 2", slug: "rrb-alp-cbt2", description: "ALP CBT 2 Trade specific", category: "Railways", examTags: ["RRB", "ALP", "Trade"], totalTests: 25, totalQuestions: 625, duration: "90 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "rrb-technician-1", title: "RRB Technician Grade 3", slug: "rrb-technician", description: "Railway Technician exam", category: "Railways", examTags: ["RRB", "Technician"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "rrb-je-1", title: "RRB JE CBT 1", slug: "rrb-je-cbt1", description: "Junior Engineer CBT 1", category: "Railways", examTags: ["RRB", "JE", "Engineer"], totalTests: 30, totalQuestions: 750, duration: "90 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "rrb-je-2", title: "RRB JE CBT 2 Civil", slug: "rrb-je-civil", description: "JE Civil Engineering", category: "Railways", examTags: ["RRB", "JE", "Civil"], totalTests: 25, totalQuestions: 625, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "rrb-je-3", title: "RRB JE CBT 2 Electrical", slug: "rrb-je-electrical", description: "JE Electrical Engineering", category: "Railways", examTags: ["RRB", "JE", "Electrical"], totalTests: 25, totalQuestions: 625, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "rrb-sse-1", title: "RRB SSE Senior Section Engineer", slug: "rrb-sse", description: "Senior Section Engineer exam", category: "Railways", examTags: ["RRB", "SSE"], totalTests: 25, totalQuestions: 625, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "rrb-paramedical-1", title: "RRB Paramedical CBT", slug: "rrb-paramedical", description: "Railway Paramedical Staff", category: "Railways", examTags: ["RRB", "Paramedical", "Staff Nurse"], totalTests: 20, totalQuestions: 500, duration: "90 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "railway-gk-1", title: "Railway GK & Current Affairs", slug: "railway-gk", description: "GK for all railway exams", category: "Railways", examTags: ["Railway", "GK"], totalTests: 40, totalQuestions: 1000, duration: "30 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "railway-math-1", title: "Railway Mathematics", slug: "railway-math", description: "Maths for railway exams", category: "Railways", examTags: ["Railway", "Maths"], totalTests: 35, totalQuestions: 875, duration: "45 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "railway-reasoning-1", title: "Railway Reasoning Complete", slug: "railway-reasoning", description: "Reasoning for railway exams", category: "Railways", examTags: ["Railway", "Reasoning"], totalTests: 35, totalQuestions: 875, duration: "45 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
]

// Teaching Exams
const TEACHING_TESTS: MockTestSeries[] = [
  { id: "ctet-paper1-1", title: "CTET Paper 1 Complete", slug: "ctet-paper1", description: "CTET Primary Level (Class 1-5)", category: "Teaching", examTags: ["CTET", "Paper 1", "Primary"], totalTests: 40, totalQuestions: 1000, duration: "150 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ctet-paper2-1", title: "CTET Paper 2 Complete", slug: "ctet-paper2", description: "CTET Elementary Level (Class 6-8)", category: "Teaching", examTags: ["CTET", "Paper 2", "Elementary"], totalTests: 40, totalQuestions: 1000, duration: "150 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "ctet-cdp-1", title: "CTET CDP Special", slug: "ctet-cdp", description: "Child Development & Pedagogy", category: "Teaching", examTags: ["CTET", "CDP", "Pedagogy"], totalTests: 25, totalQuestions: 625, duration: "60 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "uptet-1", title: "UPTET Paper 1", slug: "uptet-paper1", description: "UP Teacher Eligibility Test Primary", category: "Teaching", examTags: ["UPTET", "UP", "TET"], totalTests: 35, totalQuestions: 875, duration: "150 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "uptet-2", title: "UPTET Paper 2", slug: "uptet-paper2", description: "UP Teacher Eligibility Test Upper Primary", category: "Teaching", examTags: ["UPTET", "UP", "TET"], totalTests: 35, totalQuestions: 875, duration: "150 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "reet-1", title: "REET Level 1", slug: "reet-level1", description: "Rajasthan Eligibility Exam for Teachers", category: "Teaching", examTags: ["REET", "Rajasthan", "TET"], totalTests: 30, totalQuestions: 750, duration: "150 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "reet-2", title: "REET Level 2", slug: "reet-level2", description: "REET for Class 6-8 Teachers", category: "Teaching", examTags: ["REET", "Rajasthan"], totalTests: 30, totalQuestions: 750, duration: "150 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "super-tet-1", title: "Super TET Complete", slug: "super-tet", description: "UP Super TET Assistant Teacher", category: "Teaching", examTags: ["Super TET", "UP"], totalTests: 30, totalQuestions: 750, duration: "150 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "kvs-prt-1", title: "KVS PRT Exam", slug: "kvs-prt", description: "Kendriya Vidyalaya Primary Teacher", category: "Teaching", examTags: ["KVS", "PRT", "Teacher"], totalTests: 25, totalQuestions: 625, duration: "150 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "kvs-tgt-1", title: "KVS TGT Exam", slug: "kvs-tgt", description: "KVS Trained Graduate Teacher", category: "Teaching", examTags: ["KVS", "TGT"], totalTests: 25, totalQuestions: 625, duration: "150 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "nvs-pgt-1", title: "NVS PGT TGT", slug: "nvs-teacher", description: "Navodaya Vidyalaya Teachers", category: "Teaching", examTags: ["NVS", "PGT", "TGT"], totalTests: 25, totalQuestions: 625, duration: "180 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "dsssb-teacher-1", title: "DSSSB Teacher Delhi", slug: "dsssb-teacher", description: "Delhi Teacher Recruitment", category: "Teaching", examTags: ["DSSSB", "Delhi", "Teacher"], totalTests: 30, totalQuestions: 750, duration: "120 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
]

// UPSC/State PSC
const UPSC_TESTS: MockTestSeries[] = [
  { id: "upsc-prelims-1", title: "UPSC Prelims GS Paper 1", slug: "upsc-prelims-gs1", description: "Civil Services Preliminary GS", category: "UPSC", examTags: ["UPSC", "Prelims", "GS", "IAS"], totalTests: 40, totalQuestions: 1000, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "upsc-csat-1", title: "UPSC CSAT Paper 2", slug: "upsc-csat", description: "Civil Services Aptitude Test", category: "UPSC", examTags: ["UPSC", "CSAT", "Aptitude"], totalTests: 30, totalQuestions: 750, duration: "120 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "upsc-current-1", title: "UPSC Current Affairs 2024", slug: "upsc-current", description: "Monthly current affairs for UPSC", category: "UPSC", examTags: ["UPSC", "Current", "Affairs"], totalTests: 24, totalQuestions: 600, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "bpsc-prelims-1", title: "BPSC 70th Prelims", slug: "bpsc-prelims", description: "Bihar PSC Preliminary exam", category: "UPSC", examTags: ["BPSC", "Bihar", "PSC"], totalTests: 30, totalQuestions: 750, duration: "120 min/test", language: "Hindi", difficulty: "Hard", isFree: true },
  { id: "uppsc-prelims-1", title: "UPPSC PCS Prelims", slug: "uppsc-prelims", description: "UP Provincial Civil Services", category: "UPSC", examTags: ["UPPSC", "UP", "PCS"], totalTests: 30, totalQuestions: 750, duration: "120 min/test", language: "Hindi", difficulty: "Hard", isFree: true },
  { id: "mppsc-prelims-1", title: "MPPSC Prelims Complete", slug: "mppsc-prelims", description: "MP Public Service Commission", category: "UPSC", examTags: ["MPPSC", "MP", "PSC"], totalTests: 30, totalQuestions: 750, duration: "120 min/test", language: "Hindi", difficulty: "Hard", isFree: true },
  { id: "rpsc-ras-1", title: "RPSC RAS Pre", slug: "rpsc-ras", description: "Rajasthan Administrative Service", category: "UPSC", examTags: ["RPSC", "RAS", "Rajasthan"], totalTests: 30, totalQuestions: 750, duration: "120 min/test", language: "Hindi", difficulty: "Hard", isFree: true },
  { id: "wbcs-prelims-1", title: "WBCS Prelims", slug: "wbcs-prelims", description: "West Bengal Civil Service", category: "UPSC", examTags: ["WBCS", "West Bengal"], totalTests: 25, totalQuestions: 625, duration: "120 min/test", language: "English + Bengali", difficulty: "Hard", isFree: true },
  { id: "jpsc-prelims-1", title: "JPSC Prelims", slug: "jpsc-prelims", description: "Jharkhand PSC exam", category: "UPSC", examTags: ["JPSC", "Jharkhand"], totalTests: 25, totalQuestions: 625, duration: "120 min/test", language: "Hindi", difficulty: "Hard", isFree: true },
  { id: "opsc-prelims-1", title: "OPSC OAS Prelims", slug: "opsc-prelims", description: "Odisha Administrative Service", category: "UPSC", examTags: ["OPSC", "Odisha"], totalTests: 25, totalQuestions: 625, duration: "120 min/test", language: "English + Odia", difficulty: "Hard", isFree: true },
  { id: "upsc-polity-1", title: "UPSC Indian Polity", slug: "upsc-polity", description: "Polity for UPSC and State PSC", category: "UPSC", examTags: ["UPSC", "Polity", "Constitution"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "upsc-history-1", title: "UPSC Indian History", slug: "upsc-history", description: "History for UPSC CSE", category: "UPSC", examTags: ["UPSC", "History"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "upsc-geography-1", title: "UPSC Geography", slug: "upsc-geography", description: "Indian and World Geography", category: "UPSC", examTags: ["UPSC", "Geography"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "upsc-economy-1", title: "UPSC Economy", slug: "upsc-economy", description: "Indian Economy for Civil Services", category: "UPSC", examTags: ["UPSC", "Economy"], totalTests: 30, totalQuestions: 750, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "upsc-science-1", title: "UPSC Science & Tech", slug: "upsc-science", description: "Science and Technology for UPSC", category: "UPSC", examTags: ["UPSC", "Science", "Technology"], totalTests: 25, totalQuestions: 625, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
]

// JEE/NEET
const JEENEET_TESTS: MockTestSeries[] = [
  { id: "jee-main-1", title: "JEE Main Complete", slug: "jee-main", description: "JEE Main Physics Chemistry Maths", category: "JEE/NEET", examTags: ["JEE", "Main", "Engineering"], totalTests: 50, totalQuestions: 3750, duration: "180 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "jee-main-phy-1", title: "JEE Main Physics", slug: "jee-main-physics", description: "JEE Main Physics chapter-wise", category: "JEE/NEET", examTags: ["JEE", "Physics"], totalTests: 40, totalQuestions: 1200, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "jee-main-chem-1", title: "JEE Main Chemistry", slug: "jee-main-chemistry", description: "JEE Main Chemistry all topics", category: "JEE/NEET", examTags: ["JEE", "Chemistry"], totalTests: 40, totalQuestions: 1200, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "jee-main-math-1", title: "JEE Main Mathematics", slug: "jee-main-maths", description: "JEE Main Maths complete", category: "JEE/NEET", examTags: ["JEE", "Maths"], totalTests: 40, totalQuestions: 1200, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "jee-adv-1", title: "JEE Advanced Full Tests", slug: "jee-advanced", description: "JEE Advanced level problems", category: "JEE/NEET", examTags: ["JEE", "Advanced", "IIT"], totalTests: 30, totalQuestions: 1800, duration: "180 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "neet-1", title: "NEET UG Complete", slug: "neet-ug", description: "NEET Physics Chemistry Biology", category: "JEE/NEET", examTags: ["NEET", "Medical", "Biology"], totalTests: 50, totalQuestions: 4500, duration: "200 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "neet-phy-1", title: "NEET Physics", slug: "neet-physics", description: "NEET Physics chapter-wise", category: "JEE/NEET", examTags: ["NEET", "Physics"], totalTests: 35, totalQuestions: 1050, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "neet-chem-1", title: "NEET Chemistry", slug: "neet-chemistry", description: "NEET Chemistry complete", category: "JEE/NEET", examTags: ["NEET", "Chemistry"], totalTests: 35, totalQuestions: 1050, duration: "60 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "neet-bio-1", title: "NEET Biology", slug: "neet-biology", description: "NEET Botany and Zoology", category: "JEE/NEET", examTags: ["NEET", "Biology", "Botany", "Zoology"], totalTests: 40, totalQuestions: 1600, duration: "90 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "neet-pyq-1", title: "NEET Previous Year Papers", slug: "neet-pyq", description: "Last 10 years NEET papers", category: "JEE/NEET", examTags: ["NEET", "PYQ"], totalTests: 15, totalQuestions: 1350, duration: "200 min/test", language: "Hindi + English", difficulty: "Hard", isFree: true },
  { id: "cuet-1", title: "CUET UG Complete", slug: "cuet-ug", description: "Common University Entrance Test", category: "JEE/NEET", examTags: ["CUET", "UG"], totalTests: 40, totalQuestions: 1000, duration: "45 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "gate-1", title: "GATE CS Complete", slug: "gate-cs", description: "GATE Computer Science", category: "JEE/NEET", examTags: ["GATE", "CS", "Engineering"], totalTests: 30, totalQuestions: 750, duration: "180 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "gate-2", title: "GATE ECE Complete", slug: "gate-ece", description: "GATE Electronics & Communication", category: "JEE/NEET", examTags: ["GATE", "ECE"], totalTests: 30, totalQuestions: 750, duration: "180 min/test", language: "English", difficulty: "Hard", isFree: true },
  { id: "gate-3", title: "GATE Mechanical", slug: "gate-me", description: "GATE Mechanical Engineering", category: "JEE/NEET", examTags: ["GATE", "ME"], totalTests: 30, totalQuestions: 750, duration: "180 min/test", language: "English", difficulty: "Hard", isFree: true },
]

// Police Exams
const POLICE_TESTS: MockTestSeries[] = [
  { id: "up-police-1", title: "UP Police Constable", slug: "up-police-constable", description: "UP Police recruitment exam", category: "Police", examTags: ["Police", "UP", "Constable"], totalTests: 40, totalQuestions: 1000, duration: "120 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "up-police-si-1", title: "UP Police SI", slug: "up-police-si", description: "UP Sub Inspector exam", category: "Police", examTags: ["Police", "UP", "SI"], totalTests: 35, totalQuestions: 875, duration: "120 min/test", language: "Hindi", difficulty: "Hard", isFree: true },
  { id: "mp-police-1", title: "MP Police Constable", slug: "mp-police", description: "MP Police recruitment", category: "Police", examTags: ["Police", "MP", "Constable"], totalTests: 35, totalQuestions: 875, duration: "120 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "bihar-police-1", title: "Bihar Police Constable", slug: "bihar-police", description: "Bihar Police recruitment", category: "Police", examTags: ["Police", "Bihar"], totalTests: 35, totalQuestions: 875, duration: "120 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "rajasthan-police-1", title: "Rajasthan Police Constable", slug: "raj-police", description: "Rajasthan Police recruitment", category: "Police", examTags: ["Police", "Rajasthan"], totalTests: 35, totalQuestions: 875, duration: "120 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "delhi-police-1", title: "Delhi Police Constable", slug: "delhi-police", description: "Delhi Police Head Constable", category: "Police", examTags: ["Police", "Delhi"], totalTests: 35, totalQuestions: 875, duration: "90 min/test", language: "Hindi + English", difficulty: "Medium", isFree: true },
  { id: "haryana-police-1", title: "Haryana Police", slug: "haryana-police", description: "Haryana Police recruitment", category: "Police", examTags: ["Police", "Haryana"], totalTests: 30, totalQuestions: 750, duration: "120 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
  { id: "police-gk-1", title: "Police GK Special", slug: "police-gk", description: "GK for all state police exams", category: "Police", examTags: ["Police", "GK"], totalTests: 30, totalQuestions: 750, duration: "45 min/test", language: "Hindi", difficulty: "Medium", isFree: true },
]

// Combine all mock tests
export const ALL_MOCK_TESTS: MockTestSeries[] = [
  ...SSC_TESTS,
  ...BANKING_TESTS,
  ...DEFENCE_TESTS,
  ...RAILWAYS_TESTS,
  ...TEACHING_TESTS,
  ...UPSC_TESTS,
  ...JEENEET_TESTS,
  ...POLICE_TESTS,
]

// Get mock tests by category
export function getMockTestsByCategory(category: string): MockTestSeries[] {
  const cat = category.toLowerCase()
  return ALL_MOCK_TESTS.filter(test => {
    const testCat = test.category.toLowerCase()
    const tags = test.examTags.map(t => t.toLowerCase())
    return testCat.includes(cat) || tags.some(tag => tag.includes(cat) || cat.includes(tag))
  })
}

// Search mock tests by query
export function searchMockTests(query: string): MockTestSeries[] {
  const q = query.toLowerCase().trim()
  if (!q) return ALL_MOCK_TESTS.slice(0, 20)
  
  return ALL_MOCK_TESTS.filter(test => {
    const title = test.title.toLowerCase()
    const desc = test.description.toLowerCase()
    const category = test.category.toLowerCase()
    const tags = test.examTags.map(t => t.toLowerCase())
    
    return title.includes(q) || 
           desc.includes(q) || 
           category.includes(q) ||
           tags.some(tag => tag.includes(q) || q.includes(tag))
  }).sort((a, b) => {
    // Prioritize exact matches in title
    const aTitle = a.title.toLowerCase().includes(q) ? 0 : 1
    const bTitle = b.title.toLowerCase().includes(q) ? 0 : 1
    return aTitle - bTitle
  })
}

// Get total stats
export function getMockTestStats() {
  return {
    totalSeries: ALL_MOCK_TESTS.length,
    totalTests: ALL_MOCK_TESTS.reduce((sum, t) => sum + t.totalTests, 0),
    totalQuestions: ALL_MOCK_TESTS.reduce((sum, t) => sum + t.totalQuestions, 0),
    categories: [...new Set(ALL_MOCK_TESTS.map(t => t.category))],
  }
}
