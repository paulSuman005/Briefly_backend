import SibApiV3Sdk from "@getbrevo/brevo";

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set the API key
apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SMTP_PASSWORD
);

const sendEmail = async (email, subject, message) => {
    try {
        console.log("========== BREVO EMAIL ==========");
        console.log("Sender:", process.env.SENDER_EMAIL);
        console.log("Recipient:", email);
        console.log("Subject:", subject);
        console.log(
            "API Key:",
            process.env.SMTP_PASSWORD ? "Present ✅" : "Missing ❌"
        );
        console.log("=================================");

        const response = await apiInstance.sendTransacEmail({
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

        console.log("✅ Email sent successfully");
        console.log("Message ID:", response.body?.messageId || response);

        return response;
    } catch (error) {
        console.error("❌ Brevo Email Error");
        console.error("Message:", error.message);

        if (error.response) {
            console.error("Status:", error.response.statusCode);
            console.error("Body:", error.response.body);
        }

        throw error;
    }
};

export default sendEmail;