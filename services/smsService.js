/**
 * SMS Service - Send SMS notifications via standalone SMS server
 */

// SMS Server URL - در production باید به URL واقعی تغییر کنه
const SMS_API_URL = process.env.NEXT_PUBLIC_SMS_API_URL || 'http://localhost:3005';

/**
 * Send registration welcome SMS
 * @param {string} mobileNumber - User mobile number
 */
export const sendRegistrationSMS = async (mobileNumber) => {
    try {
        console.log('[SMS] Sending registration SMS to:', mobileNumber);
        
        const response = await fetch(`${SMS_API_URL}/sms/send/registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobileNumber })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('[SMS] Registration SMS sent successfully:', result.message);
        } else {
            console.error('[SMS] Failed to send registration SMS:', result.message);
        }
        
        return result;
    } catch (error) {
        console.error('[SMS] Error sending registration SMS:', error);
        // Don't throw - SMS failure shouldn't break the main flow
        return { statusCode: 500, message: error.message };
    }
};

/**
 * Send deposit notification SMS
 * @param {string} mobileNumber - User mobile number
 * @param {number} amount - Deposit amount
 */
export const sendDepositSMS = async (mobileNumber, amount) => {
    try {
        console.log('[SMS] Sending deposit SMS to:', mobileNumber, 'Amount:', amount);
        
        const response = await fetch(`${SMS_API_URL}/sms/send/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobileNumber, amount })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('[SMS] Deposit SMS sent successfully:', result.message);
        } else {
            console.error('[SMS] Failed to send deposit SMS:', result.message);
        }
        
        return result;
    } catch (error) {
        console.error('[SMS] Error sending deposit SMS:', error);
        return { statusCode: 500, message: error.message };
    }
};

/**
 * Send withdrawal notification SMS
 * @param {string} mobileNumber - User mobile number
 * @param {number} amount - Withdrawal amount
 */
export const sendWithdrawalSMS = async (mobileNumber, amount) => {
    try {
        console.log('[SMS] Sending withdrawal SMS to:', mobileNumber, 'Amount:', amount);
        
        const response = await fetch(`${SMS_API_URL}/sms/send/withdrawal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mobileNumber, amount })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('[SMS] Withdrawal SMS sent successfully:', result.message);
        } else {
            console.error('[SMS] Failed to send withdrawal SMS:', result.message);
        }
        
        return result;
    } catch (error) {
        console.error('[SMS] Error sending withdrawal SMS:', error);
        return { statusCode: 500, message: error.message };
    }
};

/**
 * Check SMS service health
 */
export const checkSMSServiceHealth = async () => {
    try {
        const response = await fetch(`${SMS_API_URL}/health`);
        const result = await response.json();
        console.log('[SMS] Service health:', result);
        return result;
    } catch (error) {
        console.error('[SMS] Service health check failed:', error);
        return { status: 'ERROR', message: error.message };
    }
};
