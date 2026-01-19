import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Fallback to empty string to avoid crash during build if env missing
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});
