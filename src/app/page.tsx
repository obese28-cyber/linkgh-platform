"use client";

import { useState, useMemo } from "react";
import "./globals.css";

/* ══════════════════════════════════════════════════════════════════════════
   TYPES & STRICT DATA STRUCTURE INTERFACES
══════════════════════════════════════════════════════════════════════════ */
type Page = "home" | "professionals" | "feed";

interface MockJob {
  id: number;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string | null;
  deadline: string | null;
  applyUrl: string;
  isVerified: boolean;
  category: string;
  featured?: boolean;
}

interface Professional {
  name: string;
  title: string;
  credential: string;
  connections: number;
  accentKey: number;
  avatarSeed: string;
  avatarImg: string; // Mapped to your local images folder
  location: string;
  skills: string[];
}

interface BodyUpdate {
  id: string;
  body: string;
  logo: string;
  featured: boolean;
  tag: string;
  title: string;
  description: string;
  timestamp: string;
  readTime: string;
}

interface CredentialBody {
  name: string;
  label: string;
  logoImg: string; // Mapped to your local frameworks folder
  domain: string | null;
  type: string;
}

interface FeedPost {
  category: string;
  title: string;
  body: string;
  readTime: string;
  tag: string | null;
  likes: number;
  shares: number;
  author: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   STATIC DATA STORES & PLATFORM VARIABLES
══════════════════════════════════════════════════════════════════════════ */
const CATEGORIES: string[] = [
  "All", "Accounting", "Finance", "Banking", "Bookkeeping", "Audit", "Tax",
  "Administration", "Customer Service", "Sales & Marketing", "Technology",
  "Healthcare", "Engineering", "Education", "NGO", "Government",
  "Logistics", "Hospitality", "Remote Jobs", "Other Jobs"
];

const MOCK_JOBS: MockJob[] = [
  { id: 1, title: "Senior Accountant", company: "Deloitte Ghana", location: "Accra", jobType: "Full-time", salary: "GHS 4,500–6,000/mo", deadline: "6 days left", applyUrl: "#", isVerified: true, category: "Accounting", featured: true },
  { id: 2, title: "Accounts Officer", company: "Ghana Water Company", location: "Accra", jobType: "Full-time", salary: "GHS 3,200–4,500/mo", deadline: "10 days left", applyUrl: "#", isVerified: true, category: "Accounting", featured: false },
  { id: 3, title: "Bookkeeper", company: "RMG Ghana", location: "Tema", jobType: "Full-time", salary: "GHS 2,800–3,500/mo", deadline: "5 days left", applyUrl: "#", isVerified: false, category: "Bookkeeping", featured: false },
  { id: 4, title: "Audit Associate", company: "BDO Ghana", location: "Accra", jobType: "Full-time", salary: "GHS 4,000–5,500/mo", deadline: "7 days left", applyUrl: "#", isVerified: true, category: "Audit", featured: true },
  { id: 5, title: "Finance Analyst", company: "Standard Chartered", location: "Accra", jobType: "Full-time", salary: "GHS 5,000–7,500/mo", deadline: "6 days left", applyUrl: "#", isVerified: true, category: "Finance", featured: true },
  { id: 6, title: "Treasury Officer", company: "ADB Bank", location: "Accra", jobType: "Full-time", salary: "GHS 4,200–5,800/mo", deadline: "8 days left", applyUrl: "#", isVerified: true, category: "Banking", featured: false },
  { id: 7, title: "Banking Operations Officer", company: "GCB Bank", location: "Accra", jobType: "Full-time", salary: "GHS 3,800–5,000/mo", deadline: "9 days left", applyUrl: "#", isVerified: true, category: "Banking", featured: false },
  { id: 8, title: "Credit Analyst", company: "Fidelity Bank", location: "Accra", jobType: "Full-time", salary: "GHS 4,500–6,200/mo", deadline: "7 days left", applyUrl: "#", isVerified: true, category: "Finance", featured: false },
];

const PROFESSIONALS: Professional[] = [
  { name: "Charles Ofosu Obese", title: "Chartered Accountant & Finance Professional", credential: "ICAG · MBA Accounting", connections: 312, accentKey: 0, avatarSeed: "CO", avatarImg: "/profiles/charles-obese.jpg", location: "Accra, Ghana", skills: ["Financial Auditing", "IFRS Compliance", "Strategic Tax Planning", "Corporate Finance"] },
  { name: "Akosua Mensah", title: "Tax Consultant & Regulatory Advisor", credential: "CIT Ghana · VAT · PAYE", connections: 187, accentKey: 1, avatarSeed: "AM", avatarImg: "/profiles/akosua-mensah.jpg", location: "Accra, Ghana", skills: ["Corporate Taxation", "Tax Audits", "GRA Dispute Resolution", "Payroll Systems"] },
  { name: "Kojo Boateng", title: "Senior Internal Auditor", credential: "CIA · Risk · Controls", connections: 241, accentKey: 2, avatarSeed: "KB", avatarImg: "/profiles/kojo-boateng.jpg", location: "Kumasi, Ghana", skills: ["Risk Assessment", "Internal Controls", "Sarbanes-Oxley", "Fraud Prevention"] },
  { name: "Ama Owusu", title: "HR Business Partner", credential: "SHRM · Talent Management", connections: 159, accentKey: 0, avatarSeed: "AO", avatarImg: "/profiles/ama-owusu.jpg", location: "Accra, Ghana", skills: ["Strategic Hiring", "Employee Relations", "Compensation Frameworks", "Labor Law"] },
  { name: "Kwame Asante", title: "Lead Full Stack Software Engineer", credential: "AWS Certified · React", connections: 278, accentKey: 1, avatarSeed: "KA", avatarImg: "/profiles/kwame-asante.jpg", location: "Remote / Tema", skills: ["React/Next.js", "Node.js", "Cloud Infrastructure", "System Architecture"] },
  { name: "Abena Mensah-Bonsu", title: "Healthcare Systems Administrator", credential: "MHA · NMC · GHS", connections: 134, accentKey: 2, avatarSeed: "AM", avatarImg: "/profiles/abena-bonsu.jpg", location: "Accra, Ghana", skills: ["Hospital Operations", "Clinical Compliance", "Healthcare Policy", "Quality Assurance"] },
  { name: "Fiifi Boateng", title: "Senior Civil & Structural Engineer", credential: "GhIE · BSc Civil Eng.", connections: 196, accentKey: 0, avatarSeed: "FB", avatarImg: "/profiles/fiifi-boateng.jpg", location: "Takoradi, Ghana", skills: ["Structural Design", "Project Management", "Feasibility Studies", "AutoCAD"] },
  { name: "Adwoa Asare", title: "NGO Programme Lifecycle Manager", credential: "MSc Dev. Studies · UNDP", connections: 223, accentKey: 1, avatarSeed: "AA", avatarImg: "/profiles/adwoa-asare.jpg", location: "Tamale, Ghana", skills: ["Grant Management", "International Development", "Monitoring & Evaluation"] },
];

const BODY_UPDATES: BodyUpdate[] = [
  { id: "icag", body: "ICAG Ghana", logo: "/frameworks/icag.png", featured: true, tag: "Official Update", title: "New CPD Requirements", description: "Updated CPD framework and compliance timeline for all chartered members — effective next quarter.", timestamp: "2 hours ago", readTime: "5 min read" },
  { id: "cit", body: "CIT Ghana", logo: "/frameworks/cit.png", featured: false, tag: "Industry Insight", title: "Annual Tax Conference Key Takeaways", description: "Upcoming adjustments to local corporate tax models and filing practices for the next fiscal year.", timestamp: "5 hours ago", readTime: "8 min read" },
  { id: "cia", body: "IIA / CIA", logo: "/frameworks/iia.png", featured: false, tag: "Standards Update", title: "Internal Audit Excellence Standards", description: "New global internal audit standards framework rollout and implementation guidelines for practitioners.", timestamp: "1 day ago", readTime: "12 min read" },
  { id: "acca", body: "ACCA", logo: "/frameworks/acca.png", featured: false, tag: "Global Report", title: "Global Talent Trends Report", description: "Changing professional demands, equity expectations, and technological transformation across workplaces.", timestamp: "2 days ago", readTime: "15 min read" },
];

const CREDENTIALS: CredentialBody[] = [
  { name: "ICAG", label: "ICAG Ghana", logoImg: "/frameworks/icag.png", domain: "icagh.com", type: "Accounting" },
  { name: "CIT", label: "CIT Ghana", logoImg: "/frameworks/cit.png", domain: "citghana.org", type: "Taxation" },
  { name: "ACCA", label: "ACCA Global", logoImg: "/frameworks/acca.png", domain: "accaglobal.com", type: "Accounting" },
  { name: "CIMA", label: "CIMA", logoImg: "/frameworks/cima.png", domain: "cimaglobal.com", type: "Finance" },
  { name: "CPA", label: "CPA / AICPA", logoImg: "/frameworks/cpa.png", domain: "aicpa-cima.com", type: "Accounting" },
  { name: "ICAEW", label: "ICAEW", logoImg: "/frameworks/icaew.png", domain: "icaew.com", type: "Audit" },
  { name: "IIA", label: "IIA / CIA", logoImg: "/frameworks/iia.png", domain: "theiia.org", type: "Audit" },
  { name: "GBA", label: "Ghana Bar Assoc.", logoImg: "/frameworks/gba.png", domain: null, type: "Legal" }
];

const FEED_POSTS: FeedPost[] = [
  { category: "Career Advice", title: "How Ghana professionals can improve recruiter visibility", body: "Practical steps to optimise your profile so hiring managers find you first — from headline to endorsements and skill keywords.", readTime: "4 min read", tag: "New", likes: 142, shares: 38, author: "Akwasi Prempeh" },
  { category: "Trust & Credentials", title: "Why verified credentials matter for trusted hiring in Ghana", body: "Employers across Ghana are tightening credential checks. Here is what that means for your career and how LinkGH helps.", readTime: "33 min read", tag: "Popular", likes: 310, shares: 89, author: "Freda Anang" },
  { category: "Compliance", title: "GRA's new filing rules and what professionals need to know", body: "The Ghana Revenue Authority has updated key requirements for corporate filings. Finance and tax professionals need to act now.", readTime: "6 min read", tag: null, likes: 187, shares: 53, author: "Emmanuel Owusu" },
];

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS & VISUAL TOKENS
══════════════════════════════════════════════════════════════════════════ */
const ACCENTS = ["#0A79A4", "#7367AF", "#219777"] as const;

const BACKGROUND_IMAGES: Record<Page, string> = {
  home: "/backgrounds/home-bg.webp",
  professionals: "/backgrounds/professionals-bg.jpg",
  feed: "/backgrounds/feed-bg.webp",
};

const GLASS_STYLES = {
  container: {
    background: "rgba(10, 15, 30, 0.65)",
    backdropFilter: "blur(25px) saturate(160%)",
    WebkitBackdropFilter: "blur(25px) saturate(160%)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.6)",
  },
  interactive: {
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.3)",
  }
};

const isUrgent = (deadline: string | null): boolean => {
  if (!deadline) return false;
  const parsed = parseInt(deadline, 10);
  return !isNaN(parsed) && parsed <= 5 && deadline.includes("day");
};

function PageHero({ meshKey, minHeight, children }: { meshKey: Page; minHeight: number; children: React.ReactNode }) {
  const imgSrc = BACKGROUND_IMAGES[meshKey] || BACKGROUND_IMAGES.home;
  
  return (
    <div className="hero-wrap" style={{ minHeight, position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div 
        aria-hidden="true" 
        style={{ 
          position: "absolute", 
          inset: 0, 
          backgroundImage: `url(${imgSrc})`, 
          backgroundSize: "cover", 
          backgroundPosition: "center center", 
          zIndex: 0 
        }} 
      />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(4,7,13,0.3) 0%, #04070D 100%), rgba(4,7,13,0.4)", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   REUSABLE INTERACTIVE MICRO-COMPONENTS
══════════════════════════════════════════════════════════════════════════ */
function GlowBar() {
  return (
    <div className="glow-bar" aria-hidden="true" style={{ display: "flex", width: "100%", height: "2px", overflow: "hidden", position: "relative" }}>
      <span style={{ flex: 1, height: "100%", background: "linear-gradient(90deg, transparent, rgba(10,121,164,0.8), transparent)" }} />
      <span style={{ flex: 1, height: "100%", background: "linear-gradient(90deg, transparent, rgba(115,103,175,0.8), transparent)" }} />
      <span style={{ flex: 1, height: "100%", background: "linear-gradient(90deg, transparent, rgba(33,151,119,0.8), transparent)" }} />
    </div>
  );
}

function FlagBar() {
  return (
    <div style={{ display: "flex", width: "100%", height: "3px", borderRadius: "16px 16px 0 0" }} aria-hidden="true">
      <span style={{ flex: 1, background: "rgba(224,85,85,0.8)" }} />
      <span style={{ flex: 1, background: "rgba(242,201,76,0.8)" }} />
      <span style={{ flex: 1, background: "rgba(33,151,119,0.8)" }} />
    </div>
  );
}

function VerifiedPip({ accent }: { accent: string }) {
  return (
    <span className="verified-pip" style={{ color: "#FFF", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", border: `1px solid ${accent}80`, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
      Verified
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULAR BLOCK ARCHITECTURES (GLASS CARDS)
══════════════════════════════════════════════════════════════════════════ */
function JobCard({ job, accent }: { job: MockJob; accent: string }) {
  const [saved, setSaved] = useState<boolean>(false);
  const urgent = isUrgent(job.deadline);

  return (
    <div className="job-card" style={{ ...GLASS_STYLES.container, display: "flex", flexDirection: "column", minWidth: 280, flex: "1 1 300px", position: "relative", overflow: "hidden", borderRadius: 20, transition: "all 0.3s ease" }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)`, width: "100%" }} />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#FFF", margin: 0, lineHeight: 1.35, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{job.title}</h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4, margin: 0 }}>{job.company}</p>
          </div>
          {job.isVerified && <VerifiedPip accent={accent} />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "4px 0 auto" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>📍 {job.location} · <b style={{ color: "#FFF" }}>{job.jobType}</b></span>
          {job.salary && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>💰 {job.salary}</span>}
          {job.deadline && <span style={{ fontSize: 12, fontWeight: 600, color: urgent ? "#FF6B6B" : "rgba(255,255,255,0.5)" }}>⏳ {job.deadline}</span>}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
          <a href={job.applyUrl} className="btn" style={{ ...GLASS_STYLES.interactive, flex: 1, textAlign: "center", padding: "10px 16px", borderRadius: 10, fontSize: 12, color: "#FFF", textDecoration: "none", fontWeight: 600, display: "block" }}>
            Apply Externally ↗
          </a>
          <button onClick={() => setSaved(!saved)} aria-label="Save job" style={{ ...GLASS_STYLES.interactive, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, cursor: "pointer", color: saved ? accent : "rgba(255,255,255,0.4)", fontSize: 16 }}>
            {saved ? "★" : "☆"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CredentialCard({ cred, accent }: { cred: CredentialBody; accent: string }) {
  return (
    <div className="cred-card" style={{ ...GLASS_STYLES.container, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 14px", borderRadius: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 4 }}>
        {cred.logoImg ? (
          <img src={cred.logoImg} alt={cred.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => {
            // Fallback back to text display if the image cannot look up cleanly
            (e.target as HTMLElement).style.display = 'none';
            const fallback = document.getElementById(`fallback-${cred.name}`);
            if (fallback) fallback.style.display = 'block';
          }} />
        ) : null}
        <span id={`fallback-${cred.name}`} style={{ display: cred.logoImg ? "none" : "block", fontFamily: "Inter", fontSize: 13, fontWeight: 800, color: accent }}>{cred.name}</span>
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", textAlign: "center", margin: 0, lineHeight: 1.3 }}>{cred.label}</p>
    </div>
  );
}

function ProfBodyCard({ u, accent }: { u: BodyUpdate; accent: string }) {
  const isIcag = u.id === "icag";

  return (
    <div className="body-card" style={{ ...GLASS_STYLES.container, display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden", position: "relative" }}>
      {isIcag ? <FlagBar /> : <div style={{ height: 3, background: u.featured ? accent : "rgba(255,255,255,0.1)" }} />}
      <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
            <img src={u.logo} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} />
            {u.body}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, background: isIcag ? `${accent}25` : "rgba(255,255,255,0.06)", color: isIcag ? "#FFF" : "rgba(255,255,255,0.6)", border: `1px solid ${isIcag ? accent : "rgba(255,255,255,0.1)"}` }}>
            {u.tag}
          </span>
        </div>
        <h4 style={{ fontSize: 17, fontWeight: 700, color: "#FFF", margin: "0 0 12px 0", lineHeight: 1.4 }}>{u.title}</h4>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 24px 0", flex: 1 }}>{u.description}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "auto", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          <span>{u.timestamp}</span>
          <span style={{ color: accent, fontWeight: 600, cursor: "pointer" }}>View Gazette →</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PRIMARY INDEPENDENT PAGE DOMAINS
══════════════════════════════════════════════════════════════════════════ */

/* ── DOMAIN A: ENTERPRISE ECOSYSTEM INDEX (HOME / PLATFORM HUB) ── */
function HomePage({ activeCategory, onCategoryChange }: { activeCategory: string; onCategoryChange: (c: string) => void }) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter(job => {
      const matchesCategory = activeCategory === "All" || job.category === activeCategory;
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="page-enter">
      <PageHero meshKey="home" minHeight={600}>
        <div className="page-wrap" style={{ padding: "64px 24px", display: "grid", gridTemplateColumns: "1fr 420px", gap: 48, alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
          <div>
            <div style={{ ...GLASS_STYLES.interactive, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 30, marginBottom: 24, background: "rgba(10,121,164,0.25)" }}>
              <span style={{ width: 6, height: 6, background: "#0A79A4", borderRadius: "50%", boxShadow: "0 0 8px #0A79A4" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#FFF", letterSpacing: "0.06em" }}>GHANA WORKPLACE ARCHITECTURE</span>
            </div>
            <h1 style={{ fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 900, color: "#FFF", lineHeight: 1.1, letterSpacing: "-1px", margin: "0 0 24px 0" }}>
              Connecting Ghana's <span style={{ color: "#0A79A4" }}>Professional</span> Infrastructure.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: 520, margin: "0 0 36px 0" }}>
              The premium corporate identity directory and automated job tracking engine for authorized professional bodies in West Africa.
            </p>

            <div style={{ ...GLASS_STYLES.container, display: "flex", padding: 8, maxWidth: 500, alignItems: "center", gap: 8, marginBottom: 44, borderRadius: 14 }}>
              <div style={{ paddingLeft: 12, color: "rgba(255,255,255,0.6)" }}><SearchIcon /></div>
              <input type="text" placeholder="Filter by system role, title, or enterprise entity..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", color: "#FFF", fontSize: 14, padding: "8px 4px", outline: "none" }} />
            </div>

            <div style={{ display: "flex", gap: 40, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 28 }}>
              {[["25K+", "Active Filings"], ["8K+", "Corporate Entities"], ["120K+", "Identities"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <p style={{ fontSize: 26, fontWeight: 900, color: "#FFF", margin: 0 }}>{val}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "4px 0 0 0", fontWeight: 600 }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...GLASS_STYLES.container, borderRadius: 24, padding: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#FFF", margin: 0, letterSpacing: "0.03em" }}>LIVE INFRASTRUCTURE BOARD</h3>
              <span style={{ fontSize: 10, color: "#219777", background: "rgba(33,151,119,0.2)", border: "1px solid rgba(33,151,119,0.4)", padding: "3px 10px", borderRadius: 6, fontWeight: 700 }}>TELEMETRY ONLINE</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MOCK_JOBS.slice(0, 4).map((j, idx) => (
                <div key={j.id} style={{ ...GLASS_STYLES.interactive, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#FFF", margin: 0 }}>{j.title}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "2px 0 0 0" }}>{j.company}</p>
                  </div>
                  <VerifiedPip accent={ACCENTS[idx % 3]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageHero>

      <section className="page-wrap" style={{ padding: "40px 24px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#FFF", marginBottom: 18, letterSpacing: "0.02em" }}>OPERATIONAL MATRICES</h3>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 14, width: "100%" }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button key={cat} onClick={() => onCategoryChange(cat)} style={{ padding: "12px 22px", borderRadius: 12, border: isActive ? "1px solid #0A79A4" : "1px solid rgba(255,255,255,0.1)", background: isActive ? "rgba(10,121,164,0.3)" : "rgba(255,255,255,0.04)", color: isActive ? "#FFF" : "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      <section className="page-wrap" style={{ padding: "20px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Showing {filteredJobs.length} active deployment paths</span>
        </div>
        {filteredJobs.length === 0 ? (
          <div style={{ ...GLASS_STYLES.container, padding: 80, textAlign: "center", borderRadius: 24, color: "rgba(255,255,255,0.4)" }}>
            No operational entities match the current structural glass filters.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 24 }}>
            {filteredJobs.map((job, idx) => (
              <JobCard key={job.id} job={job} accent={ACCENTS[idx % 3]} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── DOMAIN B: VERIFIED ROSTER ARCHITECTURE (PROFESSIONALS / LEDGER) ── */
function ProfessionalsPage() {
  const [profileSearch, setProfileSearch] = useState<string>("");

  const filteredProfessionals = useMemo(() => {
    return PROFESSIONALS.filter(p => p.name.toLowerCase().includes(profileSearch.toLowerCase()) || p.title.toLowerCase().includes(profileSearch.toLowerCase()));
  }, [profileSearch]);

  return (
    <div className="page-enter">
      <PageHero meshKey="professionals" minHeight={360}>
        <div className="page-wrap" style={{ padding: "56px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#FFF", margin: "0 0 14px 0", letterSpacing: "-1px" }}>Verified Practitioner Ledger</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", maxWidth: 620, margin: "0 0 28px 0", lineHeight: 1.6 }}>
            Comprehensive tracking directory of state-verified financial advisors, chartered auditing bodies, healthcare specialists, and software practitioners.
          </p>
          <div style={{ ...GLASS_STYLES.container, borderRadius: 12, padding: "6px 14px", maxWidth: 420, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}><SearchIcon /></span>
            <input type="text" placeholder="Lookup practitioner or registry serial..." value={profileSearch} onChange={(e) => setProfileSearch(e.target.value)} style={{ background: "transparent", border: "none", color: "#FFF", fontSize: 14, padding: "8px 0", width: "100%", outline: "none" }} />
          </div>
        </div>
      </PageHero>

      <section className="page-wrap" style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 24 }}>
          {filteredProfessionals.map((p) => {
            const ac = ACCENTS[p.accentKey];
            return (
              <div key={p.name} style={{ ...GLASS_STYLES.container, borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 3, background: ac }} />
                <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                    
                    {/* Component now pulls from your custom folder paths smoothly */}
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `1px solid ${ac}40`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {p.avatarImg ? (
                        <img src={p.avatarImg} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => {
                          // Clean textual fallback if a local asset file goes missing
                          (e.target as HTMLElement).style.display = 'none';
                          const labelEl = document.getElementById(`avatar-txt-${p.name}`);
                          if (labelEl) labelEl.style.display = 'block';
                        }} />
                      ) : null}
                      <span id={`avatar-txt-${p.name}`} style={{ display: p.avatarImg ? "none" : "block", color: ac, fontWeight: 800, fontSize: 14 }}>{p.avatarSeed}</span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "#FFF", margin: 0 }}>{p.name}</h4>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2, margin: 0 }}>{p.location}</p>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", margin: "0 0 6px 0", fontWeight: 500, lineHeight: 1.45 }}>{p.title}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: ac, margin: "0 0 18px 0" }}>{p.credential}</p>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24, marginTop: "auto" }}>
                    {p.skills.map(s => (
                      <span key={s} style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", padding: "4px 10px", borderRadius: 6 }}>{s}</span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    <span><b>{p.connections}</b> connections</span>
                    <button style={{ ...GLASS_STYLES.interactive, padding: "6px 14px", borderRadius: 8, color: "#FFF", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" }}>Connect</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="page-wrap" style={{ padding: "0 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#FFF", marginBottom: 24, letterSpacing: "0.02em" }}>GOVERNING PROFESSIONAL GAZETTES</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 24 }}>
          {BODY_UPDATES.map((update, idx) => (
            <ProfBodyCard key={update.id} u={update} accent={ACCENTS[idx % 3]} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── DOMAIN C: INDUSTRIAL INTELLIGENCE STREAM (FEED) ── */
function FeedPage() {
  const [likesState, setLikesState] = useState<Record<string, number>>({});

  const handleLike = (title: string) => {
    setLikesState(prev => ({ ...prev, [title]: (prev[title] || 0) + 1 }));
  };

  return (
    <div className="page-enter">
      <PageHero meshKey="feed" minHeight={300}>
        <div className="page-wrap" style={{ padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#FFF", margin: 0, letterSpacing: "-1px" }}>Industrial Intelligence Flow</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 10, maxWidth: 520, lineHeight: 1.5 }}>
            Industry diagnostics, corporate tax advisory streams, and governance updates.
          </p>
        </div>
      </PageHero>

      <section className="page-wrap" style={{ padding: "40px 24px 80px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {FEED_POSTS.map((post, idx) => {
            const ac = ACCENTS[idx % 3];
            const currentLikes = post.likes + (likesState[post.title] || 0);

            return (
              <article key={post.title} style={{ ...GLASS_STYLES.container, borderRadius: 20, overflow: "hidden" }}>
                <div style={{ padding: 26 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#FFF", background: `${ac}50`, border: `1px solid ${ac}`, padding: "4px 10px", borderRadius: 6 }}>{post.category}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>By {post.author}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: "#FFF", margin: "0 0 12px 0", lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 24px 0" }}>{post.body}</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 13 }}>
                    <button onClick={() => handleLike(post.title)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8 }}>
                      👍 <span style={{ color: "#FFF", fontWeight: 700 }}>{currentLikes}</span>
                    </button>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>📢 {post.shares} Shares</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Right Sidebar Dashboard Grid */}
        <div>
          <div style={{ ...GLASS_STYLES.container, borderRadius: 24, padding: 24, position: "sticky", top: 100 }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: "#FFF", margin: "0 0 18px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>RECOGNIZED FRAMEWORKS</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {CREDENTIALS.map((cred, i) => (
                <CredentialCard key={cred.name} cred={cred} accent={ACCENTS[i % 3]} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT CENTRAL ENGINE RUNTIME EXPORT
══════════════════════════════════════════════════════════════════════════ */
export default function LinkGH() {
  const [page, setPage] = useState<Page>("home");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const executeSystemNavigation = (destination: Page) => {
    setPage(destination);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#04070D", color: "#FFF", display: "flex", flexDirection: "column", fontFamily: "var(--font-body, system-ui, -apple-system, sans-serif)" }}>
      
      <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(4, 7, 13, 0.65)", backdropFilter: "blur(24px) saturate(140%)", WebkitBackdropFilter: "blur(24px) saturate(140%)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <GlowBar />
        <div className="page-wrap" style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 auto", padding: "0 24px", maxWidth: 1200 }}>
          
          <div style={{ display: "flex", alignItems: "baseline", cursor: "pointer", userSelect: "none" }} onClick={() => executeSystemNavigation("home")}>
            <span style={{ fontFamily: "Inter", fontSize: 22, fontWeight: 900, color: "#FFF", letterSpacing: "-0.5px" }}>Link</span>
            <span style={{ fontFamily: "Inter", fontSize: 22, fontWeight: 900, color: "#0A79A4", letterSpacing: "-0.5px" }}>GH</span>
          </div>

          <nav style={{ display: "flex", background: "rgba(255, 255, 255, 0.05)", padding: 4, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
            {([["home", "Platform Hub"], ["professionals", "Verified Ledger"], ["feed", "Intelligence Stream"]] as const).map(([key, label]) => {
              const isSelected = page === key;
              return (
                <button key={key} onClick={() => executeSystemNavigation(key)} style={{ padding: "8px 20px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: isSelected ? "#0A79A4" : "transparent", color: isSelected ? "#FFF" : "rgba(255,255,255,0.6)" }}>
                  {label}
                </button>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#FFF", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign In</button>
            <button style={{ background: "#0A79A4", border: "none", color: "#FFF", padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Join System</button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {page === "home" && <HomePage activeCategory={activeCategory} onCategoryChange={setActiveCategory} />}
        {page === "professionals" && <ProfessionalsPage />}
        {page === "feed" && <FeedPage />}
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(4,7,13,0.95)", backdropFilter: "blur(12px)", padding: "32px 0" }}>
        <div className="page-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto", padding: "0 24px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, color: "#FFF" }}>LinkGH</span>
            <span>by OrbitLinked Architecture Engine</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <span>Infrastructure Policies</span>
            <span>Terms of Registry</span>
            <span>© {new Date().getFullYear()} OrbitLinked.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}