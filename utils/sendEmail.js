import * as Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SMTP_PASSWORD
);

const sendEmail = async (email, subject, message) => {
    try {
        const result = await apiInstance.sendTransacEmail({
            sender: {
                email: process.env.SENDER_EMAIL,
                name: "Briefly",
            },
            to: [
                {
                    email,
                },
            ],
            subject,
            htmlContent: message,
        });

        console.log("Email sent successfully");
        console.log(result);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default sendEmail;