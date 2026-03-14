export function otpEmailTemplate(code: string) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OTP Verification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            style="max-width:480px;background:#ffffff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.05);"
          >
            <tr>
              <td style="padding:32px 28px;text-align:center;">
                <h1 style="margin:0 0 12px;font-size:22px;color:#111;">
                  Verify your login
                </h1>

                <p style="margin:0 0 28px;font-size:15px;line-height:1.5;color:#555;">
                  Enter the one-time password below to complete your sign-in.
                </p>

                <div
                  style="
                    display:inline-block;
                    padding:16px 28px;
                    background:#f1f3f5;
                    border-radius:8px;
                    margin-bottom:28px;
                  "
                >
                  <span
                    style="
                      font-size:26px;
                      font-weight:700;
                      letter-spacing:6px;
                      color:#000;
                      font-family:'Courier New',Courier,monospace;
                    "
                  >
                    ${code}
                  </span>
                </div>

                <p style="margin:0;font-size:13px;color:#777;">
                  This code expires in <strong>10 minutes</strong>.
                </p>

                <p style="margin:12px 0 0;font-size:13px;color:#999;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:16px;
                  text-align:center;
                  font-size:12px;
                  color:#aaa;
                  border-top:1px solid #eee;
                "
              >
                © ${new Date().getFullYear()} Plaintext Civic
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
