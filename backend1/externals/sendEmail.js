const Brevo = require('@getbrevo/brevo');
const crypto = require('crypto');
const redisClient = require('../database/redisConnection');

async function sendEmail(userData) {
  try {
    const secret = crypto.randomBytes(3).toString('hex');
    console.log('Generated OTP:', secret);

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = {
      to: [{ email: userData.email }],
      sender: { email: "jagdishgithub1@gmail.com", name: "JVCS Space" },
      subject: "JVCS | OTP Verification",
      htmlContent: `
      <div style="background-color:#0d0221;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:520px;margin:0 auto;background:#120b2b;border-radius:14px;
          border:1px solid rgba(255,0,110,0.3);
          box-shadow:0 0 25px rgba(255,0,110,0.25);
          padding:30px;color:#ffffff;">
    
          <!-- Header -->
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;">
            <div style="
              width:46px;height:46px;
              background:linear-gradient(135deg,#ff006e,#00d9ff);
              border-radius:10px;
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 0 15px rgba(255,0,110,0.6);
              font-weight:bold;font-size:20px;">
              &lt;/&gt;
            </div>
            <div>
              <h2 style="margin:0;font-family:monospace;
                background:linear-gradient(90deg,#ff006e,#00d9ff);
                -webkit-background-clip:text;
                -webkit-text-fill-color:transparent;">
                JVCS Space
              </h2>
              <p style="margin:4px 0 0;font-size:12px;color:#bdbdbd;">
                Version Control • Collaboration • Security
              </p>
            </div>
          </div>
    
          <!-- Body -->
          <h3 style="margin-bottom:12px;color:#ffffff;">
            OTP Verification
          </h3>
    
          <p style="color:#cfcfcf;font-size:14px;line-height:1.6;">
            Use the OTP below to verify your email address.  
            This OTP is valid for <strong>5 minutes</strong>.
          </p>
    
          <!-- OTP Box -->
          <div style="
            margin:26px 0;
            padding:18px;
            text-align:center;
            font-size:28px;
            letter-spacing:6px;
            font-weight:bold;
            color:#00d9ff;
            background:rgba(0,217,255,0.08);
            border:1px dashed rgba(0,217,255,0.6);
            border-radius:12px;
            font-family:monospace;">
            ${secret}
          </div>
    
          <p style="font-size:13px;color:#a9a9a9;">
            If you didn’t request this, you can safely ignore this email.
          </p>
    
          <!-- Footer -->
          <div style="margin-top:30px;padding-top:16px;border-top:1px solid rgba(255,0,110,0.25);
            font-size:12px;color:#8e8e8e;text-align:center;">
            © ${new Date().getFullYear()} JVCS Space  
            <br />
            <span style="color:#ff006e;">Secure</span> • 
            <span style="color:#00d9ff;">Fast</span> • 
            <span style="color:#ff006e;">Developer-First</span>
          </div>
        </div>
      </div>
      `,
    };


    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully to', userData.email);

    const { username, email, password } = userData;
    await redisClient.set(`otp:${email}`, secret, { EX: 300 });
    await redisClient.set(
      `user:${email}`,
      JSON.stringify({ username, email, password }),
      { EX: 300 }
    );
    return true;
  } catch (err) {
    console.error('Error sending email:', err.response?.body || err.message);
    return false;
  }
}

module.exports = sendEmail;
