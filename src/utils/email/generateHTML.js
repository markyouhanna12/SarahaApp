export const generateHTML = (firstName = "", otp = "") => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SarahaApp - OTP Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Segoe UI', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding:32px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:28px; letter-spacing:1px;">SarahaApp</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 40px 24px 40px; text-align:center;">
                <h2 style="margin:0 0 16px 0; color:#1a1a2e; font-size:22px;">Verify Your Email</h2>
                <p style="margin:0 0 8px 0; color:#555; font-size:16px;">
                  Hello <strong>${firstName}</strong>,
                </p>
                <p style="margin:0 0 24px 0; color:#555; font-size:16px; line-height:1.6;">
                  Use the verification code below to complete your request. This code is valid for a limited time.
                </p>

                <!-- OTP Box -->
                <div style="display:inline-block; background-color:#f0f3ff; border:2px dashed #2575fc; border-radius:10px; padding:18px 40px; margin:8px 0 24px 0;">
                  <span style="font-size:36px; font-weight:bold; letter-spacing:10px; color:#2575fc;">${otp}</span>
                </div>

                <p style="margin:0; color:#999; font-size:14px; line-height:1.6;">
                  If you did not request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#fafafa; padding:24px 40px; text-align:center; border-top:1px solid #eee;">
                <p style="margin:0; color:#aaa; font-size:13px;">
                  &copy; ${new Date().getFullYear()} SarahaApp. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
