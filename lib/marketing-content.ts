import type { Lang } from "@/lib/translations";

export type ServiceSlug =
  | "ai-automation"
  | "web-development"
  | "crm-systems"
  | "ai-chatbots"
  | "branding"
  | "digital-marketing";

export interface ServiceContent {
  slug: ServiceSlug;
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  promise: string;
  idealFor: string[];
  problems: string[];
  solutions: string[];
  deliverables: string[];
  process: { title: string; text: string }[];
  outcomes: string[];
  integrations: string[];
  faq: { q: string; a: string }[];
  pricingCategory: "websites" | "ai" | "crm" | "branding" | "social";
}

export interface IndustryContent {
  slug: string;
  title: string;
  summary: string;
  challenges: string[];
  solutions: string[];
  recommended: ServiceSlug[];
}

const enServices: ServiceContent[] = [
  {
    slug: "ai-automation",
    title: "AI Automation for Growing Businesses",
    shortTitle: "AI Automation",
    eyebrow: "Work smarter, respond faster",
    summary: "We design practical AI-powered workflows that reduce repetitive work, improve response times, organize information, and help your team move leads and customers forward without relying on constant manual follow-up.",
    promise: "Automation should make your business easier to run, not create another complicated system to manage.",
    idealFor: ["Businesses handling repetitive inquiries", "Teams losing time to manual follow-up", "Companies with disconnected tools", "Owners who need better visibility and faster execution"],
    problems: ["Leads wait too long for a response", "Staff repeat the same administrative steps", "Customer information is copied between systems", "Appointments, reminders, and follow-ups are inconsistent", "Important tasks depend on one person remembering them"],
    solutions: ["Lead capture and intelligent qualification", "Automated email and SMS follow-up", "Appointment scheduling and reminders", "CRM record creation and pipeline updates", "Internal alerts, summaries, and task routing", "Document collection and onboarding sequences"],
    deliverables: ["Workflow discovery and process map", "Automation architecture", "Integration setup", "Prompt and message design", "Testing and exception handling", "Team handoff and operating guidance", "Launch support"],
    process: [
      { title: "Discover", text: "We identify the repetitive work, delays, handoffs, and decisions that can be improved safely." },
      { title: "Design", text: "We map triggers, actions, data flow, approvals, and fallback steps before building." },
      { title: "Build", text: "We connect the approved tools and configure the logic, messages, and routing." },
      { title: "Test", text: "We test realistic scenarios, edge cases, notifications, and failure behavior." },
      { title: "Launch", text: "We deploy, document, and refine the workflow based on real use." },
    ],
    outcomes: ["Faster lead response", "Less repetitive work", "More consistent customer communication", "Cleaner records", "Fewer missed opportunities", "A more scalable operating process"],
    integrations: ["CRM platforms", "Email", "SMS providers", "Scheduling tools", "Forms", "Spreadsheets", "Cloud storage", "Payment and invoicing tools", "AI models and APIs"],
    faq: [
      { q: "Do I need to replace my current software?", a: "Usually no. We first evaluate the tools you already use and build around them when they are suitable." },
      { q: "Can every process be automated?", a: "No. We automate repeatable, well-defined steps and preserve human review where judgment, compliance, or customer care requires it." },
      { q: "Will the automation work without supervision?", a: "Some workflows can run independently, while others should include approvals, alerts, and exception handling. We define that during design." },
    ],
    pricingCategory: "ai",
  },
  {
    slug: "web-development",
    title: "Conversion-Focused Website Development",
    shortTitle: "Web Development",
    eyebrow: "A professional website built to perform",
    summary: "We create fast, mobile-ready websites that present your business clearly, build trust, generate inquiries, and connect visitors with the next step, whether that is booking, calling, requesting a quote, applying, or purchasing.",
    promise: "Your website should look credible, explain your value quickly, and make it easy for the right customer to act.",
    idealFor: ["New businesses launching professionally", "Established companies with outdated websites", "Service businesses that need better lead generation", "Brands that need bilingual or multi-service presentation"],
    problems: ["The website looks dated or generic", "Visitors cannot understand services quickly", "The mobile experience is weak", "Calls to action are unclear", "The site is difficult to update", "The business has no reliable conversion path"],
    solutions: ["Strategic page architecture", "Professional copy and visual hierarchy", "Responsive design", "Lead forms and consultation booking", "Service and industry landing pages", "SEO foundations and metadata", "Analytics-ready structure", "Portal, payment, or CRM integration where required"],
    deliverables: ["Discovery and content strategy", "Sitemap and page structure", "Responsive design", "Complete page development", "Conversion-focused copy", "Contact and booking flows", "Technical SEO basics", "Testing and launch support"],
    process: [
      { title: "Strategy", text: "We define audiences, offers, pages, and the actions the website must generate." },
      { title: "Content", text: "We organize and write clear content around customer questions, trust, and conversion." },
      { title: "Design", text: "We create a polished interface aligned with the brand and user journey." },
      { title: "Development", text: "We build responsive pages, forms, integrations, and technical foundations." },
      { title: "Launch", text: "We test across devices, connect the domain, and verify production behavior." },
    ],
    outcomes: ["Stronger first impression", "Clearer service presentation", "More qualified inquiries", "Better mobile experience", "Improved credibility", "A scalable foundation for future growth"],
    integrations: ["Supabase", "Square", "Scheduling tools", "CRM systems", "Email platforms", "Analytics", "Maps", "Social media", "Cloud storage"],
    faq: [
      { q: "Will you write the website content?", a: "Yes. We can develop the complete content based on your services, audience, brand, and verified business information." },
      { q: "Will the website work on phones?", a: "Yes. Responsive behavior is part of the build and is tested across common screen sizes." },
      { q: "Do hosting and domain costs come with the project?", a: "Third-party hosting, domains, software subscriptions, and platform fees are separate unless specifically included in your written proposal." },
    ],
    pricingCategory: "websites",
  },
  {
    slug: "crm-systems",
    title: "CRM Systems and Sales Pipelines",
    shortTitle: "CRM Systems",
    eyebrow: "Organize leads, clients, and follow-up",
    summary: "We configure practical CRM systems that give your team one place to manage contacts, opportunities, tasks, communications, documents, and pipeline activity.",
    promise: "A CRM should help your team follow a clear process and see what needs attention, not become an expensive address book nobody uses.",
    idealFor: ["Businesses managing leads in spreadsheets", "Teams with inconsistent follow-up", "Companies with multiple sales stages", "Owners who need reporting and accountability"],
    problems: ["Leads are scattered across email, texts, and notebooks", "Team members do not know who owns the next step", "Follow-up is inconsistent", "Pipeline status is unclear", "Customer history is difficult to find"],
    solutions: ["Contact and company records", "Custom opportunity pipelines", "Tasks and reminders", "Automated follow-up", "Lead-source tracking", "Dashboards and reporting", "Role-based access", "Forms and workflow integrations"],
    deliverables: ["CRM requirements map", "Pipeline design", "Field and status configuration", "Automation rules", "User permissions", "Templates and notifications", "Data-import guidance", "Training and launch support"],
    process: [
      { title: "Map", text: "We document how a lead becomes a customer and where delays or confusion occur." },
      { title: "Configure", text: "We create the records, fields, stages, permissions, and views your team needs." },
      { title: "Automate", text: "We add reminders, assignments, messages, and status changes where appropriate." },
      { title: "Migrate", text: "We prepare and import usable data while avoiding unnecessary clutter." },
      { title: "Adopt", text: "We test the process with users and provide guidance for consistent use." },
    ],
    outcomes: ["Centralized customer information", "Clear ownership", "More reliable follow-up", "Improved pipeline visibility", "Better reporting", "A repeatable sales process"],
    integrations: ["Website forms", "Email", "SMS", "Calendar", "Cloud storage", "Accounting tools", "Automation platforms", "Customer support channels"],
    faq: [
      { q: "Can you customize the CRM to our process?", a: "Yes. We design the pipeline, fields, automations, and access rules around the approved workflow." },
      { q: "Can you import our existing data?", a: "We can assist with structured imports when the source data is usable. Cleanup and complex migration may require additional scope." },
      { q: "Is there a monthly cost?", a: "CRM projects may include a setup fee and ongoing monthly service. Third-party platform subscriptions are separate unless stated otherwise." },
    ],
    pricingCategory: "crm",
  },
  {
    slug: "ai-chatbots",
    title: "AI Chatbots and Digital Assistants",
    shortTitle: "AI Chatbots",
    eyebrow: "Helpful answers without making customers wait",
    summary: "We build digital assistants that answer approved questions, collect lead information, guide visitors, support onboarding, and route serious requests to the right person.",
    promise: "A chatbot should be useful, accurate, and transparent about its limits, not an irritating wall between your customer and your team.",
    idealFor: ["Businesses receiving repeated questions", "Websites that need after-hours lead capture", "Teams that need structured intake", "Organizations with extensive service information"],
    problems: ["Visitors leave before receiving an answer", "Staff spend time answering the same questions", "Lead information arrives incomplete", "Requests are routed inconsistently", "After-hours opportunities are missed"],
    solutions: ["Frequently asked question handling", "Lead intake and qualification", "Appointment routing", "Service guidance", "Internal escalation", "Knowledge-base connection", "Bilingual experiences", "Conversation summaries"],
    deliverables: ["Use-case definition", "Conversation design", "Knowledge preparation", "Lead-capture fields", "Escalation rules", "Testing and guardrails", "Website deployment", "Performance review"],
    process: [
      { title: "Define", text: "We determine what the assistant may answer, collect, and escalate." },
      { title: "Prepare", text: "We organize approved information and create clear response boundaries." },
      { title: "Build", text: "We configure the conversation, forms, routing, and integrations." },
      { title: "Test", text: "We test expected questions, ambiguous requests, and unsupported scenarios." },
      { title: "Improve", text: "We review real interactions and refine approved content over time." },
    ],
    outcomes: ["Faster initial response", "More complete inquiries", "Reduced repetitive questions", "Better after-hours coverage", "Consistent routing", "Improved customer experience"],
    integrations: ["Websites", "CRM", "Scheduling", "Email", "SMS", "Knowledge bases", "Support inboxes", "Internal notifications"],
    faq: [
      { q: "Can the chatbot answer anything?", a: "No. It should answer within an approved scope and escalate when information is uncertain, sensitive, or requires professional judgment." },
      { q: "Can it work in English and Spanish?", a: "Yes. Bilingual conversation design can be included based on the project requirements." },
      { q: "Can it schedule appointments?", a: "Yes, when connected to a compatible scheduling system and configured with the correct availability rules." },
    ],
    pricingCategory: "ai",
  },
  {
    slug: "branding",
    title: "Branding and Digital Identity",
    shortTitle: "Branding",
    eyebrow: "Look established, consistent, and memorable",
    summary: "We create professional visual identities and practical brand materials that help customers recognize your business and trust what they see across digital and printed channels.",
    promise: "Good branding gives your business a consistent professional presence without making it look like every template on the internet.",
    idealFor: ["New businesses", "Companies rebranding", "Businesses with inconsistent materials", "Service providers preparing to market professionally"],
    problems: ["The logo looks outdated or low quality", "Colors and fonts change across materials", "Marketing pieces do not feel connected", "The brand is difficult to reproduce", "The business does not look as credible as the service it provides"],
    solutions: ["Logo design and refinement", "Color and typography system", "Business cards and stationery", "Social-media templates", "Flyers and promotional materials", "Brand-guideline documentation", "Digital asset preparation"],
    deliverables: ["Creative direction", "Primary logo", "Alternate logo or mark where included", "Color palette", "Typography guidance", "Exported file package", "Selected collateral", "Usage guidance"],
    process: [
      { title: "Discover", text: "We understand the business, audience, positioning, and visual preferences." },
      { title: "Direction", text: "We establish a clear creative direction before final refinement." },
      { title: "Design", text: "We create and refine the selected identity and supporting materials." },
      { title: "Prepare", text: "We export practical formats for web, print, and social use." },
      { title: "Apply", text: "We can extend the identity across websites, social media, and marketing pieces." },
    ],
    outcomes: ["Professional presentation", "Stronger recognition", "Consistent marketing", "Better-quality assets", "More confident promotion", "A foundation for future campaigns"],
    integrations: ["Website design", "Social media", "Print materials", "Email signatures", "Presentation templates", "Digital advertising"],
    faq: [
      { q: "Will I receive usable files?", a: "Yes. Deliverables are provided in practical formats appropriate to the purchased package." },
      { q: "Can you update an existing logo?", a: "Yes. Depending on the condition of the source files, we can refine, redraw, or modernize an existing identity." },
      { q: "Do printing costs come with the design?", a: "Printing and third-party production costs are separate unless included in a written proposal." },
    ],
    pricingCategory: "branding",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing and Social Media",
    shortTitle: "Digital Marketing",
    eyebrow: "Build a consistent presence customers can trust",
    summary: "We help businesses establish and maintain a clear digital presence through account setup, content systems, branded creative, campaigns, and practical marketing support.",
    promise: "Marketing should communicate your value consistently and create measurable opportunities, not merely fill a calendar with generic posts.",
    idealFor: ["Businesses starting social media", "Companies with inconsistent branding", "Owners without time to manage content", "Service businesses that need regular visibility"],
    problems: ["Profiles are incomplete or inconsistent", "Content is posted without strategy", "Branding changes from post to post", "Calls to action are weak", "The business disappears online for weeks at a time"],
    solutions: ["Profile setup and optimization", "Content planning", "Branded posts and captions", "Campaign landing pages", "Lead-generation calls to action", "Review and reputation workflows", "Performance reporting where included"],
    deliverables: ["Channel review", "Profile optimization", "Content direction", "Branded creative", "Caption writing", "Publishing plan", "Campaign support", "Monthly review where included"],
    process: [
      { title: "Audit", text: "We review current channels, audience, offers, brand consistency, and conversion paths." },
      { title: "Plan", text: "We define content themes, calls to action, and a realistic publishing approach." },
      { title: "Create", text: "We produce approved branded content and supporting copy." },
      { title: "Publish", text: "Content is scheduled or delivered according to the agreed service." },
      { title: "Refine", text: "We review activity and improve the next cycle based on useful signals." },
    ],
    outcomes: ["More consistent visibility", "Clearer brand presentation", "Stronger calls to action", "Better campaign organization", "Reduced owner workload", "A repeatable content system"],
    integrations: ["Facebook", "Instagram", "LinkedIn", "Google Business Profile", "Landing pages", "Email campaigns", "CRM", "Review platforms"],
    faq: [
      { q: "Do you guarantee followers or sales?", a: "No. We provide professional strategy, content, setup, and management, but platform performance and customer decisions cannot be guaranteed." },
      { q: "Can you create the graphics and captions?", a: "Yes. Creative and copy are included according to the selected package and approved content plan." },
      { q: "Are advertising costs included?", a: "Advertising spend and third-party platform fees are separate from management or creative fees unless explicitly stated." },
    ],
    pricingCategory: "social",
  },
];

const esServices: ServiceContent[] = enServices.map((s) => ({ ...s }));
// Spanish content is intentionally authored below rather than machine-translated at render time.
Object.assign(esServices[0]!, { title: "Automatización con IA para negocios en crecimiento", shortTitle: "Automatización con IA", eyebrow: "Trabaje mejor y responda más rápido", summary: "Diseñamos flujos de trabajo prácticos con inteligencia artificial que reducen tareas repetitivas, mejoran los tiempos de respuesta, organizan información y ayudan a su equipo a avanzar prospectos y clientes sin depender de seguimiento manual constante.", promise: "La automatización debe facilitar la operación de su negocio, no crear otro sistema complicado que administrar." });
Object.assign(esServices[1]!, { title: "Desarrollo de sitios web enfocados en conversión", shortTitle: "Desarrollo Web", eyebrow: "Un sitio profesional creado para funcionar", summary: "Creamos sitios web rápidos y adaptados a dispositivos móviles que presentan su negocio con claridad, generan confianza y facilitan que el visitante reserve, llame, solicite una cotización, aplique o compre.", promise: "Su sitio debe verse confiable, explicar su valor rápidamente y facilitar que el cliente correcto tome acción." });
Object.assign(esServices[2]!, { title: "Sistemas CRM y procesos de ventas", shortTitle: "Sistemas CRM", eyebrow: "Organice prospectos, clientes y seguimiento", summary: "Configuramos sistemas CRM prácticos para administrar contactos, oportunidades, tareas, comunicaciones, documentos y actividad comercial en un solo lugar.", promise: "Un CRM debe ayudar a su equipo a seguir un proceso claro, no convertirse en una libreta costosa que nadie usa." });
Object.assign(esServices[3]!, { title: "Chatbots con IA y asistentes digitales", shortTitle: "Chatbots con IA", eyebrow: "Respuestas útiles sin hacer esperar al cliente", summary: "Creamos asistentes digitales que responden preguntas aprobadas, recopilan información, orientan al visitante y dirigen solicitudes importantes a la persona correcta.", promise: "Un chatbot debe ser útil, preciso y transparente sobre sus límites." });
Object.assign(esServices[4]!, { title: "Marca e identidad digital", shortTitle: "Branding", eyebrow: "Proyecte una imagen establecida, coherente y memorable", summary: "Creamos identidades visuales y materiales prácticos que ayudan a los clientes a reconocer su negocio y confiar en lo que ven en canales digitales e impresos.", promise: "Una buena marca ofrece una presencia profesional y consistente sin parecer una plantilla genérica." });
Object.assign(esServices[5]!, { title: "Marketing digital y redes sociales", shortTitle: "Marketing Digital", eyebrow: "Construya una presencia consistente y confiable", summary: "Ayudamos a los negocios a establecer y mantener una presencia digital clara mediante configuración de cuentas, sistemas de contenido, diseños de marca, campañas y apoyo práctico de marketing.", promise: "El marketing debe comunicar su valor y crear oportunidades, no solamente llenar un calendario con publicaciones genéricas." });

export const servicesByLang: Record<Lang, ServiceContent[]> = { en: enServices, es: esServices };
export const serviceSlugs = enServices.map((service) => service.slug);
export function getService(lang: Lang, slug: string) { return servicesByLang[lang].find((service) => service.slug === slug); }

export const industriesByLang: Record<Lang, IndustryContent[]> = {
  en: [
    { slug: "professional-services", title: "Professional Services", summary: "Websites, intake, CRM, scheduling, document collection, and follow-up systems for accounting, tax, legal-support, consulting, insurance, and other client-service businesses.", challenges: ["Complex services are difficult to explain", "Prospects arrive with incomplete information", "Follow-up depends on manual reminders"], solutions: ["Service landing pages", "Consultation booking", "Structured intake", "CRM pipelines", "Document workflows"], recommended: ["web-development", "crm-systems", "ai-automation"] },
    { slug: "home-services", title: "Home and Local Services", summary: "Lead-focused websites and follow-up systems for contractors, cleaning companies, landscaping, painting, repair, and property-service businesses.", challenges: ["Missed calls become lost jobs", "Quote requests lack useful details", "Photos and service areas are difficult to manage"], solutions: ["Quote-request flows", "Missed-call follow-up", "Service-area pages", "Project galleries", "Review requests"], recommended: ["web-development", "ai-automation", "digital-marketing"] },
    { slug: "restaurants-retail", title: "Restaurants and Retail", summary: "Digital experiences that help customers find information, view offerings, visit locations, place inquiries, and stay connected.", challenges: ["Information changes frequently", "Customers need fast mobile access", "Multiple locations or offers create confusion"], solutions: ["Mobile menus and catalogs", "Location pages", "Promotional landing pages", "Customer messaging", "Social content systems"], recommended: ["web-development", "digital-marketing", "ai-chatbots"] },
    { slug: "beauty-wellness", title: "Beauty, Wellness, and Personal Care", summary: "Booking-focused websites, branding, client communication, and retention workflows for salons, barbershops, studios, and wellness providers.", challenges: ["Appointments are lost through slow replies", "Brand presentation is inconsistent", "Clients forget appointments or rebooking"], solutions: ["Booking integration", "Automated reminders", "Service galleries", "Brand systems", "Rebooking workflows"], recommended: ["web-development", "branding", "ai-automation"] },
    { slug: "startups", title: "Startups and New Businesses", summary: "A coordinated launch foundation covering brand, website, systems, customer intake, and scalable operating workflows.", challenges: ["Too many disconnected setup decisions", "Limited credibility at launch", "Processes are improvised"], solutions: ["Brand foundation", "Launch website", "Lead capture", "CRM setup", "Automation roadmap"], recommended: ["branding", "web-development", "crm-systems"] },
    { slug: "multilingual-businesses", title: "Bilingual and Multilingual Businesses", summary: "English and Spanish digital experiences designed for businesses serving diverse customers across the United States.", challenges: ["Translations feel inconsistent", "Customers cannot find information in their preferred language", "Forms and follow-up do not preserve language choice"], solutions: ["Bilingual websites", "Language-aware forms", "Bilingual chat assistants", "Translated campaigns", "Consistent terminology"], recommended: ["web-development", "ai-chatbots", "digital-marketing"] },
  ],
  es: [],
};
industriesByLang.es = industriesByLang.en.map((i) => ({ ...i }));

export const pageCopy = {
  en: {
    home: { eyebrow: "Digital systems for modern businesses", title: "Build a business that responds faster, operates smarter, and looks ready for growth.", description: "VYNTEX combines strategy, design, development, automation, and practical technology to help businesses attract clients, organize operations, and scale with confidence.", primary: "Explore Services", secondary: "Book a Free Consultation" },
    services: { eyebrow: "Connected technology services", title: "Technology Services That Work Better Together", description: "Choose one focused service or let Vyntex connect your website, CRM, communication, automation, branding, and marketing into one organized system built around your business." },
    industries: { eyebrow: "Built around your workflow", title: "Solutions for service-driven and growing businesses", description: "We adapt the strategy and technology to the way your customers buy and the way your team actually works." },
    about: { eyebrow: "About VYNTEX", title: "Practical technology, professional execution, and human support", intro: "VYNTEX is a Northfield, New Jersey digital technology company serving businesses across the United States in English and Spanish.", body: ["We help owners replace fragmented digital tools and inconsistent customer experiences with clear websites, organized systems, and thoughtfully designed automations.", "Our work begins with the business problem, not the software. We identify what customers need, where the team loses time, and which systems can create the greatest practical improvement.", "Every project is scoped around verified requirements. We communicate clearly about labor, third-party costs, support, limitations, and the responsibilities required for a successful launch."], values: ["Clarity before complexity", "Professional design with practical purpose", "Secure and responsible implementation", "Bilingual service", "Long-term systems, not temporary tricks"] },
    process: { eyebrow: "How we work", title: "A disciplined path from idea to launch", description: "Every project follows a clear process so decisions are documented, expectations are aligned, and the final system is usable in the real world." },
    contact: { eyebrow: "Start the conversation", title: "Tell us what you want to improve", description: "Share your goals, current challenges, and the systems you already use. We will help identify the most practical next step." },
  },
  es: {
    home: { eyebrow: "Sistemas digitales para negocios modernos", title: "Construya un negocio que responda más rápido, opere mejor y esté preparado para crecer.", description: "VYNTEX combina estrategia, diseño, desarrollo, automatización y tecnología práctica para ayudar a los negocios a atraer clientes, organizar operaciones y crecer con confianza.", primary: "Explorar Servicios", secondary: "Agenda tu Consulta Gratis" },
    services: { eyebrow: "Servicios tecnológicos conectados", title: "Servicios de Tecnología que Funcionan Mejor Juntos", description: "Elija un servicio específico o permita que Vyntex conecte su sitio web, CRM, comunicación, automatización, marca y marketing en un sistema organizado alrededor de su negocio." },
    industries: { eyebrow: "Adaptado a su operación", title: "Soluciones para negocios de servicios y empresas en crecimiento", description: "Adaptamos la estrategia y la tecnología a la forma en que sus clientes compran y su equipo realmente trabaja." },
    about: { eyebrow: "Acerca de VYNTEX", title: "Tecnología práctica, ejecución profesional y apoyo humano", intro: "VYNTEX es una empresa de tecnología digital ubicada en Northfield, Nueva Jersey, que atiende negocios en todo Estados Unidos en inglés y español.", body: ["Ayudamos a los dueños a reemplazar herramientas desconectadas y experiencias inconsistentes con sitios claros, sistemas organizados y automatizaciones bien diseñadas.", "Nuestro trabajo comienza con el problema del negocio, no con el software. Identificamos lo que necesita el cliente, dónde pierde tiempo el equipo y qué sistemas pueden producir una mejora práctica.", "Cada proyecto se define según requisitos verificados. Comunicamos claramente el alcance, costos de terceros, apoyo, limitaciones y responsabilidades necesarias para un lanzamiento exitoso."], values: ["Claridad antes que complejidad", "Diseño profesional con propósito", "Implementación segura y responsable", "Servicio bilingüe", "Sistemas duraderos"] },
    process: { eyebrow: "Cómo trabajamos", title: "Un proceso claro desde la idea hasta el lanzamiento", description: "Cada proyecto sigue un proceso definido para documentar decisiones, alinear expectativas y entregar un sistema útil." },
    contact: { eyebrow: "Comience la conversación", title: "Cuéntenos qué desea mejorar", description: "Comparta sus metas, desafíos actuales y herramientas existentes. Le ayudaremos a identificar el siguiente paso más práctico." },
  },
} as const;
