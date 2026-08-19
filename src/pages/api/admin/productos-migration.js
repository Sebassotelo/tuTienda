import { requireAdminAccount } from "@/servicios/adminApi";
import {
  buildProductBatchData,
  productBatchDocId,
  splitProductsInBatches,
} from "@/servicios/productosBatchCore";

async function duplicateAccountProducts(adminDb, userDoc) {
  const userData = userDoc.data();
  const email = userDoc.id;
  const items = Array.isArray(userData.items) ? userData.items : [];
  const usuario = userData.usuario || "";
  const chunks = splitProductsInBatches(items);
  const batch = adminDb.batch();

  chunks.forEach((chunk, batchIndex) => {
    const ref = adminDb.collection("productos").doc(productBatchDocId(email, batchIndex));
    batch.set(ref, {
      ...buildProductBatchData({ email, usuario, batchIndex, products: chunk }),
      migratedAt: new Date().toISOString(),
      source: "admin-legacy-duplicate",
    });
  });

  await batch.commit();

  return {
    email,
    usuario,
    productos: items.length,
    batches: chunks.length,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Metodo no permitido." });
    }

    const { adminDb } = await requireAdminAccount(req);
    const { email, scope } = req.body || {};

    if (scope === "account") {
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Falta el email de la cuenta." });
      }

      const userDoc = await adminDb.collection("users").doc(email).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "No se encontro la cuenta." });
      }

      const result = await duplicateAccountProducts(adminDb, userDoc);
      return res.status(200).json({ migrated: [result] });
    }

    if (scope === "all") {
      const usersSnapshot = await adminDb.collection("users").get();
      const migrated = [];

      for (const userDoc of usersSnapshot.docs) {
        migrated.push(await duplicateAccountProducts(adminDb, userDoc));
      }

      return res.status(200).json({ migrated });
    }

    return res.status(400).json({ error: "Scope invalido." });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error:
        status === 500
          ? "No se pudo duplicar productos legacy."
          : error.message,
    });
  }
}
