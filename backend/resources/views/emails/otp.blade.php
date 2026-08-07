<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kabaya Verification Code</title>
</head>

<body
  style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px 0;">

  <!-- Preheader text (Visible in inbox preview without exposing the code) -->
  <div
    style="display: none; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: transparent;">
    Use this verification code to proceed with your request on Kabaya.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">

        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
          style="max-width: 500px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">

          <!-- Header (Primary Brand Color: #e11d48) -->
          <tr>
            <td align="center" style="background-color: #e11d48; padding: 24px;">
              <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 2px;">KABAYA</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px 0;">Verification Code</h1>

              <p style="font-size: 14px; line-height: 24px; color: #4b5563; margin: 0 0 24px 0;">
                Please enter the verification code below to complete your request.
              </p>

              <!-- OTP Box (Tinted Background: #fff1f2 | Border: #fecdd3) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; text-align: center;">
                <tr>
                  <td style="padding: 24px;">
                    <span
                      style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9f1239; font-weight: 600; display: block;">Verification
                      Code</span>

                    <!-- Dynamic OTP rendered from Laravel -->
                    <span
                      style="font-size: 32px; font-weight: 700; color: #881337; font-family: monospace; letter-spacing: 4px; display: block; margin: 8px 0;">{{ $otp }}</span>

                    <span style="font-size: 12px; color: #be123c;">(This code is valid for 3 minutes)</span>
                  </td>
                </tr>
              </table>

              <!-- Prominent Security Warning Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; margin-top: 24px; text-align: left;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="font-size: 13px; line-height: 20px; color: #991b1b; margin: 0; font-weight: 600;">
                      Security Warning:
                    </p>
                    <p style="font-size: 12px; line-height: 18px; color: #7f1d1d; margin: 4px 0 0 0;">
                      Do not share this code with anyone. Kabaya staff will <strong>never</strong> ask for your
                      verification code, password, or banking details. If you did not request this code, please ignore
                      this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="font-size: 11px; line-height: 18px; color: #9ca3af; margin: 0 0 8px 0;">
                This message was produced and distributed by Kabaya.
              </p>
              <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                © {{ date('Y') }} Kabaya, All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>

</html>