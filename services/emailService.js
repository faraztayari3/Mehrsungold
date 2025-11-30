import nodemailer from 'nodemailer';

export async function sendEmail(subject, text) {
  // تنظیمات سرور ایمیل (می‌تونی Gmail یا SMTP اختصاصی بذاری)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // ایمیل فرستنده
      pass: process.env.EMAIL_PASS  // رمز عبور یا App Password
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL, // ایمیل خودت که نوتیف می‌گیری
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
}
