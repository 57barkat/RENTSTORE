import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
import * as serviceAccount from "./firebase-service.json";
@Injectable()
export class FirebaseService {
  private defaultApp: admin.app.App;

  constructor() {
    this.defaultApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await this.defaultApp.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async createUser(email: string, password: string, phoneNumber?: string) {
    return this.defaultApp.auth().createUser({
      email,
      emailVerified: false,
      password,
      phoneNumber,
    });
  }

  async sendEmailVerificationLink(email: string) {
    return this.defaultApp.auth().generateEmailVerificationLink(email);
  }
}
