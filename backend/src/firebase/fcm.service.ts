import { Injectable, Logger } from "@nestjs/common";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class FcmService {
  private logger = new Logger(FcmService.name);

  constructor() {
    if (admin.apps.length > 0) {
      return;
    }

    try {
      const serviceAccountJson = process.env.FCM_SERVICE_ACCOUNT_JSON;
      const serviceAccountPath =
        process.env.FCM_SERVICE_ACCOUNT_PATH ||
        path.resolve(__dirname, "./firebase-service.json");

      if (serviceAccountJson) {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
        });
        return;
      }

      if (fs.existsSync(serviceAccountPath)) {
        admin.initializeApp({
          credential: admin.credential.cert(
            JSON.parse(fs.readFileSync(serviceAccountPath, "utf8")),
          ),
        });
        return;
      }

      this.logger.warn(
        "Firebase service account not configured. Push notifications are disabled.",
      );
    } catch (error) {
      this.logger.error(
        "Firebase initialization failed. Push notifications are disabled.",
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async sendNotification(
    fcmTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!fcmTokens.length) {
      this.logger.warn('No FCM tokens provided');
      return;
    }

    const message = {
      notification: { title, body },
      tokens: fcmTokens,
      data: data || {},
    };

    try {
      if (admin.apps.length === 0) {
        this.logger.warn(
          "Skipping notification send because Firebase is not initialized",
        );
        return;
      }

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Notifications sent: ${response.successCount}, failed: ${response.failureCount}`,
      );
      if (response.failureCount > 0) {
        response.responses.forEach((resp) => {
          if (!resp.success) {
            this.logger.error(
              `Notification delivery failed: ${resp.error?.message ?? "unknown error"}`,
            );
          }
        });
      }
    } catch (err) {
      this.logger.error("Error sending notification", err);
    }
  }
}
