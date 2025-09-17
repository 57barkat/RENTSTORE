import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FcmService {
  private logger = new Logger(FcmService.name);

  constructor() {
    const serviceAccount = path.resolve(
      __dirname,
      './firebase-service.json',
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
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
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Notifications sent: ${response.successCount}, failed: ${response.failureCount}`,
      );
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(
              `Failed token: ${fcmTokens[idx]}, error: ${resp.error}`,
            );
          }
        });
      }
    } catch (err) {
      this.logger.error('Error sending notification', err);
    }
  }
}
