export const SPECIES = [
  "Perros", "Gatos", "Equinos", "Bovinos", "Ovinos y caprinos", "Porcinos",
  "Camélidos", "Aves", "Exóticos", "Fauna silvestre", "Animales no convencionales",
];

export const SPECIALTIES_GROUPED = [
  { category: "Medicina de pequeños animales", items: ["Medicina interna", "Cardiología", "Neurología", "Dermatología", "Oftalmología", "Oncología", "Endocrinología", "Gastroenterología", "Nefrología", "Urología", "Neumología", "Hematología", "Infectología", "Inmunología", "Reumatología", "Geriatría", "Pediatría veterinaria", "Odontología veterinaria", "Medicina felina", "Medicina de animales exóticos"] },
  { category: "Cirugía y rehabilitación", items: ["Cirugía de tejidos blandos", "Cirugía ortopédica", "Traumatología", "Neurocirugía", "Cirugía mínimamente invasiva", "Artroscopia", "Ortopedia veterinaria", "Medicina deportiva", "Fisioterapia y rehabilitación veterinaria", "Rehabilitación neurológica", "Rehabilitación ortopédica", "Rehabilitación deportiva", "Medicina regenerativa", "Acupuntura veterinaria", "Quiropráctica veterinaria"] },
  { category: "Especialidades de equinos", items: ["Medicina interna equina", "Cirugía equina", "Ortopedia equina", "Traumatología equina", "Medicina deportiva equina", "Fisioterapia y rehabilitación equina", "Odontología equina", "Oftalmología equina", "Cardiología equina", "Neurología equina", "Dermatología equina", "Reproducción equina", "Neonatología equina", "Podología equina", "Herrado terapéutico", "Medicina preventiva del caballo atleta", "Diagnóstico por imagen equino", "Medicina del caballo de carrera"] },
  { category: "Grandes animales y producción", items: ["Medicina bovina", "Cirugía bovina", "Reproducción bovina", "Medicina de producción bovina", "Medicina ovina", "Medicina caprina", "Medicina porcina", "Medicina de pequeños rumiantes", "Medicina de animales de granja", "Medicina de producción", "Genética y mejoramiento animal", "Nutrición animal"] },
  { category: "Aves", items: ["Medicina aviar", "Medicina de aves ornamentales", "Medicina de aves silvestres", "Medicina de aves de producción", "Cirugía aviar", "Reproducción aviar"] },
  { category: "Animales exóticos y silvestres", items: ["Medicina de reptiles", "Medicina de anfibios", "Medicina de aves exóticas", "Medicina de pequeños mamíferos exóticos", "Medicina de fauna silvestre", "Medicina de zoológicos"] },
  { category: "Peces y piscicultura", items: ["Medicina de peces", "Ictiopatología", "Sanidad acuícola", "Piscicultura", "Producción de peces", "Nutrición de peces", "Reproducción de peces", "Manejo sanitario de cultivos acuícolas", "Enfermedades infecciosas de peces", "Parasitología de peces", "Calidad del agua y bioseguridad acuícola"] },
  { category: "Diagnóstico", items: ["Diagnóstico por imagen", "Radiología veterinaria", "Ecografía veterinaria", "Tomografía computarizada", "Resonancia magnética", "Endoscopia", "Patología clínica", "Anatomía patológica", "Citología", "Histopatología", "Microbiología", "Parasitología", "Genética veterinaria"] },
  { category: "Anestesia y cuidados críticos", items: ["Anestesiología veterinaria", "Analgesia y manejo del dolor", "Medicina de emergencia", "Cuidados intensivos", "Medicina de urgencias", "Terapia del dolor"] },
  { category: "Reproducción", items: ["Reproducción animal", "Obstetricia veterinaria", "Ginecología veterinaria", "Andrología veterinaria", "Fertilidad", "Reproducción asistida", "Transferencia embrionaria", "Inseminación artificial", "Neonatología"] },
  { category: "Salud pública y producción", items: ["Epidemiología veterinaria", "Salud pública veterinaria", "Medicina preventiva", "Zoonosis", "Seguridad alimentaria", "Inspección sanitaria", "Tecnología de alimentos de origen animal", "Higiene de alimentos", "Salud de poblaciones animales", "Bioseguridad"] },
  { category: "Otras áreas veterinarias", items: ["Farmacología veterinaria", "Toxicología veterinaria", "Nutrición clínica", "Bienestar animal", "Etología veterinaria", "Medicina del comportamiento", "Gestión sanitaria", "Investigación veterinaria", "Medicina veterinaria legal y forense", "Veterinaria de laboratorio", "Medicina de zoológicos"] },
];
export const SPECIALTIES_FLAT = SPECIALTIES_GROUPED.flatMap((g) => g.items);

export const SERVICES = [
  "Atención en clínica", "Atención a domicilio", "Consulta online", "Atención de emergencias",
  "Laboratorio", "Diagnóstico por imágenes", "Peluquería", "Baño y estética", "Hospitalización",
  "Farmacia veterinaria", "Transporte de mascotas", "Internación", "Atención de grandes animales",
  "Asesoramiento en producción animal", "Cirugía",
];

export const MUNICIPIOS = ["Santa Cruz de la Sierra", "Warnes", "La Guardia", "Cotoca", "Montero", "Porongo"];
export const ZONAS = ["Zona Norte", "Zona Sur", "Zona Este", "Zona Oeste", "Zona Centro", "Urubó"];
export const PROVINCIAS = [
  "Andrés Ibáñez", "Warnes", "José Miguel de Velasco", "Ichilo", "Chiquitos", "Sara", "Cordillera",
  "Vallegrande", "Florida", "Obispo Santistevan", "Ñuflo de Chávez", "Ángel Sandóval",
  "Manuel María Caballero", "Germán Busch", "Guarayos",
];

export const PLAN_LABEL = { basico: "Básico", premium: "Premium", ultra: "Premium Ultra Smart" };
export const PLAN_COLOR = { basico: "var(--muted)", premium: "var(--celeste)", ultra: "var(--accent)" };

// El plan Básico solo muestra 1 especialidad (la principal); Premium y Premium
// Ultra Smart muestran todas las que el veterinario haya cargado.
export function visibleSpecialties(vet) {
  return vet.plan === "basico" ? vet.specialties.slice(0, 1) : vet.specialties;
}

export function isPubliclyVisible(vet) {
  return vet.profile_status === "active" && (!vet.plan_expiry || vet.plan_expiry >= new Date().toISOString().slice(0, 10));
}

export const SUPPORT_EMAIL = "atencion.myvet@gmail.com";
