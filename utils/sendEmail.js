import { BrevoClient } from '@getbrevo/brevo';

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });


const sendEmail = async (email, subject, message) => {
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: subject,
            htmlContent: message,
            sender: { email: process.env.SENDER_EMAIL },
            to: [{ email: email }],
        });

        console.log('Email sent. Message ID:', result.messageId);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default sendEmail;