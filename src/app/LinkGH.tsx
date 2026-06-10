"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── API job shape (matches worker response) ───────────────────────────── */
interface ApiJob {
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
  postedAt: string;
}

/* ─── fetch helpers ─────────────────────────────────────────────────────── */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://linkgh.com/api";

async function fetchJobs(category: string, page = 1): Promise<{ jobs: ApiJob[]; total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (category && category !== "All") params.set("category", category);
  const res = await fetch(`${API_BASE}/jobs?${params}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return { jobs: data.jobs ?? [], total: data.total ?? 0 };
}

async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/jobs/categories`);
  if (!res.ok) return {};
  const data = await res.json();
  const map: Record<string, number> = {};
  for (const { category, count } of data.categories ?? []) map[category] = count;
  return map;
}


/* ─── colour tokens ─────────────────────────────────────────────────────── */
const C = {
  bg:           "#0B0F1A",
  surface:      "rgba(14,20,34,0.85)",
  surfaceSolid: "#0E1422",
  border:       "rgba(255,255,255,0.07)",
  cyan:         "#0A79A4",
  cyanDim:      "rgba(10,121,164,0.12)",
  cyanBorder:   "rgba(10,121,164,0.28)",
  purple:       "#7367AF",
  purpleDim:    "rgba(115,103,175,0.12)",
  purpleBorder: "rgba(115,103,175,0.28)",
  teal:         "#219777",
  tealDim:      "rgba(33,151,119,0.12)",
  tealBorder:   "rgba(33,151,119,0.28)",
  text:         "#E2E8F0",
  textSub:      "#94A3B8",
  textMuted:    "#475569",
  textDark:     "#1E293B",
} as const;

const ACCENTS = [C.cyan, C.purple, C.teal] as const;

type Page = "home" | "professionals" | "feed";

/* ─── data ───────────────────────────────────────────────────────────────── */
const categories = [
  "Accounting","Finance","Banking","Bookkeeping","Audit","Tax",
  "Administration","Customer Service","Sales & Marketing","Technology",
  "Healthcare","Engineering","Education","NGO","Government",
  "Logistics","Hospitality","Remote Jobs","Other Jobs",
];


const professionals = [
  { name:"Charles Ofosu Obese", title:"Chartered Accountant & Finance Professional", credential:"ICAG · MBA Accounting",   connections:312, accent:C.cyan   },
  { name:"Akosua Mensah",       title:"Tax Consultant",                              credential:"CIT Ghana · VAT · PAYE",   connections:187, accent:C.purple },
  { name:"Kojo Boateng",        title:"Internal Auditor",                            credential:"CIA · Risk · Controls",    connections:241, accent:C.teal   },
  { name:"Ama Owusu",           title:"HR Business Partner",                         credential:"SHRM · Talent Management", connections:159, accent:C.cyan   },
];

const professionalBodyUpdates = [
  { id:"icag", body:"ICAG Ghana",              logo:"/logos/icag.png",  featured:true,  tag:"Official Update",  title:"New CPD Requirements",                      description:"Updated CPD framework and compliance timeline for all chartered members — effective next quarter." },
  { id:"cit",  body:"CIT Ghana",               logo:"/logos/cit.png",   featured:false, tag:"Industry Insight", title:"Annual Tax Conference Key Takeaways",         description:"Upcoming adjustments to local corporate tax models and filing practices for the next fiscal year." },
  { id:"cia",  body:"IIA / CIA",               logo:"/logos/cia.png",   featured:false, tag:"Standards Update", title:"Internal Audit Excellence Standards",         description:"New global internal audit standards framework rollout and implementation guidelines." },
  { id:"acca", body:"ACCA",                    logo:"/logos/acca.png",  featured:false, tag:"Global Report",    title:"Global Talent Trends Report",                 description:"Changing professional demands, equity expectations, and technological transformation." },
  { id:"mtn",  body:"MTN Ghana",               logo:"/logos/mtn.png",   featured:false, tag:"Careers",          title:"Professional Careers Update",                 description:"Expanding specialised technical roles and development tracks within enterprise infrastructure." },
  { id:"gra",  body:"Ghana Revenue Authority", logo:"/logos/gra.png",   featured:false, tag:"Compliance",       title:"Integrated Tax Management System Advisory",   description:"System maintenance and critical user verification requirements for compliant filings." },
];

const feedPosts = [
  { category:"Career Advice",       title:"How Ghana professionals can improve recruiter visibility",  body:"Practical steps to optimise your profile so hiring managers find you first — from headline to endorsements.",           readTime:"4 min read" },
  { category:"Trust & Credentials", title:"Why verified credentials matter for trusted hiring",        body:"Platforms and employers across Ghana are tightening credential checks. Here is what that means for your career.",         readTime:"3 min read" },
  { category:"Market Trends",       title:"Finance, healthcare, and tech roles are growing fast",      body:"The latest hiring data shows strong demand across Accra and Kumasi — and which skills command premiums.",               readTime:"5 min read" },
];

const credentials = [
  { name:"ICAG",  label:"ICAG Ghana",           logo:"/logos/icag.png",  domain:"icagh.com"      },
  { name:"CIT",   label:"CIT Ghana",             logo:"/logos/cit.png",   domain:"citghana.org"   },
  { name:"ACCA",  label:"ACCA Global",           logo:null,               domain:"accaglobal.com" },
  { name:"CIMA",  label:"CIMA",                  logo:null,               domain:"cimaglobal.com" },
  { name:"CPA",   label:"CPA / AICPA",           logo:null,               domain:"aicpa-cima.com" },
  { name:"ICAEW", label:"ICAEW",                 logo:null,               domain:"icaew.com"      },
  { name:"IIA",   label:"IIA / CIA",             logo:"/logos/cia.png",   domain:"theiia.org"     },
  { name:"GBA",   label:"Ghana Bar Assoc.",      logo:null,               domain:null             },
  { name:"NMC",   label:"Nursing & Midwifery",   logo:null,               domain:"nmc.org.uk"     },
  { name:"GhIE",  label:"Ghana Inst. Engineers", logo:null,               domain:null             },
  { name:"SHRM",  label:"SHRM",                  logo:null,               domain:"shrm.org"       },
  { name:"+",     label:"Other bodies",          logo:null,               domain:null             },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

/* ─── GlowBar ────────────────────────────────────────────────────────────── */
function GlowBar() {
  return (
    <div aria-hidden="true" style={{ display:"flex", height:2, width:"100%", flexShrink:0 }}>
      <div style={{ flex:1, background:C.cyan }} />
      <div style={{ flex:1, background:C.purple }} />
      <div style={{ flex:1, background:C.teal }} />
    </div>
  );
}

/* ─── GhanaFlagBar (ICAG special accent) ────────────────────────────────── */
function GhanaFlagBar() {
  return (
    <div aria-hidden="true" style={{ display:"flex", height:3, width:"100%", flexShrink:0 }}>
      <div style={{ flex:1, background:"#CE1126" }} />
      <div style={{ flex:1, background:"#FCD116" }} />
      <div style={{ flex:1, background:"#006B3F" }} />
    </div>
  );
}

/* ─── VerifiedPip ────────────────────────────────────────────────────────── */
function VerifiedPip({ accent = C.teal }: { accent?: string }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" as const,
      color:accent, background:`${accent}18`, border:`1px solid ${accent}35`,
      borderRadius:4, padding:"2px 7px",
    }}>
      <span aria-hidden="true" style={{ width:5, height:5, borderRadius:"50%", background:accent, flexShrink:0 }} />
      Verified
    </span>
  );
}

/* ─── SectionEyebrow ─────────────────────────────────────────────────────── */
function SectionEyebrow({ label, accent }: { label: string; accent: string }) {
  return (
    <p style={{
      fontSize:11, fontWeight:700, letterSpacing:"0.10em",
      textTransform:"uppercase" as const, color:accent, marginBottom:6,
    }}>
      {label}
    </p>
  );
}

/* ─── cinematic mesh backgrounds — zero file dependency ─────────────────── */
const MESHES = {
  home: `
    <svg xmlns='http://www.w3.org/2000/svg' width='1440' height='600'>
      <defs>
        <radialGradient id='a' cx='30%' cy='60%' r='60%'>
          <stop offset='0%' stop-color='#0A79A4' stop-opacity='0.38'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
        <radialGradient id='b' cx='80%' cy='30%' r='50%'>
          <stop offset='0%' stop-color='#219777' stop-opacity='0.22'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
        <radialGradient id='c' cx='55%' cy='80%' r='45%'>
          <stop offset='0%' stop-color='#7367AF' stop-opacity='0.18'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
      </defs>
      <rect width='1440' height='600' fill='#070B15'/>
      <rect width='1440' height='600' fill='url(#a)'/>
      <rect width='1440' height='600' fill='url(#b)'/>
      <rect width='1440' height='600' fill='url(#c)'/>
      <line x1='0' y1='200' x2='1440' y2='180' stroke='#0A79A4' stroke-opacity='0.06' stroke-width='1'/>
      <line x1='0' y1='350' x2='1440' y2='320' stroke='#219777' stroke-opacity='0.05' stroke-width='1'/>
      <line x1='200' y1='0' x2='180' y2='600' stroke='#7367AF' stroke-opacity='0.05' stroke-width='1'/>
      <line x1='900' y1='0' x2='920' y2='600' stroke='#0A79A4' stroke-opacity='0.04' stroke-width='1'/>
      <circle cx='260' cy='320' r='180' fill='none' stroke='#0A79A4' stroke-opacity='0.07' stroke-width='1'/>
      <circle cx='1100' cy='200' r='220' fill='none' stroke='#219777' stroke-opacity='0.06' stroke-width='1'/>
      <circle cx='700' cy='500' r='140' fill='none' stroke='#7367AF' stroke-opacity='0.06' stroke-width='1'/>
      <rect x='60' y='60' width='1' height='80' fill='#0A79A4' fill-opacity='0.25'/>
      <rect x='120' y='80' width='1' height='60' fill='#0A79A4' fill-opacity='0.18'/>
      <rect x='180' y='40' width='1' height='100' fill='#0A79A4' fill-opacity='0.20'/>
      <rect x='240' y='70' width='1' height='70' fill='#219777' fill-opacity='0.18'/>
      <rect x='300' y='50' width='1' height='90' fill='#219777' fill-opacity='0.15'/>
      <rect x='1100' y='50' width='1' height='120' fill='#7367AF' fill-opacity='0.22'/>
      <rect x='1160' y='30' width='1' height='90' fill='#7367AF' fill-opacity='0.18'/>
      <rect x='1220' y='65' width='1' height='110' fill='#0A79A4' fill-opacity='0.20'/>
      <rect x='1300' y='45' width='1' height='80' fill='#219777' fill-opacity='0.15'/>
    </svg>`,
  professionals: `
    <svg xmlns='http://www.w3.org/2000/svg' width='1440' height='420'>
      <defs>
        <radialGradient id='pa' cx='20%' cy='50%' r='55%'>
          <stop offset='0%' stop-color='#7367AF' stop-opacity='0.35'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
        <radialGradient id='pb' cx='75%' cy='40%' r='50%'>
          <stop offset='0%' stop-color='#0A79A4' stop-opacity='0.28'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
        <radialGradient id='pc' cx='50%' cy='90%' r='40%'>
          <stop offset='0%' stop-color='#219777' stop-opacity='0.20'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
      </defs>
      <rect width='1440' height='420' fill='#070B15'/>
      <rect width='1440' height='420' fill='url(#pa)'/>
      <rect width='1440' height='420' fill='url(#pb)'/>
      <rect width='1440' height='420' fill='url(#pc)'/>
      <circle cx='150' cy='210' r='130' fill='none' stroke='#7367AF' stroke-opacity='0.10' stroke-width='1'/>
      <circle cx='150' cy='210' r='80' fill='none' stroke='#7367AF' stroke-opacity='0.08' stroke-width='1'/>
      <circle cx='1200' cy='180' r='160' fill='none' stroke='#0A79A4' stroke-opacity='0.08' stroke-width='1'/>
      <circle cx='700' cy='380' r='200' fill='none' stroke='#219777' stroke-opacity='0.06' stroke-width='1'/>
      <line x1='0' y1='140' x2='1440' y2='110' stroke='#7367AF' stroke-opacity='0.06' stroke-width='1'/>
      <line x1='0' y1='280' x2='1440' y2='260' stroke='#0A79A4' stroke-opacity='0.05' stroke-width='1'/>
    </svg>`,
  feed: `
    <svg xmlns='http://www.w3.org/2000/svg' width='1440' height='360'>
      <defs>
        <radialGradient id='fa' cx='60%' cy='40%' r='55%'>
          <stop offset='0%' stop-color='#0A79A4' stop-opacity='0.30'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
        <radialGradient id='fb' cx='20%' cy='60%' r='45%'>
          <stop offset='0%' stop-color='#219777' stop-opacity='0.22'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
        <radialGradient id='fc' cx='85%' cy='70%' r='40%'>
          <stop offset='0%' stop-color='#7367AF' stop-opacity='0.18'/>
          <stop offset='100%' stop-color='#060912' stop-opacity='0'/>
        </radialGradient>
      </defs>
      <rect width='1440' height='360' fill='#070B15'/>
      <rect width='1440' height='360' fill='url(#fa)'/>
      <rect width='1440' height='360' fill='url(#fb)'/>
      <rect width='1440' height='360' fill='url(#fc)'/>
      <line x1='0' y1='80' x2='1440' y2='60' stroke='#0A79A4' stroke-opacity='0.07' stroke-width='1'/>
      <line x1='0' y1='200' x2='1440' y2='180' stroke='#219777' stroke-opacity='0.05' stroke-width='1'/>
      <line x1='0' y1='300' x2='1440' y2='280' stroke='#7367AF' stroke-opacity='0.05' stroke-width='1'/>
      <line x1='380' y1='0' x2='360' y2='360' stroke='#0A79A4' stroke-opacity='0.04' stroke-width='1'/>
      <line x1='960' y1='0' x2='980' y2='360' stroke='#219777' stroke-opacity='0.04' stroke-width='1'/>
      <circle cx='800' cy='150' r='200' fill='none' stroke='#0A79A4' stroke-opacity='0.06' stroke-width='1'/>
      <circle cx='300' cy='280' r='150' fill='none' stroke='#219777' stroke-opacity='0.05' stroke-width='1'/>
    </svg>`,
} as const;

type MeshKey = keyof typeof MESHES;

function svgToDataUrl(svg: string) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.trim());
}

/* ─── PageHero — cinematic background with SVG mesh + optional photo ──── */
function PageHero({
  image,
  meshKey,
  children,
  minHeight = 520,
}: {
  image: string;
  meshKey: MeshKey;
  children: React.ReactNode;
  minHeight?: number;
}) {
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div style={{ position:"relative", overflow:"hidden", minHeight }}>
      {/* SVG mesh — always visible immediately */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:`url("${svgToDataUrl(MESHES[meshKey])}")`,
        backgroundSize:"cover",
        backgroundPosition:"center",
        zIndex:0,
      }} aria-hidden="true" />

      {/* real photo layer — fades in once loaded, invisible if missing */}
      {!photoFailed && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          onLoad={() => setPhotoLoaded(true)}
          onError={() => setPhotoFailed(true)}
          style={{
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover",
            objectPosition:"center 30%",
            filter:"blur(2px) brightness(0.28) saturate(0.65)",
            transform:"scale(1.05)",
            opacity: photoLoaded ? 1 : 0,
            transition:"opacity 0.8s ease",
            zIndex:1,
          }}
        />
      )}

      {/* vignette overlay */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(to bottom, rgba(6,9,18,0.30) 0%, rgba(6,9,18,0.05) 35%, rgba(6,9,18,0.65) 80%, #0B0F1A 100%)",
        zIndex:2,
      }} aria-hidden="true" />

      {/* content */}
      <div style={{ position:"relative", zIndex:3 }}>
        {children}
      </div>
    </div>
  );
}

/* ─── GlassPanel — frosted glass card wrapper ───────────────────────────── */
function GlassPanel({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background:"rgba(14,20,34,0.72)",
      backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      border:"1px solid rgba(255,255,255,0.10)",
      borderRadius:20,
      overflow:"hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── JobCard — driven by real API data ──────────────────────────────────── */
function JobCard({ job, accent }: { job: ApiJob; accent: string }) {
  const [saved, setSaved] = useState(false);
  const urgent = job.deadline
    ? (parseInt(job.deadline) <= 5 && job.deadline.includes("day"))
    : false;

  return (
    <div style={{
      minWidth:268, maxWidth:268,
      background:"rgba(14,20,34,0.90)",
      backdropFilter:"blur(12px)",
      WebkitBackdropFilter:"blur(12px)",
      border:`1px solid ${C.border}`,
      borderRadius:14, overflow:"hidden",
      display:"flex", flexDirection:"column",
      transition:"border-color 0.18s, transform 0.18s",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}40`;
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
    }}>
      <div style={{ height:2, background:accent }} />
      <div style={{ padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:12, flex:1 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:C.text, lineHeight:1.35, margin:0 }}>{job.title}</p>
            <p style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>{job.company}</p>
          </div>
          {job.isVerified && <VerifiedPip accent={accent} />}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <span style={{ fontSize:11, color:C.textSub }}>{job.location} · {job.jobType}</span>
          {job.salary && (
            <span style={{ fontSize:11, color:C.textMuted }}>{job.salary}</span>
          )}
          {job.deadline && (
            <span style={{ fontSize:11, fontWeight:600, color: urgent ? "#E05555" : C.textMuted }}>
              {job.deadline}
            </span>
          )}
        </div>
        <div style={{ marginTop:"auto", display:"flex", gap:6 }}>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex:1, padding:"7px 0", fontSize:12, fontWeight:600,
              color:C.text, background:"rgba(255,255,255,0.05)",
              border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer",
              textDecoration:"none", display:"flex", alignItems:"center",
              justifyContent:"center", transition:"background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${accent}14`; (e.currentTarget as HTMLAnchorElement).style.borderColor = `${accent}40`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border; }}
          >
            View job ↗
          </a>
          <button onClick={() => setSaved(!saved)}
            aria-label={saved ? "Unsave job" : "Save job"}
            style={{
              width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center",
              background: saved ? `${accent}18` : "rgba(255,255,255,0.04)",
              border:`1px solid ${saved ? `${accent}40` : C.border}`,
              borderRadius:8, cursor:"pointer", transition:"all 0.15s",
              fontSize:14, color: saved ? accent : C.textMuted, flexShrink:0,
            }}>
            {saved ? "★" : "☆"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CredentialCard ─────────────────────────────────────────────────────── */
function CredentialCard({ cred, accent }: { cred: typeof credentials[0]; accent: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  const logoSrc = cred.logo
    ? cred.logo
    : cred.domain
    ? `https://logo.clearbit.com/${cred.domain}?size=96`
    : null;

  return (
    <div style={{
      background:"rgba(255,255,255,0.03)",
      backdropFilter:"blur(8px)",
      WebkitBackdropFilter:"blur(8px)",
      border:`1px solid ${C.border}`,
      borderRadius:12, padding:"16px 10px",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", gap:10, minHeight:96, cursor:"default",
      transition:"border-color 0.18s, transform 0.18s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}45`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
      {logoSrc && !imgFailed ? (
        <img src={logoSrc} alt={`${cred.label} logo`} width={48} height={32}
          onError={() => setImgFailed(true)}
          style={{ width:48, height:32, objectFit:"contain" as const, filter:"brightness(0.95) saturate(0.85)", transition:"filter 0.15s" }} />
      ) : (
        <div style={{
          width:48, height:32, display:"flex", alignItems:"center", justifyContent:"center",
          background:`${accent}15`, border:`1px solid ${accent}35`, borderRadius:6,
          fontFamily:"Inter, system-ui, sans-serif", fontSize:11, fontWeight:800,
          letterSpacing:"0.04em", color:accent,
        }}>
          {cred.name}
        </div>
      )}
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.04em", textAlign:"center" as const, lineHeight:1.3, color:C.textMuted }}>
        {cred.label}
      </p>
    </div>
  );
}

/* ─── ProfBodyCard ───────────────────────────────────────────────────────── */
function ProfBodyCard({ u, accent }: { u: typeof professionalBodyUpdates[0]; accent: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isIcag = u.id === "icag";

  return (
    <div style={{
      background: isIcag ? "rgba(14,20,34,0.92)" : "rgba(14,20,34,0.80)",
      backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      border:`1px solid ${isIcag ? `${accent}35` : C.border}`,
      borderRadius:16, overflow:"hidden",
      display:"flex", flexDirection:"column",
      transition:"transform 0.18s, border-color 0.18s",
      boxShadow: isIcag ? `0 0 0 1px ${accent}20` : "none",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; if (!isIcag) (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}28`; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; if (!isIcag) (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}>
      {/* top bar */}
      {isIcag ? <GhanaFlagBar /> : <div style={{ height:2, background: u.featured ? accent : "rgba(255,255,255,0.06)" }} />}

      <div style={{ padding:"20px 22px 22px", flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          {/* logo */}
          <div style={{
            width:44, height:44, borderRadius:10,
            background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            overflow:"hidden", flexShrink:0,
          }}>
            {!imgFailed ? (
              <img src={u.logo} alt={`${u.body} logo`} width={30} height={30}
                onError={() => setImgFailed(true)}
                style={{ width:30, height:30, objectFit:"contain" as const, filter:"brightness(1.05) saturate(0.9)" }} />
            ) : (
              <span style={{ fontFamily:"Inter", fontSize:10, fontWeight:800, color:accent }}>
                {u.body.split(" ")[0].slice(0, 4).toUpperCase()}
              </span>
            )}
          </div>
          {/* tag */}
          <span style={{
            fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" as const,
            padding:"3px 9px", borderRadius:5,
            background: isIcag ? `${accent}14` : "rgba(255,255,255,0.04)",
            color: isIcag ? accent : C.textMuted,
            border:`1px solid ${isIcag ? `${accent}30` : C.border}`,
          }}>
            {u.tag}
          </span>
        </div>

        <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" as const, color:C.textDark, marginBottom:6 }}>{u.body}</p>
        <h3 style={{ fontFamily:"Inter", fontSize:15, fontWeight:700, color:"#DDE4EF", lineHeight:1.35, marginBottom:10 }}>{u.title}</h3>
        <p style={{ fontSize:13, color:C.textMuted, lineHeight:1.65, flex:1 }}>{u.description}</p>

        <div style={{ marginTop:18, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
          <button style={{
            fontSize:12, fontWeight:600, color: isIcag ? accent : C.textMuted,
            background:"none", border:"none", cursor:"pointer", padding:0, transition:"color 0.15s",
          }}
          onMouseEnter={e => (e.target as HTMLButtonElement).style.color = C.text}
          onMouseLeave={e => (e.target as HTMLButtonElement).style.color = isIcag ? accent : C.textMuted}>
            Read announcement →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [activeCategory, setActiveCategory] = useState("All");

  /* ── live jobs state ── */
  const [jobs,            setJobs]           = useState<ApiJob[]>([]);
  const [jobsTotal,       setJobsTotal]      = useState(0);
  const [jobsPage,        setJobsPage]       = useState(1);
  const [jobsLoading,     setJobsLoading]    = useState(false);
  const [jobsError,       setJobsError]      = useState<string | null>(null);
  const [categoryCounts,  setCategoryCounts] = useState<Record<string, number>>({});

  /* fetch category counts once on mount */
  useEffect(() => {
    fetchCategoryCounts()
      .then(setCategoryCounts)
      .catch(() => {});
  }, []);

  /* fetch jobs when category or page changes */
  const loadJobs = useCallback(async (cat: string, pg: number) => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const { jobs: fetched, total } = await fetchJobs(cat, pg);
      setJobs(fetched);
      setJobsTotal(total);
    } catch {
      setJobsError("Could not load jobs right now. Please try again shortly.");
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (page === "home") loadJobs(activeCategory, jobsPage);
  }, [page, activeCategory, jobsPage, loadJobs]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setJobsPage(1);
  };

  const navLinks: [Page, string][] = [
    ["home", "Home"],
    ["professionals", "Professionals"],
    ["feed", "News Feed"],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #0B0F1A;
          color: #E2E8F0;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }
        ::selection { background: rgba(10,121,164,0.30); color: #fff; }
        .lgh-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .lgh-scroll::-webkit-scrollbar { display: none; }
        h1, h2, h3, h4 { font-family: 'Inter', system-ui, sans-serif; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition-duration: 0.01ms !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      <main style={{ minHeight:"100vh", background:C.bg }}>

        {/* ══ NAV ═══════════════════════════════════════════════════════════ */}
        <header style={{
          position:"sticky", top:0, zIndex:100,
          background:"rgba(11,15,26,0.88)",
          backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
          borderBottom:"1px solid rgba(255,255,255,0.06)",
        }}>
          <GlowBar />
          <div style={{
            maxWidth:1240, margin:"0 auto", padding:"0 24px",
            height:58, display:"flex", alignItems:"center",
            justifyContent:"space-between", gap:24,
          }}>
            <button onClick={() => setPage("home")} aria-label="LinkGH home"
              style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"baseline" }}>
              <span style={{ fontFamily:"Inter", fontSize:20, fontWeight:900, letterSpacing:"-0.5px", color:C.text }}>Link</span>
              <span style={{ fontFamily:"Inter", fontSize:20, fontWeight:900, letterSpacing:"-0.5px", color:C.cyan }}>GH</span>
            </button>

            <nav style={{ display:"flex", gap:2 }} aria-label="Main navigation">
              {navLinks.map(([key, label]) => (
                <button key={key} onClick={() => setPage(key)}
                  aria-current={page === key ? "page" : undefined}
                  style={{
                    fontSize:14, fontWeight:500, padding:"6px 14px", borderRadius:8,
                    border:"none", cursor:"pointer",
                    background: page === key ? `${C.cyan}14` : "transparent",
                    color: page === key ? C.cyan : C.textSub,
                    transition:"color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => { if (page !== key) { (e.target as HTMLButtonElement).style.color = C.text; (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}}
                  onMouseLeave={e => { if (page !== key) { (e.target as HTMLButtonElement).style.color = C.textSub; (e.target as HTMLButtonElement).style.background = "transparent"; }}}>
                  {label}
                </button>
              ))}
            </nav>

            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button style={{
                fontSize:13, fontWeight:600, padding:"7px 14px", borderRadius:8,
                border:`1px solid ${C.border}`, background:"transparent",
                color:C.textSub, cursor:"pointer", transition:"all 0.15s",
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = C.text; (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = C.textSub; (e.target as HTMLButtonElement).style.borderColor = C.border; }}>
                Sign in
              </button>
              <button style={{
                fontSize:13, fontWeight:700, padding:"7px 18px", borderRadius:8,
                border:`1px solid ${C.tealBorder}`, background:C.tealDim,
                color:C.teal, cursor:"pointer", transition:"all 0.15s", flexShrink:0,
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = `${C.teal}22`; (e.target as HTMLButtonElement).style.borderColor = `${C.teal}55`; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = C.tealDim; (e.target as HTMLButtonElement).style.borderColor = C.tealBorder; }}>
                Join LinkGH
              </button>
            </div>
          </div>
        </header>

        {/* ══ HOME ══════════════════════════════════════════════════════════ */}
        {page === "home" && (
          <div>
            {/* cinematic hero with background image */}
            <PageHero image="/backgrounds/home-jobs.jpg" meshKey="home" minHeight={560}>
              <section style={{ maxWidth:1240, margin:"0 auto", padding:"72px 24px 64px", display:"grid", gridTemplateColumns:"1fr 420px", gap:48, alignItems:"center" }}>
                {/* left — headline */}
                <div>
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:10, marginBottom:24,
                    background:"rgba(10,121,164,0.12)", border:`1px solid ${C.cyanBorder}`,
                    borderRadius:20, padding:"5px 14px",
                    backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                  }}>
                    <span aria-hidden="true" style={{ width:6, height:6, borderRadius:"50%", background:C.cyan, flexShrink:0 }} />
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:C.cyan }}>
                      Ghana's AI-Powered Professional Network
                    </span>
                  </div>

                  <h1 style={{
                    fontFamily:"Inter", fontSize:"clamp(36px,4.5vw,60px)",
                    fontWeight:900, lineHeight:1.08, letterSpacing:"-1.5px",
                    color:"#F0F6FF", marginBottom:20, maxWidth:520,
                    textShadow:"0 2px 20px rgba(0,0,0,0.6)",
                  }}>
                    Connecting Ghana's{" "}
                    <span style={{ color:C.cyan }}>professional</span>{" "}future.
                  </h1>

                  <p style={{ fontSize:16, lineHeight:1.75, color:"rgba(148,163,184,0.95)", maxWidth:440, marginBottom:32, textShadow:"0 1px 8px rgba(0,0,0,0.5)" }}>
                    Verified jobs, trusted companies, and powerful professional connections — built for the people building Ghana.
                  </p>

                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" as const }}>
                    <button style={{
                      fontSize:14, fontWeight:700, padding:"10px 26px", borderRadius:10,
                      border:`1px solid ${C.tealBorder}`, background:`${C.teal}22`,
                      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                      color:C.teal, cursor:"pointer", transition:"all 0.15s",
                    }}
                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = `${C.teal}35`; }}
                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = `${C.teal}22`; }}>
                      Find jobs
                    </button>
                    <button style={{
                      fontSize:14, fontWeight:600, padding:"10px 26px", borderRadius:10,
                      border:"1px solid rgba(255,255,255,0.18)",
                      background:"rgba(255,255,255,0.07)",
                      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
                      color:"#CBD5E1", cursor:"pointer", transition:"all 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}>
                      Create profile
                    </button>
                  </div>

                  {/* stats */}
                  <div style={{ marginTop:44, paddingTop:28, borderTop:"1px solid rgba(255,255,255,0.10)", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
                    {([
                      ["25K+","Verified jobs",C.cyan],
                      ["8K+","Companies",C.purple],
                      ["120K+","Professionals",C.teal],
                      ["99%","Trust rate",C.cyan],
                    ] as const).map(([val,lbl,ac],i) => (
                      <div key={lbl} style={{ paddingRight:i<3?20:0, paddingLeft:i>0?20:0, borderRight:i<3?"1px solid rgba(255,255,255,0.10)":"none" }}>
                        <p style={{ fontFamily:"Inter", fontSize:24, fontWeight:900, letterSpacing:"-0.5px", color:ac }}>{val}</p>
                        <p style={{ fontSize:11, color:"rgba(148,163,184,0.80)", marginTop:2, fontWeight:500 }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* right — glass live dashboard */}
                <GlassPanel>
                  <GlowBar />
                  <div style={{ padding:"20px 22px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
                      <div>
                        <p style={{ fontFamily:"Inter", fontSize:14, fontWeight:700, color:C.text }}>Live activity</p>
                        <p style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Verified jobs posted today</p>
                      </div>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600,
                        color:C.teal, background:C.tealDim, border:`1px solid ${C.tealBorder}`, borderRadius:6, padding:"3px 9px",
                      }}>
                        <span aria-hidden="true" style={{ width:6, height:6, borderRadius:"50%", background:C.teal }} />
                        Live
                      </span>
                    </div>

                    {([
                      ["Data Analyst","MTN Ghana","Technology",C.cyan],
                      ["Operations Manager","Zoomlion Ghana","Operations",C.purple],
                      ["Business Analyst","Ecobank Ghana","Finance",C.teal],
                      ["Procurement Officer","COCOBOD","Logistics",C.cyan],
                    ] as const).map(([role,company,dept,ac]) => (
                      <div key={role} style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`,
                        borderRadius:10, padding:"10px 14px", gap:8, marginBottom:8, transition:"border-color 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${ac}35`}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = C.border}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:"#DDE4EF" }}>{role}</p>
                          <p style={{ fontSize:11, color:C.textMuted, marginTop:1 }}>{company}</p>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                          <VerifiedPip accent={ac} />
                          <span style={{ fontSize:10, color:C.textDark }}>{dept}</span>
                        </div>
                      </div>
                    ))}

                    <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:11, color:C.textDark }}>Updated 3 minutes ago</span>
                      <button style={{ fontSize:12, fontWeight:600, color:C.cyan, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                        View all →
                      </button>
                    </div>
                  </div>
                </GlassPanel>
              </section>
            </PageHero>

            {/* categories + live job feed */}
            <section style={{ background:C.bg, maxWidth:1240, margin:"0 auto", padding:"56px 24px 72px" }}>
              <div style={{ marginBottom:28 }}>
                <SectionEyebrow label="Explore opportunities" accent={C.teal} />
                <h2 style={{ fontFamily:"Inter", fontSize:26, fontWeight:800, letterSpacing:"-0.5px", color:C.text }}>Browse by category</h2>
              </div>

              {/* category filter strip */}
              <div className="lgh-scroll" style={{ marginBottom:40 }}>
                {["All", ...categories].map((cat, ci) => {
                  const ac = ACCENTS[ci % 3];
                  const active = activeCategory === cat;
                  const count  = cat === "All"
                    ? Object.values(categoryCounts).reduce((a,b)=>a+b,0)
                    : (categoryCounts[cat] ?? null);
                  return (
                    <button key={cat} onClick={() => handleCategoryChange(cat)} style={{
                      minWidth:140, padding:"12px 16px", borderRadius:12, cursor:"pointer",
                      border:`1px solid ${active ? `${ac}45` : C.border}`,
                      background: active ? `${ac}10` : C.surfaceSolid,
                      color: active ? ac : C.textSub,
                      textAlign:"left" as const, transition:"all 0.15s", flexShrink:0,
                    }}>
                      <p style={{ fontSize:13, fontWeight:600 }}>{cat}</p>
                      <p style={{ fontSize:11, marginTop:4, fontWeight:500, color: active ? `${ac}99` : C.textDark }}>
                        {count !== null ? `${count} jobs` : "loading…"}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* jobs grid */}
              <div>
                {/* section header */}
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div aria-hidden="true" style={{ width:3, height:18, borderRadius:2, background: activeCategory==="All" ? C.cyan : ACCENTS[categories.indexOf(activeCategory) % 3] }} />
                    <h3 style={{ fontFamily:"Inter", fontSize:18, fontWeight:800, letterSpacing:"-0.3px", color:C.text }}>
                      {activeCategory === "All" ? "All jobs" : `${activeCategory} jobs`}
                    </h3>
                  </div>
                  {jobsTotal > 0 && (
                    <span style={{ fontSize:12, color:C.textMuted }}>
                      {jobsTotal.toLocaleString()} total
                    </span>
                  )}
                </div>

                {/* loading skeleton */}
                {jobsLoading && (
                  <div className="lgh-scroll">
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        minWidth:268, height:180, background:C.surfaceSolid,
                        border:`1px solid ${C.border}`, borderRadius:14,
                        flexShrink:0,
                        animation:"pulse 1.5s ease-in-out infinite",
                      }} />
                    ))}
                  </div>
                )}

                {/* error state */}
                {!jobsLoading && jobsError && (
                  <div style={{
                    padding:"24px", background:C.surfaceSolid,
                    border:`1px solid ${C.border}`, borderRadius:12,
                    color:"#E05555", fontSize:13, textAlign:"center" as const,
                  }}>
                    {jobsError}
                    <button onClick={() => loadJobs(activeCategory, jobsPage)}
                      style={{ marginLeft:12, color:C.cyan, background:"none", border:"none", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                      Retry
                    </button>
                  </div>
                )}

                {/* jobs scroll row */}
                {!jobsLoading && !jobsError && jobs.length > 0 && (
                  <div className="lgh-scroll">
                    {jobs.map((job, i) => {
                      const ac = ACCENTS[i % 3];
                      return <JobCard key={job.id} job={job} accent={ac} />;
                    })}
                  </div>
                )}

                {/* empty state */}
                {!jobsLoading && !jobsError && jobs.length === 0 && (
                  <div style={{
                    padding:"48px 24px", textAlign:"center" as const,
                    color:C.textMuted, fontSize:13,
                    border:`1px dashed ${C.border}`, borderRadius:12,
                  }}>
                    No active jobs in this category yet. Check back soon.
                  </div>
                )}

                {/* pagination */}
                {!jobsLoading && jobs.length > 0 && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:24 }}>
                    <button
                      onClick={() => setJobsPage(p => Math.max(1, p-1))}
                      disabled={jobsPage === 1}
                      style={{
                        fontSize:12, fontWeight:600, padding:"6px 14px", borderRadius:8,
                        border:`1px solid ${C.border}`, background:"transparent",
                        color: jobsPage===1 ? C.textDark : C.textSub,
                        cursor: jobsPage===1 ? "default" : "pointer",
                      }}>
                      ← Prev
                    </button>
                    <span style={{ fontSize:12, color:C.textMuted }}>
                      Page {jobsPage} of {Math.ceil(jobsTotal/20) || 1}
                    </span>
                    <button
                      onClick={() => setJobsPage(p => p+1)}
                      disabled={jobsPage * 20 >= jobsTotal}
                      style={{
                        fontSize:12, fontWeight:600, padding:"6px 14px", borderRadius:8,
                        border:`1px solid ${C.border}`, background:"transparent",
                        color: jobsPage*20>=jobsTotal ? C.textDark : C.textSub,
                        cursor: jobsPage*20>=jobsTotal ? "default" : "pointer",
                      }}>
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* credentials */}
            <section style={{ background:C.bg, maxWidth:1240, margin:"0 auto", padding:"0 24px 80px" }}>
              <GlassPanel style={{ border:`1px solid ${C.border}` }}>
                <GlowBar />
                <div style={{ padding:"36px 36px 40px" }}>
                  <SectionEyebrow label="Professional trust" accent={C.purple} />
                  <h2 style={{ fontFamily:"Inter", fontSize:24, fontWeight:800, letterSpacing:"-0.4px", color:C.text, marginBottom:8 }}>Credentials we recognise</h2>
                  <p style={{ fontSize:14, color:C.textMuted, maxWidth:480, lineHeight:1.65, marginBottom:28 }}>
                    Build a verified professional identity backed by Ghana's most respected bodies and global accreditations.
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:10 }}>
                    {credentials.map((cred, i) => <CredentialCard key={cred.name} cred={cred} accent={ACCENTS[i % 3]} />)}
                  </div>
                </div>
              </GlassPanel>
            </section>
          </div>
        )}

        {/* ══ PROFESSIONALS ═════════════════════════════════════════════════ */}
        {page === "professionals" && (
          <div>
            {/* cinematic hero */}
            <PageHero image="/backgrounds/professionals.jpg" meshKey="professionals" minHeight={320}>
              <div style={{ maxWidth:1240, margin:"0 auto", padding:"64px 24px 48px" }}>
                <SectionEyebrow label="Professional network" accent={C.cyan} />
                <h1 style={{
                  fontFamily:"Inter", fontSize:"clamp(30px,4vw,44px)", fontWeight:900,
                  letterSpacing:"-1px", color:"#F0F6FF", marginBottom:12,
                  textShadow:"0 2px 20px rgba(0,0,0,0.6)",
                }}>
                  Verified professionals
                </h1>
                <p style={{ fontSize:15, color:"rgba(148,163,184,0.90)", maxWidth:520, lineHeight:1.65 }}>
                  Accountants, auditors, tax experts, healthcare workers, engineers, and technology leaders — all verified.
                </p>
              </div>
            </PageHero>

            {/* professionals grid */}
            <section style={{ background:C.bg, maxWidth:1240, margin:"0 auto", padding:"48px 24px 64px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
                {professionals.map(p => (
                  <div key={p.name} style={{
                    background:"rgba(14,20,34,0.90)",
                    backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
                    border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden",
                    display:"flex", flexDirection:"column",
                    transition:"border-color 0.18s, transform 0.18s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${p.accent}40`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                    <div style={{ height:2, background:p.accent }} />
                    <div style={{ padding:"20px 20px 22px" }}>
                      <div style={{
                        width:50, height:50, borderRadius:12,
                        background:`${p.accent}18`, border:`1px solid ${p.accent}35`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontFamily:"Inter", fontSize:15, fontWeight:800, color:p.accent, marginBottom:14,
                      }}>
                        {initials(p.name)}
                      </div>
                      <p style={{ fontFamily:"Inter", fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{p.name}</p>
                      <p style={{ fontSize:13, color:C.textMuted, marginBottom:10, lineHeight:1.4 }}>{p.title}</p>
                      <p style={{ fontSize:11, fontWeight:600, color:p.accent, marginBottom:14 }}>{p.credential}</p>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                        <span style={{ fontSize:11, color:C.textDark }}>{p.connections} connections</span>
                        <button style={{
                          fontSize:12, fontWeight:600, padding:"5px 14px", borderRadius:7,
                          border:`1px solid ${C.border}`, background:"transparent",
                          color:C.textSub, cursor:"pointer", transition:"all 0.15s",
                        }}
                        onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = `${p.accent}50`; (e.target as HTMLButtonElement).style.color = p.accent; }}
                        onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = C.border; (e.target as HTMLButtonElement).style.color = C.textSub; }}>
                          View profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* professional body updates */}
            <section style={{ background:C.bg, maxWidth:1240, margin:"0 auto", padding:"0 24px 80px" }}>
              <SectionEyebrow label="Regulatory & industry board" accent={C.purple} />
              <h2 style={{ fontFamily:"Inter", fontSize:24, fontWeight:800, letterSpacing:"-0.4px", color:C.text, marginBottom:8 }}>
                Updates from professional bodies
              </h2>
              <p style={{ fontSize:14, color:C.textMuted, maxWidth:480, lineHeight:1.65, marginBottom:28 }}>
                Certified policy announcements, training adjustments, and systemic releases from Ghana's industry authorities.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                {professionalBodyUpdates.map((u, i) => (
                  <ProfBodyCard key={u.id} u={u} accent={ACCENTS[i % 3]} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ══ FEED ══════════════════════════════════════════════════════════ */}
        {page === "feed" && (
          <div>
            {/* cinematic hero */}
            <PageHero image="/backgrounds/news-feed.jpg" meshKey="feed" minHeight={280}>
              <div style={{ maxWidth:1240, margin:"0 auto", padding:"64px 24px 48px" }}>
                <SectionEyebrow label="News feed" accent={C.cyan} />
                <h1 style={{
                  fontFamily:"Inter", fontSize:"clamp(30px,4vw,44px)", fontWeight:900,
                  letterSpacing:"-1px", color:"#F0F6FF", marginBottom:12,
                  textShadow:"0 2px 20px rgba(0,0,0,0.6)",
                }}>
                  Career & industry updates
                </h1>
                <p style={{ fontSize:15, color:"rgba(148,163,184,0.90)", maxWidth:480, lineHeight:1.65 }}>
                  Professional insights, hiring trends, and trusted business news from across Ghana.
                </p>
              </div>
            </PageHero>

            {/* posts */}
            <section style={{ background:C.bg, maxWidth:1240, margin:"0 auto", padding:"48px 24px 80px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                {feedPosts.map((post, i) => {
                  const ac = ACCENTS[i % 3];
                  return (
                    <article key={post.title} style={{
                      background:"rgba(14,20,34,0.90)",
                      backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
                      border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden",
                      display:"flex", flexDirection:"column",
                      transition:"transform 0.18s, border-color 0.18s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.borderColor = `${ac}30`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>
                      <div style={{ height:2, background:ac }} />
                      <div style={{ padding:"20px 22px 24px", flex:1, display:"flex", flexDirection:"column" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                          <span style={{
                            fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" as const,
                            color:ac, background:`${ac}12`, border:`1px solid ${ac}30`, borderRadius:5, padding:"3px 9px",
                          }}>{post.category}</span>
                          <span style={{ fontSize:11, color:C.textDark }}>{post.readTime}</span>
                        </div>
                        <h3 style={{ fontFamily:"Inter", fontSize:16, fontWeight:700, color:"#DDE4EF", lineHeight:1.35, marginBottom:10 }}>{post.title}</h3>
                        <p style={{ fontSize:13, color:C.textMuted, lineHeight:1.7, flex:1 }}>{post.body}</p>
                        <div style={{ marginTop:18, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                          <button style={{
                            fontSize:12, fontWeight:600, color:C.textMuted,
                            background:"none", border:"none", cursor:"pointer", padding:0, transition:"color 0.15s",
                          }}
                          onMouseEnter={e => (e.target as HTMLButtonElement).style.color = ac}
                          onMouseLeave={e => (e.target as HTMLButtonElement).style.color = C.textMuted}>
                            Read more →
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer style={{ borderTop:`1px solid ${C.border}` }}>
          <GlowBar />
          <div style={{
            maxWidth:1240, margin:"0 auto", padding:"24px 24px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap" as const, gap:12,
          }}>
            <div style={{ display:"flex", alignItems:"baseline" }}>
              <span style={{ fontFamily:"Inter", fontSize:16, fontWeight:900, color:C.text }}>Link</span>
              <span style={{ fontFamily:"Inter", fontSize:16, fontWeight:900, color:C.cyan }}>GH</span>
              <span style={{ marginLeft:10, fontSize:12, color:C.textDark }}>by OrbitLinked</span>
            </div>
            <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" as const }}>
              {["jobs@orbitlinked.com","support@orbitlinked.com"].map(email => (
                <a key={email} href={`mailto:${email}`}
                  style={{ fontSize:12, color:C.textDark, textDecoration:"none", transition:"color 0.15s" }}
                  onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = C.textSub}
                  onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = C.textDark}>
                  {email}
                </a>
              ))}
              <span style={{ fontSize:12, color:"#1E293B" }}>© {new Date().getFullYear()} OrbitLinked</span>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
