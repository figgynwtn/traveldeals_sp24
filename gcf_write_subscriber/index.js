const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

exports.gcf_write_subscriber = async (message, context) => {
  try {
    // Parse the incoming message data
    const incomingMessage = Buffer.from(message.data, 'base64').toString('utf-8');
    const parsedMessage = JSON.parse(incomingMessage);

    // Construct the document to be written to Firestore
    const subscriberData = {
      email_address: parsedMessage.email_address,
      watch_regions: parsedMessage.watch_regions
    };

    // Write the document to the Firestore collection "subscribers"
    await db.collection('subscribers').add(subscriberData);

    console.log('Document successfully written to Firestore:', subscriberData);
  } catch (error) {
    console.error('Error writing document to Firestore:', error);
  }
};
