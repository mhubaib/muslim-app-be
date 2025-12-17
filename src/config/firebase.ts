import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FCM_PROJECT_ID,
  private_key: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FCM_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
