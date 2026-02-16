import imgMacbook2 from "@/templates/bookflow/public/flex-ui-assets/images/blog/macbook2.jpg";
import imgMacbook3 from "@/templates/bookflow/public/flex-ui-assets/images/blog/macbook3.jpg";
import imgMacbook from "@/templates/bookflow/public/flex-ui-assets/images/blog/macbook.jpg";
import imgWork from "@/templates/bookflow/public/flex-ui-assets/images/blog/work.jpg";
import imgWork2 from "@/templates/bookflow/public/flex-ui-assets/images/blog/work2.jpg";
import imgWork3 from "@/templates/bookflow/public/flex-ui-assets/images/blog/work3.jpg";
import imgWork4 from "@/templates/bookflow/public/flex-ui-assets/images/blog/work4.jpg";
import imgWork5 from "@/templates/bookflow/public/flex-ui-assets/images/blog/work5.jpg";
import imgWork6 from "@/templates/bookflow/public/flex-ui-assets/images/blog/work6.jpg";
import imgLearn from "@/templates/bookflow/public/flex-ui-assets/images/blog/learn.jpg";
import imgLearn2 from "@/templates/bookflow/public/flex-ui-assets/images/blog/learn2.jpg";
import imgLearn3 from "@/templates/bookflow/public/flex-ui-assets/images/blog/learn3.jpg";
import imgRoom from "@/templates/bookflow/public/flex-ui-assets/images/blog/room.jpg";
import imgEffect from "@/templates/bookflow/public/flex-ui-assets/images/blog/effect.jpg";
import imgEffect2 from "@/templates/bookflow/public/flex-ui-assets/images/blog/effect2.jpg";
import imgEffect3 from "@/templates/bookflow/public/flex-ui-assets/images/blog/effect3.jpg";
import imgEffect4 from "@/templates/bookflow/public/flex-ui-assets/images/blog/effect4.jpg";
import imgEffect5 from "@/templates/bookflow/public/flex-ui-assets/images/blog/effect5.jpg";
import imgContent1 from "@/templates/bookflow/public/flex-ui-assets/images/blog-content/content-photo1.jpg";
import imgContent2 from "@/templates/bookflow/public/flex-ui-assets/images/blog-content/content-photo2.jpg";
import imgContent3 from "@/templates/bookflow/public/flex-ui-assets/images/blog-content/content-photo3.jpg";
import imgContent4 from "@/templates/bookflow/public/flex-ui-assets/images/blog-content/content-photo4.jpg";
import imgBgVideo from "@/templates/bookflow/public/flex-ui-assets/images/headers/bg-video.jpg";
import imgBgVideo2 from "@/templates/bookflow/public/flex-ui-assets/images/headers/bg-video2.jpg";
import imgBgVideo3 from "@/templates/bookflow/public/flex-ui-assets/images/headers/bg-video3.jpg";
import imgHeader from "@/templates/bookflow/public/flex-ui-assets/images/headers/header.jpg";
import imgMockDark1 from "@/templates/bookflow/public/flex-ui-assets/images/headers/mockup-dark1.png";
import imgMockDark2 from "@/templates/bookflow/public/flex-ui-assets/images/headers/mockup-dark2.png";
import imgMockLight1 from "@/templates/bookflow/public/flex-ui-assets/images/headers/mockup-light1.png";
import imgMockLight2 from "@/templates/bookflow/public/flex-ui-assets/images/headers/mockup-light2.png";
import imgPlaceholderVid from "@/templates/bookflow/public/flex-ui-assets/images/headers/placeholder-video.png";
import imgPlaceholderVid2 from "@/templates/bookflow/public/flex-ui-assets/images/headers/placeholder-video2.png";
import imgMenHow from "@/templates/bookflow/public/flex-ui-assets/images/how-it-works/men-photo-how.png";
import imgPhotoVideo from "@/templates/bookflow/public/flex-ui-assets/images/how-it-works/photo-video.png";
import imgStock from "@/templates/bookflow/public/flex-ui-assets/images/features/stock.png";
import imgStock2 from "@/templates/bookflow/public/flex-ui-assets/images/features/stock2.png";
import imgStock3 from "@/templates/bookflow/public/flex-ui-assets/images/features/stock3.png";
import imgLaptop from "@/templates/bookflow/public/flex-ui-assets/elements/cta/photo-laptop-ph.png";
import imgMenComputer from "@/templates/bookflow/public/flex-ui-assets/elements/cta/men-computer-placeholder.png";
import imgNewsletterMac from "@/templates/bookflow/public/flex-ui-assets/elements/newsletter/macbook-dark.png";
import imgAppMacbook from "@/templates/bookflow/public/flex-ui-assets/elements/applications/macbook2.png";

export type TemplateCard = {
  slug: string;
  title: string;
  tags: string[];
  href: string;
  useHref: string;
  thumb: any;
  desc: string;
};

const baseUse = "https://app.islaapp.tech/?plan=trial&lang=en&template=";

export const templates: TemplateCard[] = [
  {
    slug: "bookflow",
    title: "BookFlow (Service Booking)",
    tags: ["Bookings", "POS-ready", "Client-ready"],
    href: `${baseUse}bookflow&view=preview`,
    useHref: `${baseUse}bookflow`,
    thumb: imgMacbook2,
    desc: "Service bookings with POS handoff, receipts, and quick brand swap. Ideal for salons, clinics, wellness.",
  },
  {
    slug: "medtrack",
    title: "MedTrack (Medication Manager)",
    tags: ["Health", "Reminders", "Tracking"],
    href: `${baseUse}medtrack&view=preview`,
    useHref: `${baseUse}medtrack`,
    thumb: imgBgVideo,
    desc: "Medication schedules, refill prompts, and adherence logs. Customizable colors and pill schedules per persona.",
  },
  {
    slug: "fitcoach",
    title: "FitCoach (Wellness Program)",
    tags: ["Fitness", "Coaching", "Subscriptions"],
    href: `${baseUse}fitcoach&view=preview`,
    useHref: `${baseUse}fitcoach`,
    thumb: imgBgVideo2,
    desc: "Coaching plans with weekly check-ins, progress cards, and recurring billing. Swap brand palette in minutes.",
  },
  {
    slug: "spa",
    title: "CalmSpa (Salon & Spa)",
    tags: ["Wellness", "Bookings", "Gift Cards"],
    href: `${baseUse}spa&view=preview`,
    useHref: `${baseUse}spa`,
    thumb: imgLearn3,
    desc: "Service menu, smart upsells, theme customizer, and gift cards with live preview.",
  },
  {
    slug: "restaurant",
    title: "TableReady (Restaurant)",
    tags: ["Bookings", "Menus", "Payments"],
    href: `${baseUse}restaurant&view=preview`,
    useHref: `${baseUse}restaurant`,
    thumb: imgRoom,
    desc: "Reservations, QR menus, and deposits. Replace hero with your dining shot; auto-adapts typography to brand.",
  },
  {
    slug: "spa",
    title: "CalmSpa (Salon & Spa)",
    tags: ["Wellness", "Bookings", "Gift Cards"],
    href: `${baseUse}spa&view=preview`,
    useHref: `${baseUse}spa`,
    thumb: imgLearn3,
    desc: "Service menu + upsells + gift cards. Swap accent color and CTA copy for promos in under a minute.",
  },
  {
    slug: "clinic",
    title: "CareLine (Clinic)",
    tags: ["Healthcare", "Intake", "Scheduling"],
    href: `${baseUse}clinic&view=preview`,
    useHref: `${baseUse}clinic`,
    thumb: imgLearn,
    desc: "Patient intake with HIPAA-friendly forms, appointment slots, and SMS reminders. Swap hero image and logo fast.",
  },
  {
    slug: "dental",
    title: "SmileSet (Dental)",
    tags: ["Dental", "Bookings", "Financing"],
    href: `${baseUse}dental&view=preview`,
    useHref: `${baseUse}dental`,
    thumb: imgLearn2,
    desc: "Treatment highlights, financing CTAs, and hygienist scheduling. Update accent to match your practice colors.",
  },
  {
    slug: "law",
    title: "Briefly (Law Firm)",
    tags: ["Professional", "Leads", "Appointments"],
    href: `${baseUse}law&view=preview`,
    useHref: `${baseUse}law`,
    thumb: imgMacbook,
    desc: "Case types, attorney bios, and consult booking. Swap sections for practice areas; keep intake flow intact.",
  },
  {
    slug: "real-estate",
    title: "EstateGo (Real Estate)",
    tags: ["Listings", "Leads", "Tours"],
    href: `${baseUse}real-estate&view=preview`,
    useHref: `${baseUse}real-estate`,
    thumb: imgWork,
    desc: "Property highlights, map embeds, and tour booking. Swap cover photo per campaign; lead form stays wired.",
  },
  {
    slug: "coaching",
    title: "Clarity Coach",
    tags: ["Coaching", "Funnels", "Payments"],
    href: `${baseUse}coaching&view=preview`,
    useHref: `${baseUse}coaching`,
    thumb: imgWork2,
    desc: "Program overview, testimonials, and session booking. Swap hero and colors to match your personal brand.",
  },
  {
    slug: "saas",
    title: "LaunchPad (SaaS)",
    tags: ["SaaS", "Product", "Waitlist"],
    href: `${baseUse}saas&view=preview`,
    useHref: `${baseUse}saas`,
    thumb: imgWork3,
    desc: "Feature blocks, pricing, and waitlist. Toggle between dark/light; swap icon set and primary CTA text.",
  },
  {
    slug: "analytics",
    title: "PulseDash (Analytics)",
    tags: ["Dashboards", "B2B", "Leads"],
    href: `${baseUse}analytics&view=preview`,
    useHref: `${baseUse}analytics`,
    thumb: imgWork4,
    desc: "Metric highlights, integration logos, and demo booking. Swap screenshots; keep CTA row pinned.",
  },
  {
    slug: "startup",
    title: "Elevate (Startup)",
    tags: ["Pitch", "Investors", "Team"],
    href: `${baseUse}startup&view=preview`,
    useHref: `${baseUse}startup`,
    thumb: imgWork5,
    desc: "Story-driven hero, traction stats, team grid. Replace imagery and brand color in seconds.",
  },
  {
    slug: "portfolio",
    title: "FolioPrime",
    tags: ["Portfolio", "Freelance", "Contact"],
    href: `${baseUse}portfolio&view=preview`,
    useHref: `${baseUse}portfolio`,
    thumb: imgWork6,
    desc: "Case studies with gallery, services, and contact form. Swap thumbnails and accent color easily.",
  },
  {
    slug: "agency",
    title: "North Studio (Agency)",
    tags: ["Agency", "Services", "Leads"],
    href: `${baseUse}agency&view=preview`,
    useHref: `${baseUse}agency`,
    thumb: imgEffect,
    desc: "Service menu, results carousel, and booking CTA. Swap background glow and logos fast.",
  },
  {
    slug: "event",
    title: "Eventia",
    tags: ["Events", "Tickets", "Schedule"],
    href: `${baseUse}event&view=preview`,
    useHref: `${baseUse}event`,
    thumb: imgEffect2,
    desc: "Agenda, speakers, ticket tiers. Swap hero art and colors; keep CTA anchored for conversions.",
  },
  {
    slug: "conference",
    title: "SummitSpace",
    tags: ["Conference", "Sponsors", "Agenda"],
    href: `${baseUse}conference&view=preview`,
    useHref: `${baseUse}conference`,
    thumb: imgEffect3,
    desc: "Sponsor grid, schedule, and venue info. Swap cover gradient and imagery per city stop.",
  },
  {
    slug: "nonprofit",
    title: "ImpactNow",
    tags: ["Nonprofit", "Donations", "Stories"],
    href: `${baseUse}nonprofit&view=preview`,
    useHref: `${baseUse}nonprofit`,
    thumb: imgEffect4,
    desc: "Mission-driven hero, impact stats, and donation CTA. Swap photography for each campaign quickly.",
  },
  {
    slug: "education",
    title: "EduFlow",
    tags: ["Courses", "Enroll", "Content"],
    href: `${baseUse}education&view=preview`,
    useHref: `${baseUse}education`,
    thumb: imgEffect5,
    desc: "Course catalog, instructors, and enrollment funnel. Replace hero and palette to match your school.",
  },
  {
    slug: "newsletter",
    title: "InboxPro (Newsletter)",
    tags: ["Newsletter", "Lead Gen", "Waitlist"],
    href: `${baseUse}newsletter&view=preview`,
    useHref: `${baseUse}newsletter`,
    thumb: imgContent1,
    desc: "Lead magnet landing with social proof. Swap hero illustration or drop in your own product shot.",
  },
  {
    slug: "blog",
    title: "Magnetic Blog",
    tags: ["Content", "SEO", "Authors"],
    href: `${baseUse}blog&view=preview`,
    useHref: `${baseUse}blog`,
    thumb: imgContent2,
    desc: "Feature posts, categories, and author cards. Swap cover images and accent color without breaking layout.",
  },
  {
    slug: "knowledge",
    title: "HelpHub",
    tags: ["Docs", "Support", "Search"],
    href: `${baseUse}knowledge&view=preview`,
    useHref: `${baseUse}knowledge`,
    thumb: imgContent3,
    desc: "Knowledge base layout with search and categories. Swap hero and brand color; keep typography consistent.",
  },
  {
    slug: "faq",
    title: "Answerly (FAQ)",
    tags: ["Support", "FAQ", "Contact"],
    href: `${baseUse}faq&view=preview`,
    useHref: `${baseUse}faq`,
    thumb: imgContent4,
    desc: "Accordion FAQs with contact CTA. Swap gradient and icon set in seconds.",
  },
  {
    slug: "commerce",
    title: "ShopLine (Retail)",
    tags: ["Retail", "Catalog", "Cart"],
    href: `${baseUse}commerce&view=preview`,
    useHref: `${baseUse}commerce`,
    thumb: imgBgVideo3,
    desc: "Product highlights, bundles, and cart CTA. Swap hero photography and accent to match your brand.",
  },
  {
    slug: "subscriptions",
    title: "SubFlow",
    tags: ["Subscriptions", "Plans", "Billing"],
    href: `${baseUse}subscriptions&view=preview`,
    useHref: `${baseUse}subscriptions`,
    thumb: imgHeader,
    desc: "Plan grid with toggles, add-on upsells, and testimonials. Swap palette and hero art quickly.",
  },
  {
    slug: "payments",
    title: "PayFlex",
    tags: ["Fintech", "Payments", "Security"],
    href: `${baseUse}payments&view=preview`,
    useHref: `${baseUse}payments`,
    thumb: imgMockDark1,
    desc: "Fintech landing with trust badges, feature tabs, and CTA. Swap device mock shots and gradients.",
  },
  {
    slug: "banking",
    title: "NeoBank",
    tags: ["Banking", "Cards", "App"],
    href: `${baseUse}banking&view=preview`,
    useHref: `${baseUse}banking`,
    thumb: imgMockDark2,
    desc: "Card hero, rewards highlights, and app preview. Swap card art and brand color in minutes.",
  },
  {
    slug: "light-saas",
    title: "BrightOps",
    tags: ["SaaS", "Automation", "Teams"],
    href: `${baseUse}light-saas&view=preview`,
    useHref: `${baseUse}light-saas`,
    thumb: imgMockLight1,
    desc: "Operational tooling with feature tabs and logos. Swap screenshots and CTA text fast.",
  },
  {
    slug: "crm",
    title: "ClientLoop (CRM)",
    tags: ["CRM", "Pipelines", "Integrations"],
    href: `${baseUse}crm&view=preview`,
    useHref: `${baseUse}crm`,
    thumb: imgMockLight2,
    desc: "Pipeline stages, integration badges, and demo booking. Swap gradient and icons easily.",
  },
  {
    slug: "video",
    title: "StreamHub",
    tags: ["Video", "Courses", "Media"],
    href: `${baseUse}video&view=preview`,
    useHref: `${baseUse}video`,
    thumb: imgPlaceholderVid,
    desc: "Video-first layout with episodes and subscribe CTA. Swap cover frame and accent colors quickly.",
  },
  {
    slug: "webinar",
    title: "WebinarOne",
    tags: ["Webinar", "Registration", "Reminders"],
    href: `${baseUse}webinar&view=preview`,
    useHref: `${baseUse}webinar`,
    thumb: imgPlaceholderVid2,
    desc: "Webinar signup with schedule, speakers, and reminders. Swap hero art and button copy.",
  },
  {
    slug: "how-it-works",
    title: "FlowSteps",
    tags: ["How it works", "Process", "Explainer"],
    href: `${baseUse}how-it-works&view=preview`,
    useHref: `${baseUse}how-it-works`,
    thumb: imgMenHow,
    desc: "Step-by-step explainer with visuals and CTA. Swap photos and color accents per product.",
  },
  {
    slug: "video-service",
    title: "VidService",
    tags: ["Services", "Video", "Booking"],
    href: `${baseUse}video-service&view=preview`,
    useHref: `${baseUse}video-service`,
    thumb: imgPhotoVideo,
    desc: "Video production landing with package tiers and booking. Replace reel cover and palette instantly.",
  },
  {
    slug: "features",
    title: "FeatureGrid",
    tags: ["Product", "Features", "CTA"],
    href: `${baseUse}features&view=preview`,
    useHref: `${baseUse}features`,
    thumb: imgStock,
    desc: "Feature tiles with iconography and CTA. Swap background glow and icons.",
  },
  {
    slug: "projects",
    title: "ProjectHub",
    tags: ["Projects", "Cards", "Kanban"],
    href: `${baseUse}projects&view=preview`,
    useHref: `${baseUse}projects`,
    thumb: imgStock2,
    desc: "Project snapshots with CTA to sign up. Swap imagery and keep CTA pinned.",
  },
  {
    slug: "notifications",
    title: "NotifyMe",
    tags: ["Notifications", "API", "Product"],
    href: `${baseUse}notifications&view=preview`,
    useHref: `${baseUse}notifications`,
    thumb: imgStock3,
    desc: "Notification platform landing with API callouts. Swap screenshot and brand color.",
  },
  {
    slug: "freelance",
    title: "IndiePro",
    tags: ["Freelance", "Bookings", "Portfolio"],
    href: `${baseUse}freelance&view=preview`,
    useHref: `${baseUse}freelance`,
    thumb: imgLaptop,
    desc: "Freelancer landing with packages and booking. Replace workspace photo and accent color.",
  },
  {
    slug: "it-services",
    title: "SecureIT",
    tags: ["IT", "Security", "Consulting"],
    href: `${baseUse}it-services&view=preview`,
    useHref: `${baseUse}it-services`,
    thumb: imgMenComputer,
    desc: "IT services with security highlights and consult CTA. Swap hero and brand palette quickly.",
  },
  {
    slug: "newsletter-pro",
    title: "Inbox Elite",
    tags: ["Newsletter", "Lead Gen", "Templates"],
    href: `${baseUse}newsletter-pro&view=preview`,
    useHref: `${baseUse}newsletter-pro`,
    thumb: imgNewsletterMac,
    desc: "Newsletter growth page with opt-in, social proof, and stats. Swap device mock and gradient.",
  },
  {
    slug: "app-showcase",
    title: "AppShow",
    tags: ["App", "Showcase", "Downloads"],
    href: `${baseUse}app-showcase&view=preview`,
    useHref: `${baseUse}app-showcase`,
    thumb: imgAppMacbook,
    desc: "App showcase with platform badges and feature highlights. Swap screenshots and CTA copy easily.",
  },
];
