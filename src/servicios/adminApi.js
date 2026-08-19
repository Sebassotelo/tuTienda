import { getFirebaseAdmin } from "./firebaseAdmin";

function getBearerToken(req) {
  const authorization = req.headers.authorization || "";
  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireAuthenticatedAccount(req) {
  const token = getBearerToken(req);

  if (!token) {
    const error = new Error("No se envio token de sesion.");
    error.statusCode = 401;
    throw error;
  }

  const { adminAuth, adminDb } = getFirebaseAdmin();
  const decodedToken = await adminAuth.verifyIdToken(token);

  if (!decodedToken.email) {
    const error = new Error("La cuenta no tiene email verificable.");
    error.statusCode = 401;
    throw error;
  }

  const adminDoc = await adminDb.collection("users").doc(decodedToken.email).get();
  const adminData = adminDoc.exists ? adminDoc.data() : null;

  return {
    adminAuth,
    adminDb,
    requester: {
      uid: decodedToken.uid,
      email: decodedToken.email,
      data: adminData,
      isAdmin: adminData?.admin === true,
    },
  };
}

export async function requireAdminAccount(req) {
  const session = await requireAuthenticatedAccount(req);

  if (!session.requester.isAdmin) {
    const error = new Error("No tenes permisos de administrador.");
    error.statusCode = 403;
    throw error;
  }

  return session;
}
