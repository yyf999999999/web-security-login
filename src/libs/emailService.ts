import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: '【重要】メールアドレス認証コード',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>メールアドレス認証</h2>
        <p>以下の認証コードを入力してください：</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">※ このコードは10分間有効です</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};