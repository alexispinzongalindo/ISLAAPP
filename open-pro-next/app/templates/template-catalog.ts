import type { StaticImageData } from "next/image";
import workflow01 from "@/public/images/workflow-01.png";
import workflow02 from "@/public/images/workflow-02.png";
import workflow03 from "@/public/images/workflow-03.png";
import carousel01 from "@/public/images/carousel-01.png";
import carousel02 from "@/public/images/carousel-02.png";
import carousel03 from "@/public/images/carousel-03.png";
import heroImage01 from "@/public/images/hero-image-01.jpg";
import featuresImage from "@/public/images/features.png";
import worldmapImage from "@/public/images/worldmap.png";
import teamMosaic01 from "@/public/images/team-mosaic-01.jpg";
import postThumb04 from "@/public/images/post-thumb-04.jpg";
import postThumb15 from "@/public/images/post-thumb-15.jpg";

export type TemplateDefinition = {
  slug: string;
  title: string;
  titleEs: string;
  tags: string[];
  desc: string;
  descEs: string;
  thumb: StaticImageData;
  hero: StaticImageData;
};

export const templates: TemplateDefinition[] = [
  {
    slug: "bookflow",
    title: "BookFlow (Service Booking)",
    titleEs: "BookFlow (Reservas de Servicios)",
    tags: ["Bookings", "Payments", "Client-ready"],
    desc: "Ready starter for appointments, reminders, and checkout. Built for salons, clinics, and service teams.",
    descEs:
      "Base lista para citas, recordatorios y pagos. Diseñada para salones, clinicas y equipos de servicios.",
    thumb: workflow01,
    hero: heroImage01,
  },
  {
    slug: "medtrack",
    title: "MedTrack (Medication Manager)",
    titleEs: "MedTrack (Gestor de Medicamentos)",
    tags: ["Health", "Reminders", "Tracking"],
    desc: "Medication scheduling, adherence logs, and refill prompts for personal or family use.",
    descEs:
      "Programacion de medicamentos, registro de adherencia y avisos de resurtido para uso personal o familiar.",
    thumb: workflow02,
    hero: featuresImage,
  },
  {
    slug: "fitcoach",
    title: "FitCoach (Wellness Program)",
    titleEs: "FitCoach (Programa de Bienestar)",
    tags: ["Fitness", "Coaching", "Subscriptions"],
    desc: "Launch a coaching business with client plans, progress check-ins, and recurring billing.",
    descEs:
      "Lanza un negocio de coaching con planes de clientes, seguimiento de progreso y cobros recurrentes.",
    thumb: workflow03,
    hero: worldmapImage,
  },
  {
    slug: "legaldesk",
    title: "LegalDesk (Client Intake)",
    titleEs: "LegalDesk (Captacion de Clientes)",
    tags: ["Leads", "Intake", "Documents"],
    desc: "Modern intake flow for legal teams with lead capture, consultations, and case onboarding.",
    descEs:
      "Flujo moderno de captacion para equipos legales con registro de prospectos, consultas y alta de casos.",
    thumb: carousel01,
    hero: teamMosaic01,
  },
  {
    slug: "learnhub",
    title: "LearnHub (Course Platform)",
    titleEs: "LearnHub (Plataforma de Cursos)",
    tags: ["Courses", "Community", "Payments"],
    desc: "Sell courses with gated content, learner onboarding, and progress-based learning journeys.",
    descEs:
      "Vende cursos con contenido privado, onboarding de alumnos y rutas de aprendizaje por progreso.",
    thumb: carousel02,
    hero: postThumb04,
  },
  {
    slug: "shopboard",
    title: "ShopBoard (Catalog + Orders)",
    titleEs: "ShopBoard (Catalogo + Pedidos)",
    tags: ["Ecommerce", "Catalog", "Orders"],
    desc: "Simple commerce setup for product catalogs, order intake, and status notifications.",
    descEs:
      "Configuracion de comercio simple para catalogos de productos, captura de pedidos y notificaciones de estado.",
    thumb: carousel03,
    hero: postThumb15,
  },
];

export function getTemplateBySlug(slug: string) {
  return templates.find((template) => template.slug === slug);
}
