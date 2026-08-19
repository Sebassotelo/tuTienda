import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(privateKey) {
  return privateKey ? privateKey.replace(/\\n/g, "\n") : privateKey;
}

function createAdminConfigError(message) {
  const error = new Error(message);
  error.statusCode = 500;
  error.publicMessage = message;
  return error;
}

function validateServiceAccount(serviceAccount) {
  const missingFields = [];

  if (!serviceAccount.projectId) missingFields.push("projectId");
  if (!serviceAccount.clientEmail) missingFields.push("clientEmail");
  if (!serviceAccount.privateKey) missingFields.push("privateKey");

  if (missingFields.length > 0) {
    throw createAdminConfigError(
      `Faltan variables de Firebase Admin (${missingFields.join(", ")}). Configura FIREBASE_ADMIN_SERVICE_ACCOUNT o FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY en produccion.`
    );
  }

  return serviceAccount;
}

function getServiceAccount() {
  if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
      return validateServiceAccount({
        projectId: serviceAccount.project_id || serviceAccount.projectId,
        clientEmail: serviceAccount.client_email || serviceAccount.clientEmail,
        privateKey: normalizePrivateKey(serviceAccount.private_key || serviceAccount.privateKey),
      });
    } catch (error) {
      if (error.publicMessage) throw error;
      throw createAdminConfigError(
        "FIREBASE_ADMIN_SERVICE_ACCOUNT no tiene un JSON valido. Revisa la variable de entorno en produccion."
      );
    }
  }

  return validateServiceAccount({
    projectId:
      process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_PROJECTID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  });
}

export function getFirebaseAdmin() {
  const existingApp = getApps()[0];
  const app =
    existingApp ||
    initializeApp({
      credential: cert(getServiceAccount()),
    });

  return {
    adminAuth: getAuth(app),
    adminDb: getFirestore(app),
  };
}
