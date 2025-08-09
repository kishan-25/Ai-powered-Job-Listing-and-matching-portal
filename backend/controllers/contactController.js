const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  console.log('Email Config Check:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Loaded' : 'Missing');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded (length: ' + process.env.EMAIL_PASS.length + ')' : 'Missing');
  console.log('- EMAIL_HOST:', process.env.EMAIL_HOST || 'Default: smtp.gmail.com');
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
};

// Send contact form email
const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, inquiryType, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !inquiryType || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@talentalign.com',
      to: 'bkbajpay0905@gmail.com',
      subject: `TalentAlign Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #84cc16, #65a30d); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">TalentAlign Contact Form</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Name:</td>
                  <td style="padding: 10px; color: #333; border-bottom: 1px solid #eee;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Email:</td>
                  <td style="padding: 10px; color: #333; border-bottom: 1px solid #eee;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Subject:</td>
                  <td style="padding: 10px; color: #333; border-bottom: 1px solid #eee;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Inquiry Type:</td>
                  <td style="padding: 10px; color: #333; border-bottom: 1px solid #eee;">${inquiryType}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #2d5a2d; font-size: 14px;">
                This email was sent from the TalentAlign contact form. Please respond directly to: ${email}
              </p>
            </div>
          </div>
        </div>
      `,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon."
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: error.message
    });
  }
};

module.exports = { sendContactEmail };
