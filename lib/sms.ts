/**
 * SMS Utility for CREATIVE.KE
 * Supports Twilio and Africa's Talking (East Africa Standard)
 */

interface SendSMSOptions {
    to: string;
    message: string;
}

export const smsService = {
    /**
     * Send a transactional SMS alert
     * For production: Replace console logs with real API calls to Twilio or Africa's Talking
     */
    async sendAlert({ to, message }: SendSMSOptions) {
        console.log(`[SMS_SIMULATOR] Outbound Alert to ${to}: "${message}"`);

        // Example implementation for Africa's Talking
        /*
        const options = {
            apiKey: process.env.AT_API_KEY,
            username: process.env.AT_USERNAME,
        };
        const AfricasTalking = require('africastalking')(options);
        const sms = AfricasTalking.SMS;
        
        try {
            const result = await sms.send({ to, message });
            return { success: true, result };
        } catch (err) {
            console.error('SMS Error:', err);
            return { success: false, error: err };
        }
        */

        return { success: true, simulated: true };
    },

    /**
     * Notify about milestone approval
     */
    async notifyMilestoneApproved(to: string, projectTitle: string, amount: string) {
        const message = `[CREATIVE.KE] Milestone approved for "${projectTitle}". Payment of KES ${amount} has been released to your escrow.`;
        return this.sendAlert({ to, message });
    },

    /**
     * Notify about new project invitation
     */
    async notifyProjectInvite(to: string, commissionerName: string, projectTitle: string) {
        const message = `[CREATIVE.KE] ${commissionerName} invited you to collaborate on "${projectTitle}". Review details on your dashboard.`;
        return this.sendAlert({ to, message });
    }
};
