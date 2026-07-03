import { Resend } from 'resend';
import { config } from '../config/index.js';

export const resend = new Resend(config.RESEND_API_KEY);

export const sendCommentNotificationEmail = async (
  ownerEmail: string,
  adTitle: string,
  commenterName: string,
  commentText: string
): Promise<void> => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'zobazar <onboarding@resend.dev>',
      to: ownerEmail,
      subject: `New Comment on your Ad: "${adTitle}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5eeff; border-radius: 12px;">
          <h2 style="color: #00685f; margin-top: 0;">New Comment Posted!</h2>
          <p>Hi there,</p>
          <p>Someone left a comment on your advertisement <strong>"${adTitle}"</strong>.</p>
          
          <div style="background-color: #f8f9ff; padding: 15px; border-radius: 8px; border: 1px solid #dae2fd; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #0b1c30;">Commenter: ${commenterName}</p>
            <p style="margin: 10px 0 0 0; color: #565e74; font-style: italic;">"${commentText}"</p>
          </div>
          
          <p style="font-size: 12px; color: #bcc9c6; margin-bottom: 0; border-t: 1px solid #eff4ff; pt: 10px;">
            You are receiving this because you are the owner of this advertisement on zobazar.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend email error:', error);
    } else {
      console.log('Notification email sent successfully:', data?.id);
    }
  } catch (err) {
    console.error('Failed to send notification email:', err);
  }
};
