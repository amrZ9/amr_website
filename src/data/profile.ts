export interface ExperienceItem {
  id: string;
  variant: string;
  badge?: string;
  date: string;
  title: string;
  place: string;
  location?: string;
  description: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  note: string;
  items: string[];
}

export interface CaseStudyFact {
  label: string;
  value: string;
}

export interface CaseStudyNarrativeSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
}

export interface ArchitectureNode {
  label: string;
  sublabel?: string;
}

export interface ProjectItem {
  id: string;
  accent?: string;
  kind: "case-study" | "showcase";
  title: string;
  subtitle: string;
  folderLabel: string;
  folderAction: string;
  category: string;
  summary: string;
  image?: string;
  imageAlt?: string;
  stack?: string[];
  highlights?: string[];
  links?: { label: string; href: string }[];
  facts?: CaseStudyFact[];
  privacyNote?: string;
  narrative?: CaseStudyNarrativeSection[];
  architecture?: {
    title: string;
    nodes: ArchitectureNode[];
    note?: string;
  };
}

export interface ProfileData {
  meta: {
    title: string;
    description: string;
  };
  shortName: string;
  fullName: string;
  rolePrimary: string;
  roleSecondary: string;
  heroTitleLines: [string, string];
  heroYear: string;
  heroFocusTag: string;
  portraitImage: string;
  portraitAlt: string;
  currentRole: {
    label: string;
    company: string;
    title: string;
    location: string;
  };
  bioLead: {
    prefix: string;
    highlight1: string;
    middle: string;
    highlight2: string;
    suffix: string;
  };
  email: string;
  phone?: string;
  location?: string;
  githubUrl?: string;
  socials: {
    name: "LinkedIn" | "GitHub" | "Instagram" | "Upwork";
    href: string;
  }[];
  skillsHeading: string;
  skillsSubheading: string;
  skills: SkillGroup[];
  projectsIntro: string;
  projects: ProjectItem[];
  experienceHeading: string;
  experienceSubheading: string;
  experience: ExperienceItem[];
  contactHeading: string;
  contactSubheading: string;
  footer: {
    copyrightYear: string;
    finaleHeading: string;
    crowdName: string;
    crowdPortrait: string;
    crowdCaption: string;
    crowdDescription: string;
  };
}

export const profile: ProfileData = {
  meta: {
    title: "Amr Ahmed | Growth & Marketing Strategist · Founder",
    description:
      "Biography and CV of Amr Ahmed A.Aziz — Growth and marketing professional, MBA holder, and founder driving strategy across DAZU, BetyChef, and Egy-V.",
  },
  shortName: "Amr",
  fullName: "Amr Ahmed A.Aziz",
  rolePrimary: "Growth & Marketing",
  roleSecondary: "& Founder.",
  heroTitleLines: ["GROWTH", "STRATEGIST"],
  heroYear: "©2026",
  heroFocusTag: "/GROWTH · PRODUCT · FOUNDER",
  portraitImage: "/amr-portrait.jpg",
  portraitAlt: "Black and white studio portrait of Amr Ahmed A.Aziz",
  currentRole: {
    label: "Currently at",
    company: "DAZU (Bright Creations)",
    title: "Growth & Marketing",
    location: "Sheikh Zayed City, Giza, Egypt",
  },
  bioLead: {
    prefix: "MBA holder with a ",
    highlight1: "founder's mindset",
    middle: " — understanding what people need and ",
    highlight2: "building something they'll actually use",
    suffix: ".",
  },
  email: "amrz08875@gmail.com",
  phone: "+20 (0) 155 126 9903",
  location: "Sheikh Zayed City, Giza, Egypt",
  socials: [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/amr-ahmed-70468520b",
    },
  ],
  skillsHeading: "Capabilities",
  skillsSubheading: "Strategy, execution,\nand the tools behind it.",
  skills: [
    {
      id: "skills-core",
      title: "Core Skills",
      note: "Go-to-Market, Brand Direction & Cross-Functional Leadership",
      items: [
        "Go-to-market planning",
        "Stakeholder negotiation",
        "Brand & UX direction",
        "Customer segmentation & targeting",
        "Team leadership",
        "Customer-facing communication",
      ],
    },
    {
      id: "skills-tools",
      title: "Tools & Platforms",
      note: "AI-Assisted Building, Analytics, Design & Travel GDS",
      items: [
        "Claude Code",
        "Lovable",
        "Notion",
        "Google Analytics",
        "Canva",
        "Gamma",
        "Amadeus / Farelogix (GDS)",
        "MS Office",
      ],
    },
    {
      id: "skills-education-certs",
      title: "Education & Courses",
      note: "MBA in Marketing, BBA & Executive Certifications",
      items: [
        "MBA Marketing (AAST)",
        "BBA (Helwan University)",
        "Google Project Management",
        "Marketing Strategy (IIT)",
        "Project Management Essentials (IBM)",
        "Business Strategy (UVA Darden)",
        "Finance & Accounting (Wharton)",
        "Arabic (Native) · English (Fluent)",
      ],
    },
  ],
  projectsIntro:
    "Ventures founded, growth initiatives led, and early product builds. Open a folder to explore each story.",
  projects: [
    {
      id: "betychef",
      accent: "#f59e0b",
      kind: "case-study",
      title: "BetyChef",
      subtitle: "Homemade food marketplace",
      folderLabel: "Venture case study",
      folderAction: "Read case study",
      category: "BetyChef · Oct 2025 – Sep 2026",
      summary:
        "A homemade food delivery marketplace app connecting homemade food chefs directly with customers — validated with 100+ chef interviews, rebuilt using AI tools, and launched on the Apple App Store and Google Play.",
      facts: [
        { label: "Role", value: "Founder | Product & Growth Lead" },
        { label: "Platforms", value: "Apple App Store & Google Play" },
        { label: "Traction", value: "10 chefs · 59 pre-marketing downloads" },
        { label: "Partners", value: "Runners Co. · Paymob" },
      ],
      narrative: [
        {
          title: "Validation & Product Ownership",
          steps: [
            "Conducted 100+ direct conversations with homemade food chefs to confirm demand and define MVP scope before development began.",
            "Owned end-to-end product development, UX, vendor onboarding, customer segmentation, target market, and brand identity.",
            "Independently rebuilt and launched the app on the Apple App Store and Google Play using AI tools after development support fell through, driving real orders and collaborations.",
          ],
        },
        {
          title: "Growth & Operations",
          steps: [
            "Onboarded 10 chefs (supply-side) and reached 59 downloads (demand-side) pre-marketing to validate product-market fit before paid spend.",
            "Built a multi-channel launch content plan across Facebook, Instagram, and LinkedIn (12-post launch calendar).",
            "Outsourced delivery to Runners Co., signed a payment gateway partnership with Paymob, and hired a dedicated supply-side acquisition lead.",
          ],
        },
      ],
    },
    {
      id: "dazu-growth",
      accent: "#10b981",
      kind: "case-study",
      title: "DAZU Growth",
      subtitle: "Multi-line growth strategy",
      folderLabel: "Current role",
      folderAction: "Read overview",
      category: "DAZU (Bright Creations) · Sep 2026 – Present",
      summary:
        "Driving growth strategy, marketing operations, and campaign execution across DAZU's Wealth, Business, and Realty lines.",
      facts: [
        { label: "Role", value: "Growth & Marketing" },
        { label: "Company", value: "DAZU (Bright Creations)" },
        { label: "Lines", value: "Wealth · Business · Realty" },
        { label: "Agency", value: "Media Republic" },
      ],
      narrative: [
        {
          title: "Strategy & Execution",
          steps: [
            "Develop growth strategies and marketing initiatives across DAZU Wealth, Business, and Realty.",
            "Coordinate with Media Republic on brand direction, content planning, campaign execution, and marketing deliverables.",
            "Build growth programs and conversion initiatives to improve acquisition, activation, and customer engagement.",
            "Establish marketing operations, KPI tracking, budgets, and campaign calendars for measurable growth.",
          ],
        },
      ],
    },
    {
      id: "egy-v",
      accent: "#d97706",
      kind: "case-study",
      title: "Egy-V",
      subtitle: "Egypt heritage ticketing",
      folderLabel: "Venture case study",
      folderAction: "Read case study",
      category: "Egy-V · Jul 2025 – Oct 2025",
      summary:
        "A one-stop platform to discover Egypt's historical sites and book entry tickets online — like a digital gateway to Egypt's heritage.",
      facts: [
        { label: "Role", value: "Founder" },
        { label: "Entity", value: "Registered company (Anovera)" },
        { label: "Database", value: "30+ historical & cultural sites" },
        { label: "Outcome", value: "Disciplined shutdown on B2G blocker" },
      ],
      narrative: [
        {
          title: "Execution & Market Sizing",
          steps: [
            "Validated market demand and scoped an MVP through independent research, surveys, and site-level data collection.",
            "Registered Anovera and modeled revenue and cost forecasts to inform the business plan and go-to-market approach.",
            "Commissioned a freelance team to build the platform website and compiled a database of 30+ historical and cultural sites.",
          ],
        },
        {
          title: "Strategic Decision",
          paragraphs: [
            "Pursued a B2G partnership with eFinance for ticketing integration under the ministry's digitization initiative. When required government approvals did not materialize, concluded the B2G model wasn't viable and made the disciplined founder call to pull the plug.",
          ],
        },
      ],
    },
    {
      id: "early-ventures",
      accent: "#38bdf8",
      kind: "case-study",
      title: "Mal3ab & PLASEA",
      subtitle: "Early product leadership",
      folderLabel: "Project archive",
      folderAction: "Read projects",
      category: "Student Ventures · 2020 – 2022",
      summary:
        "Early product strategy, team leadership, and go-to-market initiatives across a nationwide sports-booking marketplace concept and a seaweed sustainability venture.",
      facts: [
        { label: "Mal3ab", value: "Project Manager · Team of 15" },
        { label: "PLASEA", value: "Enactus Helwan · Sustainability" },
        { label: "Focus", value: "MVP scoping, BMC & GTM" },
      ],
      narrative: [
        {
          title: "Mal3ab | X Project (Nov 2020 – Aug 2021)",
          paragraphs: [
            "Led a team of 15 as Project Manager covering product strategy, MVP scoping, Business Model Canvas, and go-to-market planning for a football-field booking marketplace across Egypt. A similar concept later aired on Shark Tank, validating the original market insight.",
          ],
        },
        {
          title: "PLASEA | Enactus Helwan University (Apr 2021 – Sep 2022)",
          paragraphs: [
            "Contributed to MVP development, early-stage product iteration, and marketing segmentation for a sustainability initiative producing biodegradable plastic bags from seaweed.",
          ],
        },
      ],
    },
  ],
  experienceHeading: "Experience.",
  experienceSubheading: "Current work.\nBack to the foundations.",
  experience: [
    {
      id: "dazu-role",
      variant: "journey-now",
      badge: "Current role",
      date: "Sep 2026 – Present",
      title: "Growth & Marketing",
      place: "DAZU (Bright Creations)",
      location: "Giza",
      description:
        "Driving growth strategy, KPI operations, and multi-line marketing execution across DAZU Wealth, Business, and Realty.",
    },
    {
      id: "betychef-role",
      variant: "journey-freelance",
      date: "Oct 2025 – Sep 2026",
      title: "Founder | Product & Growth Lead",
      place: "BetyChef",
      description:
        "Built and launched a homemade food marketplace on App Store & Google Play (100+ interviews, 10 chefs, 59 pre-marketing downloads).",
    },
    {
      id: "mba-aast",
      variant: "journey-masters",
      date: "Oct 2024 – Oct 2026",
      title: "MBA | Marketing",
      place: "Arab Academy for Science & Technology",
      description:
        "Master of Business Administration specializing in Marketing, paired with hands-on venture building.",
    },
    {
      id: "cx-egyv",
      variant: "journey-internship",
      date: "Mar 2024 – Sep 2026",
      title: "Founder (Egy-V) & CX Specialist",
      place: "Concentrix · Alorica",
      location: "International Accounts",
      description:
        "Founded Egy-V (Jul–Oct 2025) and delivered global customer support for Booking.com, HSBC, Expedia, and QVC using Amadeus & Farelogix.",
    },
    {
      id: "bba-foundations",
      variant: "journey-bachelors",
      date: "2017 – 2022",
      title: "BBA & Early Foundations",
      place: "Helwan University · Egypt Laptop · Carrefour",
      description:
        "BBA graduate; ~1M EGP hardware sales (15–20% of branch target, Employee of the Month) and Operations Intern at Carrefour.",
    },
  ],
  contactHeading: "Let's talk.",
  contactSubheading:
    "Open to growth, product, and marketing leadership opportunities — based in Sheikh Zayed City, Giza, Egypt.",
  footer: {
    copyrightYear: "2026",
    finaleHeading: "See you around.",
    crowdName: "AMR.",
    crowdPortrait: "/footer/egypt/amr-standing.webp",
    crowdCaption: "Understand what people need. Build what they'll use.",
    crowdDescription:
      "Illustrated street scene with portrait standing among passersby.",
  },
};
