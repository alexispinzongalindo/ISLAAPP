import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateBySlug, templates } from "@/app/templates/template-catalog";

type TemplatePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return templates.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) {
    return {
      title: "Template Not Found - islaAPP",
      description: "The selected template could not be found.",
    };
  }

  return {
    title: `${template.title} - islaAPP`,
    description: template.desc,
  };
}

type DemoModule = {
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
};

type DemoContent = {
  summaryEn: string;
  summaryEs: string;
  modules: DemoModule[];
  stepsEn: string[];
  stepsEs: string[];
};

function getDemoContent(slug: string): DemoContent {
  switch (slug) {
    case "medtrack":
      return {
        summaryEn: "Medication operations flow with reminders, adherence tracking, and refill control.",
        summaryEs: "Flujo de operacion de medicamentos con recordatorios, adherencia y control de resurtido.",
        modules: [
          {
            titleEn: "Medication schedule",
            titleEs: "Programacion de medicamentos",
            descEn: "Set dose times, frequency, and patient-safe instructions.",
            descEs: "Define horarios, frecuencia e instrucciones seguras para el paciente.",
          },
          {
            titleEn: "Adherence timeline",
            titleEs: "Linea de adherencia",
            descEn: "Track taken, skipped, and delayed doses in one timeline.",
            descEs: "Registra dosis tomadas, omitidas y retrasadas en una sola linea.",
          },
          {
            titleEn: "Refill alerts",
            titleEs: "Alertas de resurtido",
            descEn: "Predict low supply and notify before medication runs out.",
            descEs: "Predice bajo inventario y avisa antes de que se termine.",
          },
        ],
        stepsEn: [
          "Create patient profile and baseline medication list.",
          "Activate reminder schedule and intake logging.",
          "Review adherence report and refill recommendations.",
        ],
        stepsEs: [
          "Crear perfil del paciente y lista base de medicamentos.",
          "Activar programacion de recordatorios y registro de tomas.",
          "Revisar reporte de adherencia y recomendaciones de resurtido.",
        ],
      };
    case "fitcoach":
      return {
        summaryEn: "Coaching funnel with lead capture, onboarding, and recurring client management.",
        summaryEs: "Embudo de coaching con captacion, onboarding y gestion recurrente de clientes.",
        modules: [
          {
            titleEn: "Program builder",
            titleEs: "Constructor de programas",
            descEn: "Package nutrition, training, and check-in sequences by goal.",
            descEs: "Empaqueta nutricion, entrenamiento y seguimientos por objetivo.",
          },
          {
            titleEn: "Client dashboard",
            titleEs: "Panel del cliente",
            descEn: "Track metrics, milestones, and pending actions.",
            descEs: "Monitorea metricas, hitos y acciones pendientes.",
          },
          {
            titleEn: "Subscription billing",
            titleEs: "Cobro por suscripcion",
            descEn: "Manage plans, renewals, and payment status.",
            descEs: "Gestiona planes, renovaciones y estado de pagos.",
          },
        ],
        stepsEn: [
          "Capture lead and assign a coaching track.",
          "Launch onboarding checklist with first-week actions.",
          "Run weekly progress review with retention prompts.",
        ],
        stepsEs: [
          "Capturar prospecto y asignar ruta de coaching.",
          "Lanzar checklist de onboarding con acciones de la primera semana.",
          "Ejecutar revision semanal con acciones de retencion.",
        ],
      };
    case "clinic":
      return {
        summaryEn: "HIPAA-friendly patient intake, provider scheduling, and SMS reminders in one clinic flow.",
        summaryEs: "Intake HIPAA, agenda de proveedores y recordatorios SMS en un solo flujo de clinica.",
        modules: [
          {
            titleEn: "Patient intake",
            titleEs: "Ingreso de pacientes",
            descEn: "Insurance, history, medications, allergies, HIPAA consent with e-sign.",
            descEs: "Seguro, historial, medicamentos, alergias, consentimiento HIPAA con firma.",
          },
          {
            titleEn: "Appointment booking",
            titleEs: "Agenda de citas",
            descEn: "Departments, providers with credentials, real-time slots, visit type.",
            descEs: "Departamentos, doctores con credenciales, horarios en tiempo real, tipo de cita.",
          },
          {
            titleEn: "Reminders & compliance",
            titleEs: "Recordatorios y cumplimiento",
            descEn: "SMS/email opt-in, HIPAA badges, encrypted submission messaging.",
            descEs: "Opt-in SMS/email, insignias HIPAA, mensajeria de envio cifrado.",
          },
        ],
        stepsEn: [
          "Start new patient registration and collect HIPAA consent.",
          "Pick department, provider, and slot; choose visit type.",
          "Enable SMS reminders and confirm secure submission.",
        ],
        stepsEs: [
          "Iniciar alta de paciente y recolectar consentimiento HIPAA.",
          "Elegir departamento, doctor y horario; seleccionar tipo de cita.",
          "Activar recordatorios SMS y confirmar envio seguro.",
        ],
      };
    case "legaldesk":
      return {
        summaryEn: "Legal intake workflow from lead qualification to case onboarding.",
        summaryEs: "Flujo legal de captacion desde calificacion hasta alta de caso.",
        modules: [
          {
            titleEn: "Lead qualification",
            titleEs: "Calificacion de prospectos",
            descEn: "Collect case intent and score high-priority opportunities.",
            descEs: "Captura intencion del caso y puntua oportunidades prioritarias.",
          },
          {
            titleEn: "Consultation booking",
            titleEs: "Reserva de consulta",
            descEn: "Automate consult slots and pre-consult questionnaires.",
            descEs: "Automatiza cupos de consulta y cuestionarios previos.",
          },
          {
            titleEn: "Case onboarding",
            titleEs: "Alta del caso",
            descEn: "Move approved leads into active case pipelines.",
            descEs: "Convierte prospectos aprobados en casos activos.",
          },
        ],
        stepsEn: [
          "Capture legal request with intake form.",
          "Auto-route to consultation and document checklist.",
          "Approve and convert to active case workflow.",
        ],
        stepsEs: [
          "Capturar solicitud legal con formulario de ingreso.",
          "Enrutar automaticamente a consulta y checklist documental.",
          "Aprobar y convertir a flujo de caso activo.",
        ],
      };
    case "learnhub":
      return {
        summaryEn: "Course platform demo with enrollment, content unlocks, and learner progress.",
        summaryEs: "Demo de cursos con inscripcion, desbloqueo de contenido y progreso del alumno.",
        modules: [
          {
            titleEn: "Program catalog",
            titleEs: "Catalogo de programas",
            descEn: "Organize offers by level, cohort, and outcomes.",
            descEs: "Organiza ofertas por nivel, cohorte y resultados.",
          },
          {
            titleEn: "Lesson progression",
            titleEs: "Progreso de lecciones",
            descEn: "Gate content by completion and milestone rules.",
            descEs: "Habilita contenido por reglas de finalizacion e hitos.",
          },
          {
            titleEn: "Community prompts",
            titleEs: "Dinamicas de comunidad",
            descEn: "Trigger engagement prompts and accountability loops.",
            descEs: "Activa dinamicas de participacion y rendicion de cuentas.",
          },
        ],
        stepsEn: [
          "Publish learning tracks and enrollment rules.",
          "Onboard student and unlock first module.",
          "Track completion and issue progression actions.",
        ],
        stepsEs: [
          "Publicar rutas de aprendizaje y reglas de inscripcion.",
          "Dar onboarding al alumno y desbloquear primer modulo.",
          "Monitorear finalizacion y emitir acciones de avance.",
        ],
      };
    case "shopboard":
      return {
        summaryEn: "Commerce-ready flow for catalogs, order intake, and order-status communication.",
        summaryEs: "Flujo de comercio para catalogos, toma de pedidos y comunicacion de estado.",
        modules: [
          {
            titleEn: "Product catalog",
            titleEs: "Catalogo de productos",
            descEn: "Publish products with grouped collections and variants.",
            descEs: "Publica productos con colecciones y variantes.",
          },
          {
            titleEn: "Order intake",
            titleEs: "Captura de pedidos",
            descEn: "Capture order details and payment confirmation state.",
            descEs: "Registra detalles del pedido y confirmacion de pago.",
          },
          {
            titleEn: "Status updates",
            titleEs: "Actualizaciones de estado",
            descEn: "Notify customers at packing, shipping, and delivery milestones.",
            descEs: "Notifica al cliente en hitos de empaque, envio y entrega.",
          },
        ],
        stepsEn: [
          "Set collections, products, and pricing blocks.",
          "Launch order form and checkout routing.",
          "Run fulfillment queue and status notifications.",
        ],
        stepsEs: [
          "Definir colecciones, productos y precios.",
          "Lanzar formulario de pedido y ruta de checkout.",
          "Ejecutar cola de despacho y notificaciones de estado.",
        ],
      };
    case "autocare":
      return {
        summaryEn: "Service workshop demo with booking windows, job cards, and customer updates.",
        summaryEs: "Demo de taller con ventanas de reserva, ordenes de trabajo y avisos al cliente.",
        modules: [
          {
            titleEn: "Service booking",
            titleEs: "Reserva de servicios",
            descEn: "Offer service slots by mechanic, bay, and urgency.",
            descEs: "Ofrece cupos por mecanico, bahia y urgencia.",
          },
          {
            titleEn: "Job card tracking",
            titleEs: "Seguimiento de ordenes",
            descEn: "Track diagnostics, parts, and work progress in real time.",
            descEs: "Monitorea diagnostico, repuestos y avance en tiempo real.",
          },
          {
            titleEn: "Customer follow-up",
            titleEs: "Seguimiento al cliente",
            descEn: "Send status and pickup readiness updates automatically.",
            descEs: "Envia estado y aviso de retiro automaticamente.",
          },
        ],
        stepsEn: [
          "Book vehicle with service intent.",
          "Open job card and assign technician.",
          "Close service and trigger pickup/update flow.",
        ],
        stepsEs: [
          "Reservar vehiculo con motivo de servicio.",
          "Abrir orden de trabajo y asignar tecnico.",
          "Cerrar servicio y activar flujo de retiro/actualizacion.",
        ],
      };
    case "dentapro":
      return {
        summaryEn: "Dental clinic operations flow from appointment intake to treatment follow-up.",
        summaryEs: "Flujo de clinica dental desde ingreso de cita hasta seguimiento de tratamiento.",
        modules: [
          {
            titleEn: "Patient intake",
            titleEs: "Ingreso de pacientes",
            descEn: "Capture patient profile, history, and treatment needs.",
            descEs: "Captura perfil, historial y necesidades de tratamiento.",
          },
          {
            titleEn: "Chair scheduling",
            titleEs: "Programacion de sillones",
            descEn: "Balance practitioner availability and room usage.",
            descEs: "Balancea disponibilidad de doctores y uso de salas.",
          },
          {
            titleEn: "Treatment follow-up",
            titleEs: "Seguimiento clinico",
            descEn: "Automate follow-up reminders and next-visit planning.",
            descEs: "Automatiza recordatorios y planificacion de siguientes visitas.",
          },
        ],
        stepsEn: [
          "Capture consultation request and patient history.",
          "Assign schedule and treatment path.",
          "Track outcomes and trigger follow-up cadence.",
        ],
        stepsEs: [
          "Capturar solicitud de consulta e historial del paciente.",
          "Asignar agenda y ruta de tratamiento.",
          "Monitorear resultados y activar cadencia de seguimiento.",
        ],
      };
    case "propflow":
      return {
        summaryEn: "Lead-to-visit pipeline for agents managing listings and buyer demand.",
        summaryEs: "Pipeline de prospecto a visita para agentes con propiedades y compradores.",
        modules: [
          {
            titleEn: "Property lead forms",
            titleEs: "Formularios de prospectos",
            descEn: "Capture buyer/renter intent from campaigns and listing pages.",
            descEs: "Captura intencion de compra/alquiler desde campañas y listados.",
          },
          {
            titleEn: "Visit scheduling",
            titleEs: "Programacion de visitas",
            descEn: "Coordinate property tours and agent availability.",
            descEs: "Coordina recorridos y disponibilidad del agente.",
          },
          {
            titleEn: "Offer pipeline",
            titleEs: "Pipeline de ofertas",
            descEn: "Track negotiation stages and closure probability.",
            descEs: "Monitorea etapas de negociacion y probabilidad de cierre.",
          },
        ],
        stepsEn: [
          "Capture lead from listing funnel.",
          "Schedule visit and pre-qualification call.",
          "Advance lead through offer and close stages.",
        ],
        stepsEs: [
          "Capturar prospecto desde el embudo de publicaciones.",
          "Programar visita y llamada de pre-calificacion.",
          "Avanzar prospecto por etapas de oferta y cierre.",
        ],
      };
    case "eventspark":
      return {
        summaryEn: "Event operations stack for registration, ticketing, and attendee messaging.",
        summaryEs: "Stack de eventos para registro, boletaje y comunicacion con asistentes.",
        modules: [
          {
            titleEn: "Registration portal",
            titleEs: "Portal de registro",
            descEn: "Manage attendee onboarding and ticket types.",
            descEs: "Gestiona alta de asistentes y tipos de ticket.",
          },
          {
            titleEn: "Session planner",
            titleEs: "Planificador de sesiones",
            descEn: "Structure agendas and speaker timelines.",
            descEs: "Estructura agendas y cronograma de speakers.",
          },
          {
            titleEn: "Event reminders",
            titleEs: "Recordatorios del evento",
            descEn: "Automate confirmations, reminders, and day-of instructions.",
            descEs: "Automatiza confirmaciones, recordatorios e instrucciones del dia.",
          },
        ],
        stepsEn: [
          "Launch registration and ticket setup.",
          "Configure sessions and attendee tracks.",
          "Run reminder flow before and during event.",
        ],
        stepsEs: [
          "Lanzar registro y configuracion de tickets.",
          "Configurar sesiones y rutas de asistentes.",
          "Ejecutar recordatorios antes y durante el evento.",
        ],
      };
    case "restotable":
      return {
        summaryEn: "Restaurant booking system with table allocation and guest lifecycle tracking.",
        summaryEs: "Sistema de reservas de restaurante con asignacion de mesas y ciclo del cliente.",
        modules: [
          {
            titleEn: "Table scheduling",
            titleEs: "Programacion de mesas",
            descEn: "Allocate parties by time, table type, and service load.",
            descEs: "Asigna grupos por horario, tipo de mesa y carga operativa.",
          },
          {
            titleEn: "Guest profiles",
            titleEs: "Perfiles de clientes",
            descEn: "Track preferences, allergies, and visit frequency.",
            descEs: "Registra preferencias, alergias y frecuencia de visitas.",
          },
          {
            titleEn: "Service alerts",
            titleEs: "Alertas operativas",
            descEn: "Notify team for arrivals, delays, and priority guests.",
            descEs: "Notifica al equipo por llegadas, retrasos y clientes prioritarios.",
          },
        ],
        stepsEn: [
          "Capture reservation request.",
          "Confirm slot and table assignment.",
          "Run service notifications and post-visit retention.",
        ],
        stepsEs: [
          "Capturar solicitud de reserva.",
          "Confirmar horario y asignacion de mesa.",
          "Ejecutar notificaciones y retencion post-visita.",
        ],
      };
    case "staffpulse":
      return {
        summaryEn: "Internal HR workflow for requests, approvals, and employee communication.",
        summaryEs: "Flujo interno de RRHH para solicitudes, aprobaciones y comunicacion.",
        modules: [
          {
            titleEn: "Employee requests",
            titleEs: "Solicitudes de empleados",
            descEn: "Centralize PTO, letters, reimbursements, and internal requests.",
            descEs: "Centraliza permisos, cartas, reembolsos y solicitudes internas.",
          },
          {
            titleEn: "Approval routing",
            titleEs: "Rutas de aprobacion",
            descEn: "Automate manager and HR approval layers.",
            descEs: "Automatiza capas de aprobacion de manager y RRHH.",
          },
          {
            titleEn: "Policy communication",
            titleEs: "Comunicacion de politicas",
            descEn: "Publish updates and action-required notices by segment.",
            descEs: "Publica actualizaciones y avisos por segmentos.",
          },
        ],
        stepsEn: [
          "Submit internal request with required fields.",
          "Route for approval and status updates.",
          "Close request with employee confirmation.",
        ],
        stepsEs: [
          "Enviar solicitud interna con campos obligatorios.",
          "Enrutar aprobacion y actualizaciones de estado.",
          "Cerrar solicitud con confirmacion del empleado.",
        ],
      };
    default:
      return {
        summaryEn: "Service-first template flow for lead capture, operations, and client communication.",
        summaryEs: "Flujo base orientado a servicios para captacion, operaciones y comunicacion.",
        modules: [
          {
            titleEn: "Client intake",
            titleEs: "Ingreso de clientes",
            descEn: "Capture and qualify incoming requests quickly.",
            descEs: "Captura y califica solicitudes rapidamente.",
          },
          {
            titleEn: "Operations board",
            titleEs: "Panel operativo",
            descEn: "Track active tasks and fulfillment progress.",
            descEs: "Monitorea tareas activas y avance de ejecucion.",
          },
          {
            titleEn: "Follow-up automation",
            titleEs: "Automatizacion de seguimiento",
            descEn: "Keep clients informed with automated updates.",
            descEs: "Mantiene clientes informados con actualizaciones automaticas.",
          },
        ],
        stepsEn: [
          "Capture request and qualify lead.",
          "Activate core operational workflow.",
          "Close loop with progress and outcomes.",
        ],
        stepsEs: [
          "Capturar solicitud y calificar prospecto.",
          "Activar flujo operativo central.",
          "Cerrar ciclo con progreso y resultados.",
        ],
      };
  }
}

export default async function TemplateDetailPage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const agentHref = `/agent?template=${template.slug}&source=template_detail`;
  const demo = getDemoContent(template.slug);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-indigo-300/80">
          <span data-i18n-en="islaAPP Template" data-i18n-es="Plantilla islaAPP">islaAPP Template</span>
        </p>
        <h1
          className="text-3xl font-semibold text-gray-100 md:text-4xl"
          data-i18n-en={template.title}
          data-i18n-es={template.titleEs}
        >
          {template.title}
        </h1>
        <p
          className="mx-auto mt-3 max-w-2xl text-indigo-200/70"
          data-i18n-en={template.desc}
          data-i18n-es={template.descEs}
        >
          {template.desc}
        </p>
        <p
          className="mx-auto mt-3 max-w-3xl text-sm text-indigo-200/55"
          data-i18n-en={demo.summaryEn}
          data-i18n-es={demo.summaryEs}
        >
          {demo.summaryEn}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70">
        <Image
          src={template.hero}
          alt={`${template.title} template preview`}
          className="h-[340px] w-full object-cover md:h-[460px]"
          priority
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {demo.modules.map((module) => (
          <div key={module.titleEn} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
            <h3
              className="text-sm font-semibold text-gray-100"
              data-i18n-en={module.titleEn}
              data-i18n-es={module.titleEs}
            >
              {module.titleEn}
            </h3>
            <p
              className="mt-2 text-sm text-indigo-200/70"
              data-i18n-en={module.descEn}
              data-i18n-es={module.descEs}
            >
              {module.descEn}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
        <h2 className="text-base font-semibold text-gray-100" data-i18n-en="Live Demo Flow" data-i18n-es="Flujo Demo en Vivo">
          Live Demo Flow
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {demo.stepsEn.map((step, index) => (
            <div key={`${template.slug}-step-${index}`} className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-indigo-300/70">Step {index + 1}</p>
              <p
                className="mt-2 text-sm text-indigo-100/85"
                data-i18n-en={step}
                data-i18n-es={demo.stepsEs[index]}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {["bookflow", "medtrack", "fitcoach", "restaurant", "spa", "clinic", "dental", "law", "real-estate", "habits"].includes(template.slug) && (
          <Link
            href={`/live/${template.slug}`}
            className="btn-sm bg-gray-800 text-center text-white hover:bg-gray-700"
            data-i18n-en="Live Demo"
            data-i18n-es="Demo en vivo"
          >
            Live Demo
          </Link>
        )}
        <a
          href={agentHref}
          className="btn-sm bg-indigo-600 text-center text-white hover:bg-indigo-500"
          data-i18n-en="Start With This Template"
          data-i18n-es="Comenzar con esta plantilla"
        >
          Start With This Template
        </a>
        <a
          href={agentHref}
          className="btn-sm border border-gray-700 bg-gray-800 text-center text-white hover:bg-gray-700"
          data-i18n-en="Open AI Agent"
          data-i18n-es="Abrir agente IA"
        >
          Open AI Agent
        </a>
      </div>

      <div className="mt-6">
        <Link href="/templates" className="text-sm text-indigo-300 hover:text-indigo-200">
          <span data-i18n-en="Back to Template Gallery" data-i18n-es="Volver a la Galeria de Plantillas">Back to Template Gallery</span>
        </Link>
      </div>
    </section>
  );
}
