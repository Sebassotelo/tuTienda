import { requireAdminAccount } from "@/servicios/adminApi";
import {
  PRODUCT_META_FIELDS,
  canPublishStore,
  getPlanKey,
  isSubscriptionExpired,
} from "@/servicios/productosBatchCore";

async function listAuthUsers(adminAuth) {
  const users = [];
  let nextPageToken;

  do {
    const result = await adminAuth.listUsers(1000, nextPageToken);
    users.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  return users;
}

function safeArrayLength(value) {
  return Array.isArray(value) ? value.length : 0;
}

function countProductsInBatchData(data = {}) {
  return Object.entries(data).filter(
    ([key, value]) => !PRODUCT_META_FIELDS.has(key) && value && typeof value === "object"
  ).length;
}

function addDuration(date, duration) {
  const nextDate = new Date(date);

  if (duration === "year") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    return nextDate;
  }

  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
}

function getDurationMonths(duration, startDate, expiresAt) {
  if (duration === "year") return 12;
  if (duration === "month") return 1;

  if (duration === "custom" && expiresAt) {
    const diffMs = expiresAt.getTime() - startDate.getTime();
    if (diffMs <= 0) return 0;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)));
  }

  return 0;
}

function getPlanNameByNivel(nivel) {
  if (Number(nivel || 0) >= 2) return "Pro";
  if (Number(nivel || 0) === 1) return "Premium";
  return "Free";
}

function normalizeSubscriptionHistory(history) {
  return Array.isArray(history) ? history.filter(Boolean).slice(-80) : [];
}

function normalizeRecontactHistory(history) {
  return Array.isArray(history) ? history.filter(Boolean).slice(-80) : [];
}

function normalizeRecontacto(recontacto = {}) {
  return {
    ultimoEmailEnviado: recontacto.ultimoEmailEnviado || null,
    pruebaActivadaEn: recontacto.pruebaActivadaEn || null,
    ultimoPlanPrueba: recontacto.ultimoPlanPrueba || null,
    ultimaDuracionPrueba: recontacto.ultimaDuracionPrueba || null,
    cantidadEmails: Number(recontacto.cantidadEmails || 0),
    actualizadoEn: recontacto.actualizadoEn || null,
    actualizadoPor: recontacto.actualizadoPor || null,
    historial: normalizeRecontactHistory(recontacto.historial),
  };
}

function buildRecontactUpdate(recontacto = {}, requesterEmail = "", currentRecontacto = {}) {
  const now = new Date().toISOString();
  const previousHistory = normalizeRecontactHistory(currentRecontacto.historial);
  const emailSentAt = recontacto.emailEnviadoEn || now;
  const trialActivatedAt = recontacto.pruebaActivadaEn || now;
  const trialPlan = recontacto.trialPlan || "Premium";
  const trialDuration = recontacto.trialDuration || "1 mes";

  const nextHistory = [
    ...previousHistory,
    {
      id: `${Date.now()}-recontacto`,
      tipo: "mail_prueba",
      emailEnviadoEn: emailSentAt,
      pruebaActivadaEn: trialActivatedAt,
      plan: trialPlan,
      duracion: trialDuration,
      registradoEn: now,
      registradoPor: requesterEmail,
    },
  ];

  return {
    ultimoEmailEnviado: emailSentAt,
    pruebaActivadaEn: trialActivatedAt,
    ultimoPlanPrueba: trialPlan,
    ultimaDuracionPrueba: trialDuration,
    cantidadEmails: Number(currentRecontacto.cantidadEmails || 0) + 1,
    actualizadoEn: now,
    actualizadoPor: requesterEmail,
    historial: nextHistory.slice(-80),
  };
}

function buildPremiumUpdate(premium = {}, requesterEmail = "", currentPremium = {}) {
  const nivel = Number(premium.nivel ?? currentPremium.nivel ?? 0);
  const now = new Date();
  const previousHistory = normalizeSubscriptionHistory(currentPremium.historialPagos);

  if (nivel <= 0) {
    return {
      nivel: 0,
      activo: true,
      fechaPago: null,
      fechaVencimiento: null,
      duracion: "free",
      actualizadoEn: now.toISOString(),
      actualizadoPor: requesterEmail,
      historialPagos: previousHistory,
    };
  }

  const action = premium.action || "assign";
  const duration = premium.duration || premium.duracion || "month";
  const customDate = premium.fechaVencimiento || premium.customUntil;
  let expiresAt;
  let paymentDate = now.toISOString();
  let durationLabel = duration === "year" ? "1 anio" : duration === "custom" ? "fecha especifica" : "1 mes";

  if (action === "set_expiration") {
    if (!customDate) {
      const error = new Error("Falta la fecha de vencimiento.");
      error.statusCode = 400;
      throw error;
    }

    expiresAt = new Date(`${customDate}T23:59:59.999`);
    paymentDate = currentPremium.fechaPago || null;
    durationLabel = "fecha manual";
  } else if (action === "renew_month") {
    if (Number(currentPremium.nivel || 0) <= 0) {
      const error = new Error("La cuenta no tiene una suscripcion activa para renovar.");
      error.statusCode = 400;
      throw error;
    }

    const currentExpiresAt = currentPremium.fechaVencimiento
      ? new Date(currentPremium.fechaVencimiento)
      : null;
    const baseDate = currentExpiresAt && !Number.isNaN(currentExpiresAt.getTime())
      ? currentExpiresAt
      : now;

    expiresAt = addDuration(baseDate, "month");
    paymentDate = currentPremium.fechaPago || null;
    durationLabel = currentPremium.duracion || null;
  } else {
    expiresAt = duration === "custom" && customDate
      ? new Date(`${customDate}T23:59:59.999`)
      : addDuration(now, duration);
  }

  if (Number.isNaN(expiresAt.getTime())) {
    const error = new Error("La fecha de vencimiento no es valida.");
    error.statusCode = 400;
    throw error;
  }

  const nextNivel = action === "renew_month" ? Number(currentPremium.nivel || nivel) : nivel;
  const nextHistory = [...previousHistory];

  if (action === "assign") {
    nextHistory.push({
      id: `${now.getTime()}-${nextNivel}-${duration}`,
      tipo: "pago",
      plan: getPlanNameByNivel(nextNivel),
      nivel: nextNivel,
      duracion: durationLabel,
      mesesPagados: getDurationMonths(duration, now, expiresAt),
      fechaPago: paymentDate,
      fechaVencimiento: expiresAt.toISOString(),
      registradoEn: now.toISOString(),
      registradoPor: requesterEmail,
    });
  }

  return {
    nivel: nextNivel,
    activo: action === "renew_month" ? currentPremium.activo !== false : premium.activo !== false,
    fechaPago: paymentDate,
    fechaVencimiento: expiresAt.toISOString(),
    duracion: durationLabel,
    actualizadoEn: now.toISOString(),
    actualizadoPor: requesterEmail,
    historialPagos: nextHistory.slice(-80),
  };
}

function normalizePremium(premium = {}) {
  return {
    nivel: Number(premium.nivel || 0),
    activo: premium.activo !== false,
    fechaPago: premium.fechaPago || null,
    fechaVencimiento: premium.fechaVencimiento || null,
    duracion: premium.duracion || null,
    actualizadoEn: premium.actualizadoEn || null,
    actualizadoPor: premium.actualizadoPor || null,
    vencida: isSubscriptionExpired(premium),
    publicable: canPublishStore(premium),
    historialPagos: normalizeSubscriptionHistory(premium.historialPagos),
  };
}

async function getProductCountsByEmail(adminDb) {
  const snapshot = await adminDb.collection("productos").get();
  const counts = new Map();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const email = data.cuenta;

    if (!email) return;

    counts.set(email, (counts.get(email) || 0) + countProductsInBatchData(data));
  });

  return counts;
}

async function getProductCountByEmail(adminDb, email) {
  const snapshot = await adminDb
    .collection("productos")
    .where("cuenta", "==", email)
    .get();
  let count = 0;

  snapshot.forEach((doc) => {
    count += countProductsInBatchData(doc.data());
  });

  return snapshot.empty ? null : count;
}

function buildAccount(authUser, firestoreData = {}, firestoreId, productCount = null) {
  const email = authUser?.email || firestoreId;
  const premium = normalizePremium(firestoreData.premium || { nivel: 0, activo: true });

  return {
    uid: authUser?.uid || null,
    email,
    displayName: authUser?.displayName || firestoreData.nombre || "Sin nombre",
    photoURL: authUser?.photoURL || null,
    emailVerified: authUser?.emailVerified || false,
    disabled: authUser?.disabled || false,
    creationTime: authUser?.metadata?.creationTime || null,
    lastSignInTime: authUser?.metadata?.lastSignInTime || null,
    providers: authUser?.providerData?.map((provider) => provider.providerId) || [],
    firestoreExists: Boolean(firestoreId),
    usuario: firestoreData.usuario || "",
    fechaDeRegistro: firestoreData.fechaDeRegistro || null,
    admin: firestoreData.admin === true,
    premium,
    recontacto: normalizeRecontacto(firestoreData.recontacto || {}),
    planKey: getPlanKey(premium),
    metricas: {
      productos: productCount ?? safeArrayLength(firestoreData.items),
      productosLegacy: safeArrayLength(firestoreData.items),
      productosNew: productCount ?? 0,
      categorias: safeArrayLength(firestoreData.secciones),
      cupones: safeArrayLength(firestoreData.cupones),
    },
    configuracion: firestoreData.configuracion || {},
  };
}

async function listAccounts(adminAuth, adminDb) {
  const [authUsers, usersSnapshot, productCountsByEmail] = await Promise.all([
    listAuthUsers(adminAuth),
    adminDb.collection("users").get(),
    getProductCountsByEmail(adminDb),
  ]);

  const firestoreByEmail = new Map();
  usersSnapshot.forEach((doc) => firestoreByEmail.set(doc.id, doc.data()));

  const accounts = authUsers.map((authUser) => {
    const firestoreData = firestoreByEmail.get(authUser.email) || {};
    firestoreByEmail.delete(authUser.email);
    return buildAccount(
      authUser,
      firestoreData,
      authUser.email,
      productCountsByEmail.get(authUser.email)
    );
  });

  firestoreByEmail.forEach((firestoreData, email) => {
    accounts.push(
      buildAccount(null, firestoreData, email, productCountsByEmail.get(email))
    );
  });

  accounts.sort((a, b) => {
    const dateA = new Date(a.creationTime || 0).getTime();
    const dateB = new Date(b.creationTime || 0).getTime();
    return dateB - dateA;
  });

  return { accounts, authUsers, usersSnapshot };
}

async function buildUpdatedAccount(adminAuth, adminDb, email) {
  const [authUserResult, firestoreDoc] = await Promise.allSettled([
    adminAuth.getUserByEmail(email),
    adminDb.collection("users").doc(email).get(),
  ]);

  const authUser =
    authUserResult.status === "fulfilled" ? authUserResult.value : null;
  const firestoreData =
    firestoreDoc.status === "fulfilled" && firestoreDoc.value.exists
      ? firestoreDoc.value.data()
      : {};
  const productCount = await getProductCountByEmail(adminDb, email);

  return buildAccount(authUser, firestoreData, email, productCount);
}

async function getAccounts(req, res) {
  const { adminAuth, adminDb, requester } = await requireAdminAccount(req);
  const { accounts, authUsers, usersSnapshot } = await listAccounts(
    adminAuth,
    adminDb
  );
  const adminCount = accounts.filter((account) => account.admin).length;

  res.status(200).json({
    accounts,
    requesterEmail: requester.email,
    canManage: true,
    canBootstrapAdmin: false,
    totals: {
      authUsers: authUsers.length,
      firestoreUsers: usersSnapshot.size,
      premium: accounts.filter((account) => account.premium.nivel === 1).length,
      pro: accounts.filter((account) => account.premium.nivel >= 2).length,
      activeSubscriptions: accounts.filter((account) => account.premium.publicable).length,
      expiredSubscriptions: accounts.filter((account) => account.premium.vencida).length,
      admins: adminCount,
      disabled: accounts.filter((account) => account.disabled).length,
    },
  });
}

async function patchAccount(req, res) {
  const { adminAuth, adminDb, requester } = await requireAdminAccount(req);
  const { email, emails, premium, recontacto, admin, disabled } = req.body || {};
  const targetEmails = Array.isArray(emails)
    ? emails.filter((item) => typeof item === "string" && item.trim())
    : email && typeof email === "string"
    ? [email]
    : [];

  if (targetEmails.length === 0) {
    return res.status(400).json({ error: "Falta el email de la cuenta." });
  }

  if (targetEmails.length > 1 && (typeof admin === "boolean" || typeof disabled === "boolean")) {
    return res.status(400).json({ error: "Las acciones masivas solo administran suscripciones." });
  }

  const updates = {};
  let premiumUpdatesByEmail = null;
  let recontactUpdatesByEmail = null;

  if (premium) {
    const currentDocs = await Promise.all(
      targetEmails.map((targetEmail) => adminDb.collection("users").doc(targetEmail).get())
    );

    premiumUpdatesByEmail = new Map(
      targetEmails.map((targetEmail, index) => {
        const currentDoc = currentDocs[index];
        const currentPremium = currentDoc.exists ? currentDoc.data().premium || {} : {};
        return [targetEmail, buildPremiumUpdate(premium, requester.email, currentPremium)];
      })
    );
  }

  if (recontacto) {
    const currentDocs = await Promise.all(
      targetEmails.map((targetEmail) => adminDb.collection("users").doc(targetEmail).get())
    );

    recontactUpdatesByEmail = new Map(
      targetEmails.map((targetEmail, index) => {
        const currentDoc = currentDocs[index];
        const currentRecontacto = currentDoc.exists ? currentDoc.data().recontacto || {} : {};
        return [targetEmail, buildRecontactUpdate(recontacto, requester.email, currentRecontacto)];
      })
    );
  }

  if (typeof admin === "boolean") {
    if (requester.email === targetEmails[0] && admin === false) {
      return res
        .status(400)
        .json({ error: "No podes quitarte permisos admin a vos mismo." });
    }

    updates.admin = admin;
  }

  await Promise.all(
    targetEmails.map((targetEmail) => {
      const targetUpdates = { ...updates };
      const premiumUpdate = premiumUpdatesByEmail?.get(targetEmail);
      const recontactUpdate = recontactUpdatesByEmail?.get(targetEmail);

      if (premiumUpdate) {
        targetUpdates.premium = premiumUpdate;
      }

      if (recontactUpdate) {
        targetUpdates.recontacto = recontactUpdate;
      }

      if (Object.keys(targetUpdates).length === 0) {
        return Promise.resolve();
      }

      return adminDb.collection("users").doc(targetEmail).set(targetUpdates, { merge: true });
    })
  );

  if (typeof disabled === "boolean") {
    const authUser = await adminAuth.getUserByEmail(targetEmails[0]);
    await adminAuth.updateUser(authUser.uid, { disabled });
  }

  const accounts = await Promise.all(
    targetEmails.map((targetEmail) => buildUpdatedAccount(adminAuth, adminDb, targetEmail))
  );

  res.status(200).json({
    account: accounts[0],
    accounts,
  });
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return await getAccounts(req, res);
    }

    if (req.method === "PATCH") {
      return await patchAccount(req, res);
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).json({ error: "Metodo no permitido." });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error:
        error.publicMessage ||
        (status === 500
          ? "No se pudo procesar la solicitud de administracion."
          : error.message),
    });
  }
}








