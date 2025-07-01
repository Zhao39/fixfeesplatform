# Stripe Integration in Carbon

## Current State

**Stripe is NOT currently integrated or configured in the Carbon codebase.** However, there is a billing infrastructure foundation that has been prepared for future Stripe integration.

## Database Schema for Billing

A recent migration (20250619100940_billing.sql) added billing-related database tables that reference Stripe:

### Tables Created:
1. **`planTemplate`** - Defines subscription plan templates
   - Contains `stripePriceId` and `stripeProductId` fields
   - Supports different plan types: 'Trial', 'Per User', 'Flat Fee'
   - Includes pricing, limits, and trial period configurations

2. **`companyPlan`** - Links companies to their subscription plans
   - Contains `stripeCustomerId` and `stripeSubscriptionId` fields
   - Tracks subscription status, billing cycle, and usage limits
   - References planTemplate for plan details

3. **`companyUsage`** - Tracks company usage metrics
   - Monitors users, tasks, and AI tokens consumed
   - Includes usage reset dates for billing cycles

4. **`billingEvent`** - Logs billing-related events
   - Contains `stripeEventId` field for webhook event tracking
   - Stores event metadata and amounts

## Dependencies

- **No Stripe SDK** is currently installed in any package.json files
- No Stripe-related environment variables are configured
- No Stripe webhook handlers exist

## Integration Points Ready

The database schema suggests the following integration pattern is planned:
- Stripe customers will be created and linked via `stripeCustomerId`
- Stripe subscriptions will be tracked via `stripeSubscriptionId` 
- Stripe webhook events will be logged in `billingEvent` table
- Plan templates will reference Stripe products and prices

## Existing Infrastructure

- **Webhook system**: Generic webhook infrastructure exists (`/packages/database/supabase/functions/webhook/`) but not Stripe-specific
- **API framework**: REST API structure is in place that could support billing endpoints
- **Environment setup**: Template exists for adding Stripe environment variables

## Next Steps for Stripe Integration

To implement Stripe integration, you would need to:
1. Add Stripe SDK dependency (`stripe` npm package)
2. Configure Stripe environment variables (API keys)
3. Implement Stripe customer creation functions
4. Implement Stripe subscription management functions
5. Create Stripe webhook handlers for billing events
6. Build UI components for subscription management

## Related Files

- Database migration: `/packages/database/supabase/migrations/20250619100940_billing.sql`
- API layout (excludes billing tables): `/apps/erp/app/routes/x+/api+/_layout.tsx`
- Generic webhook handler: `/packages/database/supabase/functions/webhook/index.ts`