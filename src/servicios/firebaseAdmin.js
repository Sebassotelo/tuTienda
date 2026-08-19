import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(privateKey) {
  return privateKey ? privateKey.replace(/\\n/g, "\n") : privateKey;
}

function getServiceAccount() {
  if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
    return {
      projectId: serviceAccount.project_id || serviceAccount.projectId,
      clientEmail: serviceAccount.client_email || serviceAccount.clientEmail,
      privateKey: normalizePrivateKey(serviceAccount.private_key || serviceAccount.privateKey),
    };
  }

  return {
    projectId:
      process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_PROJECTID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  };
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
