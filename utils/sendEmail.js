import nodemailer from "nodemailer";

console.log("========== SMTP CONFIG ==========");
console.log("HOST:", process.env.SMTP_HOST);
console.log("PORT:", process.env.SMTP_PORT);
console.log("USERNAME:", process.env.SMTP_USERNAME);
console.log("SENDER_EMAIL:", process.env.SENDER_EMAIL);
console.log(
    "SMTP_PASSWORD:",
    process.env.SMTP_PASSWORD ? "Present ✅" : "Missing ❌"
);
console.log("================================");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
});

const sendEmail = async (email, subject, message) => {
    try {
        console.log("\n========== SEND EMAIL START ==========");
        console.log("Recipient:", email);
        console.log("Subject:", subject);

        console.log("Verifying SMTP connection...");
        await transporter.verify();
        console.log("SMTP verification successful ✅");

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject,
            html: message,
        };

        console.log("Sending email...");
        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully ✅");
        console.log("Message ID:", info.messageId);
        console.log("Response:", info.response);
        console.log("========== SEND EMAIL END ==========\n");

        return info;
    } catch (error) {
        console.log("\n========== EMAIL ERROR ==========");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Command:", error.command);
        console.error("Response:", error.response);
        console.error("Response Code:", error.responseCode);
        console.error("Stack:", error.stack);
        console.log("=================================\n");

        throw error;
    }
};

export default sendEmail;