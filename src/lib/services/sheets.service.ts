import { google } from 'googleapis';
import { env } from '@/config/env';
import { GoogleSheetRow } from '@/lib/schema/google-sheets.schema';

export class SheetsService {
  private static async getAuth() {
    if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
      throw new Error("Missing Google Service Account credentials");
    }

    // Handle private key formatting (replacing escaped newlines)
    const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    return new google.auth.JWT({
      email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  public static async appendRow(row: GoogleSheetRow) {
    if (!env.GOOGLE_SPREADSHEETS_ID) return; // Skip if no sheet configured
    
    try {
      const auth = await this.getAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      await sheets.spreadsheets.values.append({
        spreadsheetId: env.GOOGLE_SPREADSHEETS_ID,
        range: 'Generations!A:E', 
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row]
        }
      });
      console.log('Appended row to Google Sheets successfully');
    } catch (error) {
      console.error('Failed to append to Google Sheets:', error);
      // We log but don't crash the generation if sheets integration fails independently
    }
  }
}
