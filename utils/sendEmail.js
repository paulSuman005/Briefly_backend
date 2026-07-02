import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
});

const sendEmail = async (email, subject, message) => {
    try {
        console.log("========== SMTP CONFIG ==========");
        console.log("Host:", process.env.SMTP_HOST);
        console.log("Port:", process.env.SMTP_PORT);
        console.log("User:", process.env.SMTP_USERNAME);
        console.log("Sender:", process.env.SENDER_EMAIL);
        console.log(
            "SMTP Password:",
            process.env.SMTP_PASSWORD ? "Present ✅" : "Missing ❌"
        );
        console.log("=================================");

        const info = await transporter.sendMail({
            from: `"Briefly" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject,
            html: message,
        });

        console.log("✅ Email sent successfully");
        console.log(info.response);

        return info;
    } catch (error) {
        console.error("❌ Email Error");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Command:", error.command);
        console.error(error);

        throw error;
    }
};

export default sendEmail;