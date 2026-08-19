import { FieldValue } from "firebase-admin/firestore";
import { requireAuthenticatedAccount } from "@/servicios/adminApi";

const ALLOWED_EVENT_TYPES = new Set(["panel_opened", "panel_section_viewed"]);
const SECTION_LABELS = {
  0: "configuracion",
  1: "productos",
  2: "descuentos",
};

function normalizeEventType(value) {
  return String(value || "").trim();
}

function normalizeSection(value) {
  const key = String(value ?? "").trim();
  const label = SECTION_LABELS[key] || key || "general";

  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "general";
}

function getDayKey(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Metodo no permitido." });
  }

  try {
    const type = normalizeEventType(req.body?.type);

    if (!ALLOWED_EVENT_TYPES.has(type)) {
      return res.status(400).json({ error: "Evento no soportado." });
    }

    const { adminDb, requester } = await requireAuthenticatedAccount(req);
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const dayKey = getDayKey(nowDate);
    const section = normalizeSection(req.body?.metadata?.section);
    const accountRef = adminDb.collection("users").doc(requester.email);
    const snapshot = await accountRef.get();
    const data = snapshot.exists ? snapshot.data() || {} : {};
    const metricasPanel = data.metricasPanel || {};
    const update = {
      "metricasActividad.ultimaActividad": now,
      [`metricasActividad.contadores.${type}`]: FieldValue.increment(1),
      [`metricasActividad.porDia.${dayKey}.${type}`]: FieldValue.increment(1),
    };

    if (type === "panel_opened") {
      update["metricasPanel.entradas"] = FieldValue.increment(1);
      update["metricasPanel.ultimaEntrada"] = now;

      if (!metricasPanel.primeraEntrada) {
        update["metricasPanel.primeraEntrada"] = now;
      }
    }

    if (type === "panel_section_viewed") {
      update["metricasPanel.ultimaSeccion"] = section;
      update[`metricasPanel.secciones.${section}.visitas`] = FieldValue.increment(1);
      update[`metricasPanel.secciones.${section}.ultimaVisita`] = now;
    }

    await accountRef.set(update, { merge: true });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.publicMessage || error.message || "No se pudo registrar la actividad.",
    });
  }
}
