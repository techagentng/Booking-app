# Stripe Integration Plan

## Environment Variables
```bash
# .env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
FRONTEND_URL=http://localhost:3000
```

## Integration Steps

### 1. Install Stripe Dependencies
```bash
npm install stripe @stripe/stripe-js
```

### 2. Create Checkout Session API
- Create API endpoint for Stripe checkout sessions
- Handle payment completion webhooks
- Update booking status after successful payment

### 3. Frontend Integration
- Add Stripe Elements for payment form
- Handle payment success/failure
- Redirect to appropriate pages

### 4. Testing
- Use Stripe test mode for development
- Test various payment scenarios
- Verify webhook handling

## Security Notes
- Never commit actual secret keys
- Use environment variables in production
- Implement webhook signature verification
