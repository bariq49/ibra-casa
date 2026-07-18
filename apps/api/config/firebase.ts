import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let firebaseAdmin: typeof admin | null = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseAdmin = admin;
  } else {
    admin.initializeApp();
    firebaseAdmin = admin;
  }
} catch (error: unknown) {
  // If already initialized, just use the existing app
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as Record<string, unknown>).code === "app/duplicate-app"
  ) {
    firebaseAdmin = admin;
  } else {
    console.error("Firebase Admin initialization error:", error);
    firebaseAdmin = null;
  }
}

export { firebaseAdmin };
