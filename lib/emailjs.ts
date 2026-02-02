/**
 * EmailJS Utility for Universal Business Communications
 * Integration for techdev.ke ecosystem
 */

export interface EmailParams {
    client_name: string;
    message_body: string;
    call_to_action_link?: string;
    subject: string;
    to_email: string;
}

export interface SimpleEmailParams {
    to_email: string;
    to_name: string;
    subject: string;
    message: string;
    cta_link?: string;
}

export const emailjsService = {
    /**
     * Send email using the universal_business_template
     */
    async sendUniversalEmail(params: EmailParams) {
        const serviceId = process.env.EMAILJS_SERVICE_ID;
        const templateId = 'universal_business_template';
        const publicKey = process.env.EMAILJS_PUBLIC_KEY;
        const privateKey = process.env.EMAILJS_PRIVATE_KEY;

        if (!serviceId || !publicKey || !privateKey) {
            console.error('EmailJS configuration missing in environment variables');
            return { success: false, error: 'Configuration missing' };
        }

        try {
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    accessToken: privateKey,
                    template_params: {
                        subject: params.subject,
                        client_name: params.client_name,
                        message_body: params.message_body,
                        call_to_action_link: params.call_to_action_link || '',
                        to_email: params.to_email
                    },
                }),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.text();
                console.error('EmailJS Error:', errorData);
                return { success: false, error: errorData };
            }
        } catch (error) {
            console.error('EmailJS Connection Error:', error);
            return { success: false, error: 'Connection failed' };
        }
    }
};

/**
 * Simple helper function for sending emails
 */
export async function sendEmail(params: SimpleEmailParams) {
    return emailjsService.sendUniversalEmail({
        to_email: params.to_email,
        client_name: params.to_name,
        subject: params.subject,
        message_body: params.message,
        call_to_action_link: params.cta_link,
    });
}
