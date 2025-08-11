
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// This script checks for a custom environment variable containing the Firebase service account JSON.
// If it finds it, it writes it to a temporary file and sets the GOOGLE_APPLICATION_CREDENTIALS
// environment variable to the path of that file. This is a robust way to handle credentials
// in various server environments, especially those that don't handle multi-line environment variables well.

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const tmpdir = os.tmpdir();
    const filePath = path.join(tmpdir, 'firebase-service-account.json');
    
    fs.writeFileSync(filePath, JSON.stringify(serviceAccount));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;

    console.log('Service account credentials written to temporary file from FIREBASE_SERVICE_ACCOUNT_JSON.');
  } catch (error: any) {
    console.error('Failed to write service account credentials to file:', error.message);
    throw error;
  }
}
