// SOS Emergency WhatsApp Service — Twilio-powered
// Patient SOS → Family contacts | Caregiver SOS → Admin

const ADMIN_NUMBER = '+917396397130';
const FAMILY_NUMBERS = ['+918790015743', '+919652378004'];

/**
 * Send an SOS WhatsApp message via Twilio server proxy
 */
async function sendSOS(to, message) {
  try {
    const res = await fetch('/api/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    });
    return await res.json();
  } catch (err) {
    console.error('SOS send failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Trigger SOS based on role
 * @param {'patient'|'caregiver'} role
 * @param {string} senderName
 */
export async function triggerSOS(role, senderName) {
  if (role === 'caregiver') {
    // Caregiver → alert Admin
    const msg = `🚨 SOS ALERT — AI CareMatch\n\nCaregiver ${senderName} has triggered an emergency SOS.\nImmediate attention required.\n\n🔴 Automated emergency alert.`;
    return sendSOS(ADMIN_NUMBER, msg);
  } else {
    // Patient → alert Family contacts
    const msg = `🚨 SOS ALERT — AI CareMatch\n\nPatient ${senderName} needs emergency help.\nPlease check on them immediately.\n\n🔴 Automated emergency alert.`;
    const results = await Promise.allSettled(
      FAMILY_NUMBERS.map(num => sendSOS(num, msg))
    );
    const sent = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    return { success: sent > 0, sent, total: FAMILY_NUMBERS.length };
  }
}
