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
import teamMosaic02 from "@/public/images/team-mosaic-02.jpg";
import postThumb04 from "@/public/images/post-thumb-04.jpg";
import postThumb02 from "@/public/images/post-thumb-02.jpg";
import postThumb01 from "@/public/images/post-thumb-01.jpg";
import postThumb07 from "@/public/images/post-thumb-07.jpg";
import postThumb10 from "@/public/images/post-thumb-10.jpg";
import postThumb11 from "@/public/images/post-thumb-11.jpg";
import postThumb13 from "@/public/images/post-thumb-13.jpg";
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
  {
    slug: "autocare",
    title: "AutoCare (Workshop Booking)",
    titleEs: "AutoCare (Reservas de Taller)",
    tags: ["Automotive", "Scheduling", "CRM"],
    desc: "Manage vehicle appointments, service packages, and customer follow-ups in one flow.",
    descEs:
      "Gestiona citas de vehiculos, paquetes de servicio y seguimientos de clientes en un solo flujo.",
    thumb: postThumb02,
    hero: teamMosaic02,
  },
  {
    slug: "dentapro",
    title: "DentaPro (Clinic Operations)",
    titleEs: "DentaPro (Operaciones de Clinica)",
    tags: ["Healthcare", "Appointments", "Operations"],
    desc: "Coordinate patient bookings, treatment tracking, and front-desk workflows.",
    descEs:
      "Coordina citas de pacientes, seguimiento de tratamientos y flujos operativos de recepcion.",
    thumb: postThumb07,
    hero: featuresImage,
  },
  {
    slug: "propflow",
    title: "PropFlow (Real Estate Leads)",
    titleEs: "PropFlow (Prospectos Inmobiliarios)",
    tags: ["Real Estate", "Leads", "Pipelines"],
    desc: "Capture property leads, track visits, and automate follow-up for closing faster.",
    descEs:
      "Captura prospectos inmobiliarios, gestiona visitas y automatiza seguimientos para cerrar mas rapido.",
    thumb: postThumb10,
    hero: worldmapImage,
  },
  {
    slug: "eventspark",
    title: "EventSpark (Event Planning)",
    titleEs: "EventSpark (Planificacion de Eventos)",
    tags: ["Events", "Tickets", "Automation"],
    desc: "Handle registrations, ticket flows, reminders, and attendee communication.",
    descEs:
      "Gestiona registros, venta de entradas, recordatorios y comunicacion con asistentes.",
    thumb: postThumb13,
    hero: heroImage01,
  },
  {
    slug: "restotable",
    title: "RestoTable (Restaurant Reservations)",
    titleEs: "RestoTable (Reservas de Restaurante)",
    tags: ["Hospitality", "Bookings", "Guest CRM"],
    desc: "Optimize table bookings, shift demand, and VIP guest tracking in one dashboard.",
    descEs:
      "Optimiza reservas de mesas, demanda por turnos y seguimiento de clientes VIP en un panel.",
    thumb: postThumb01,
    hero: postThumb04,
  },
  {
    slug: "staffpulse",
    title: "StaffPulse (HR Requests)",
    titleEs: "StaffPulse (Solicitudes de RRHH)",
    tags: ["HR", "Approvals", "Internal Tools"],
    desc: "Launch an internal portal for employee requests, approvals, and HR operations.",
    descEs:
      "Lanza un portal interno para solicitudes de empleados, aprobaciones y operaciones de RRHH.",
    thumb: postThumb11,
    hero: postThumb15,
  },
];

export function getTemplateBySlug(slug: string) {
  return templates.find((template) => template.slug === slug);
}
