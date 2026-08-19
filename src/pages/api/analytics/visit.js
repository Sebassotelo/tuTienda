import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/servicios/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Metodo no permitido." });
  }

  try {
    const usuario = String(req.body?.usuario || "").trim();

    if (!usuario) {
      return res.status(400).json({ error: "Falta el usuario de la tienda." });
    }

    const { adminDb } = getFirebaseAdmin();
    const snapshot = await adminDb
      .collection("users")
      .where("usuario", "==", usuario)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Tienda no encontrada." });
    }

    const doc = snapshot.docs[0];
    const data = doc.data() || {};
    const now = new Date().toISOString();
    const metricasActuales = data.metricasPublicas || {};
    const metricasPublicas = {
      visitasTienda: FieldValue.increment(1),
      ultimaVisitaTienda: now,
      actualizadoEn: now,
    };

    if (!metricasActuales.primeraVisitaTienda) {
      metricasPublicas.primeraVisitaTienda = now;
    }

    await doc.ref.set({ metricasPublicas }, { merge: true });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.publicMessage || "No se pudo registrar la visita.",
    });
  }
}
