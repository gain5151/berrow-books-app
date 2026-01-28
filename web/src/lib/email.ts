import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

type EmailParams = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail({ to, subject, html }: EmailParams) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

// 申請時: 管理者へ通知
export async function sendRequestNotification(params: {
  adminEmail: string;
  bookTitle: string;
  requesterEmail: string;
  roomName: string;
}) {
  const { adminEmail, bookTitle, requesterEmail, roomName } = params;

  return sendEmail({
    to: adminEmail,
    subject: `[Berrow Books] 新しい書籍申請: ${bookTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">新しい書籍申請</h1>
        <p>以下の書籍申請がありました。</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">ルーム</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${roomName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">書籍タイトル</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">申請者</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${requesterEmail}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">管理画面から対応をお願いします。</p>
      </div>
    `,
  });
}

// 返却期限: 催促メール
export async function sendReturnReminder(params: {
  userEmail: string;
  bookTitle: string;
  returnDueDate: Date;
}) {
  const { userEmail, bookTitle, returnDueDate } = params;
  const formattedDate = returnDueDate.toLocaleDateString("ja-JP");

  return sendEmail({
    to: userEmail,
    subject: `[Berrow Books] 返却期限のお知らせ: ${bookTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">返却期限のお知らせ</h1>
        <p>以下の書籍の返却期限が近づいています。</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">書籍タイトル</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">返却期限</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #e53e3e;">${formattedDate}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">期限までに返却をお願いします。</p>
      </div>
    `,
  });
}

// 返却完了: 完了通知メール
export async function sendReturnCompleteNotification(params: {
  userEmail: string;
  bookTitle: string;
}) {
  const { userEmail, bookTitle } = params;

  return sendEmail({
    to: userEmail,
    subject: `[Berrow Books] 返却完了: ${bookTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">返却が完了しました</h1>
        <p>以下の書籍の返却が完了しました。ご利用ありがとうございました。</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">書籍タイトル</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookTitle}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">またのご利用をお待ちしております。</p>
      </div>
    `,
  });
}

// 送付完了通知
export async function sendShippedNotification(params: {
  userEmail: string;
  bookTitle: string;
  returnDueDate?: Date;
}) {
  const { userEmail, bookTitle, returnDueDate } = params;
  const formattedDate = returnDueDate?.toLocaleDateString("ja-JP") || "未設定";

  return sendEmail({
    to: userEmail,
    subject: `[Berrow Books] 書籍を送付しました: ${bookTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">書籍を送付しました</h1>
        <p>ご申請の書籍を送付しました。</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">書籍タイトル</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">返却期限</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formattedDate}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">届きましたらご確認ください。</p>
      </div>
    `,
  });
}
