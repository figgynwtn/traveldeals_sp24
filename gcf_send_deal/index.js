const { Firestore } = require('@google-cloud/firestore');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Entry function
exports.sendDealEmail = async (event, context) => {
    try {
        const triggerResource = context.resource;

        // Print info on the trigger resource
        console.log(`Function triggered by event on: ${triggerResource}`);
        console.log(`Event type: ${context.eventType}`);

        // Log event value to inspect its structure
        console.log("Event value:", event.value);

        // Extract the location of the deal from the document posted to Firebase
        const dealLocation = event.value.fields.location.arrayValue.values[0].stringValue;
        console.log("Deal location:", dealLocation);

        // Connect to the database
        const db = new Firestore({
            projectId: "sp24-41200-newt-travel-deals"
        });

        // Query Firestore to find all subscribers watching the specific location
        const subscribersSnapshot = await db.collection('subscribers').where('watch_regions', 'array-contains', dealLocation).get();

        // Iterate over subscribers
        subscribersSnapshot.forEach(subscriberDoc => {
            const subscriberData = subscriberDoc.data();
            const email = subscriberData.email_address;

            // Generate an email about the deal to each subscriber
            sendEmail(email, dealLocation);
        });

        console.log("Emails sent successfully.");
    } catch (error) {
        console.error('Error processing function:', error);
    }
};

// Helper function to send email
function sendEmail(email, dealLocation) {
    try {
        // Set up SendGrid with API key
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        // Create an email message
        const msg = {
            to: email,
            from: process.env.SENDGRID_SENDER,
            subject: "Newton: Exciting travel deal in " + dealLocation,
            text: `Check out this exciting travel deal in ${dealLocation}!`,
            html: `<p>Check out this exciting travel deal in <strong>${dealLocation}</strong>!</p>`
        };

        // Send the message through SendGrid
        sgMail.send(msg)
            .then(() => {
                console.log(`Sent email to ${email}`);
            })
            .catch(error => {
                console.error('Error sending email:', error);
            });
    } catch (error) {
        console.error('Error in sendEmail function:', error);
    }
}