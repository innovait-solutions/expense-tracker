import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPartnerInviteEmail({
  email,
  partnerName,
  organizationName,
  inviterName,
}: {
  email: string;
  partnerName: string;
  organizationName: string;
  inviterName: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'FinanceFlow <onboarding@resend.dev>',
      to: [email],
      subject: `Invitation to collaborate on ${organizationName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">Hello ${partnerName},</h2>
          <p style="color: #475569; line-height: 1.6;">
            <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on FinanceFlow to collaborate on financial tracking and investments.
          </p>
          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register" 
               style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Join Organization
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            If you already have an account, simply log in to see the new organization.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            This email was sent by FinanceFlow.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error };
  }
}
