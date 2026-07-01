import otpGenerator from 'otp-generator';


export const generateOTP = () => {
    const otp = otpGenerator.generate(6, {
        digits: true,
        specialChars: false,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false
    })

    return otp;
}

export const generateOTPMessage = (name, otp) => {
    return {
        subject: "Briefly - Verify Your Email",
        html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;background-color:#DFF6FF;padding:30px;">
            <div style="max-width:500px;margin:auto;background-color:white;border-radius:15px;padding:30px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                <h2 style="color:#06283D;margin-bottom:10px;">Hi ${name},</h2>

                <p style="color:#333;">
                    Welcome to <strong style="color:#1363DF;">Briefly</strong> 🎉
                </p>

                <p style="color:#555;">
                    Thank you for creating your account. To verify your email address, please use the OTP below:
                </p>

                <div style="text-align:center;margin:25px 0;">
                    <h1 style="display:inline-block;background-color:#DFF6FF;color:#06283D;padding:15px 35px;border-radius:10px;letter-spacing:5px;border:2px solid #47B5FF;">
                        ${otp}
                    </h1>
                </div>

                <p style="color:#555;">
                    This OTP is valid for <strong style="color:#1363DF;">15 minutes</strong>. Please do not share this code with anyone.
                </p>

                <p style="color:#555;">
                    If you didn't request this verification, you can safely ignore this email.
                </p>

                <br/>

                <p style="color:#06283D;">
                    Cheers,<br/>
                    <strong>The Briefly Team</strong>
                </p>

                <div style="margin-top:20px;text-align:center;font-size:12px;color:#777;">
                    AI powered document understanding ✨
                </div>

            </div>
        </div>
        `
    };
};

export const generateResetPasswordMessage = (name, resetUrl) => {
  return {
    subject: "Briefly - Reset Your Password",
    html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;background-color:#DFF6FF;padding:30px;">
      <div style="max-width:500px;margin:auto;background-color:white;border-radius:15px;padding:30px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

        <h2 style="color:#06283D;margin-bottom:10px;">Hi ${name},</h2>

        <p style="color:#333;">
          We received a request to reset your password for your <strong style="color:#1363DF;">Briefly</strong> account.
        </p>

        <p style="color:#555;">
          Click the button below to set a new password:
        </p>

        <div style="text-align:center;margin:25px 0;">
          <a href="${resetUrl}" 
             style="display:inline-block;background-color:#1363DF;color:white;padding:15px 35px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">
            Reset Password
          </a>
        </div>

        <p style="color:#555;">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <p style="word-break:break-all;">
          <a href="${resetUrl}" style="color:#1363DF;">${resetUrl}</a>
        </p>

        <p style="color:#555;">
          This link is valid for <strong style="color:#1363DF;">15 minutes</strong>.
        </p>

        <p style="color:#555;">
          If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
        </p>

        <br/>

        <p style="color:#06283D;">
          Stay secure,<br/>
          <strong>The Briefly Team</strong>
        </p>

        <div style="margin-top:20px;text-align:center;font-size:12px;color:#777;">
          AI powered document understanding ✨
        </div>

      </div>
    </div>
    `
  };
};
