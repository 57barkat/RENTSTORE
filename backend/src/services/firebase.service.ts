import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
import * as fs from "fs";

@Injectable()
export class FirebaseService {
  private defaultApp: admin.app.App;

  constructor() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    this.defaultApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  async sendEmailVerificationLink(email: string) {
    try {
      const link = await this.defaultApp
        .auth()
        .generateEmailVerificationLink(email, {
          url: `${process.env.BACKEND_URL}/verify-email`,
        });
      return link;
    } catch (error) {
      console.error("Firebase email verification error:", error);
      throw error;
    }
  }
}
