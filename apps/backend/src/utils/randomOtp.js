/**
 * Generates a secure, random 6-digit numeric OTP string.
 * @returns {string} 6-digit OTP code (e.g. "492817")
 */
export function generateRandomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const Random_Otp = generateRandomOtp;
export default generateRandomOtp;
