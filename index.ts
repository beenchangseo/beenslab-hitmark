import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { initializeApp, credential, firestore } from 'firebase-admin';

let db: firestore.Firestore;
let initialized = false;

function initFirebase() {
  if (!initialized) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
    const serviceAccount = JSON.parse(serviceAccountJson);

    initializeApp({
      credential: credential.cert(serviceAccount),
    });

    db = firestore();
    initialized = true;
  }
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

function generateSVG(todayHits: number, totalHits: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="20" role="img" aria-label="Hits">
      <linearGradient id="bg" x2="0" y2="100%">
        <stop offset="0" stop-color="#444" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <rect rx="3" width="200" height="20" fill="#555"/>
      <rect rx="3" x="70" width="130" height="20" fill="#007ec6"/>
      <rect rx="3" width="200" height="20" fill="url(#bg)"/>
      <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
        <text x="35" y="14">Hits</text>
        <text x="130" y="14">Today: ${todayHits} | Total: ${totalHits}</text>
      </g>
    </svg>`;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    initFirebase();

    const postId = event.queryStringParameters?.post_id;
    if (!postId) {
      return {
        statusCode: 400,
        body: 'Missing post_id',
      };
    }

    const domain = event.queryStringParameters?.domain;
    if (!domain) {
      return {
        statusCode: 400,
        body: 'Missing domain',
      };
    }

    const docRef = db.collection('beenslab').doc(domain).collection('posts').doc(postId);
    const today = getTodayDate();

    let totalHits = 1;
    let todayHits = 1;

    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      const data = doc.exists ? doc.data() || {} : {};

      const prevTotal = data.total_hits || 0;
      const prevToday = data.today_hits || 0;
      const lastDate = data.last_hits_date || '';

      totalHits = prevTotal + 1;
      todayHits = (lastDate === today) ? (prevToday + 1) : 1;

      t.set(docRef, {
        total_hits: totalHits,
        today_hits: todayHits,
        last_hits_date: today,
      }, { merge: true });
    });

    const svg = generateSVG(todayHits, totalHits);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: svg,
    };
  } catch (err) {
    console.error('Error in counter:', err);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
