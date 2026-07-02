import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    },

    connectionTimeout: 10000,
    socketTimeout: 10000
});


const sendEmail = async (email, subject, message) => {

    try {

        await transporter.verify();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject,
            html: message
        };


        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent:", info.messageId);


    } catch(error) {

        console.log("Email error:", error.message);
        throw error;

    }

};


export default sendEmail;