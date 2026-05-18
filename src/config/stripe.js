/** Stripe publishable key (pk_test_... or pk_live_...). Replace with your key from the Stripe Dashboard. */
export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51S3xKAJpLBz7gvjaILNW9oSZiqOx06YRr5ldxIfOxHP1GxtQLxXPHx9w9tq1g8D4TmveoQWJXR98eFYfWhOtXFF800kF3368jF';

/** Donation API `amount` is in dollars (e.g. 25), not cents — backend converts to Stripe cents. */
/** Card-only: no redirect-based payment methods (backend must forward to Stripe PaymentIntent.create). */
export const CARD_PAYMENT_INTENT_OPTIONS = {
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'never',
  },
};

/** Payment Sheet: cards only, no delayed / redirect methods on the client. */
export const CARD_PAYMENT_SHEET_OPTIONS = {
  allowsDelayedPaymentMethods: false,
  paymentMethodOrder: ['card'],
};
