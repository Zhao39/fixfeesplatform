-- Insert default plan templates
INSERT INTO "planTemplate" (
  "name", 
  "description", 
  "planType", 
  "stripePriceId", 
  "stripeProductId", 
  "pricePerUser", 
  "flatPrice", 
  "includedUsers", 
  "includedTasks", 
  "includedAiTokens", 
  "trialDays", 
  "active"
) VALUES 
(
  'Free Trial',
  'Try Carbon for 14 days with full access to all features',
  'Trial',
  'price_trial_placeholder',
  'prod_trial_placeholder',
  NULL,
  NULL,
  5,
  10000,
  1000000,
  14,
  TRUE
),
(
  'Starter',
  'Perfect for small teams getting started with manufacturing',
  'Flat Fee',
  'price_starter_placeholder',
  'prod_starter_placeholder',
  NULL,
  99.00,
  10,
  50000,
  5000000,
  NULL,
  TRUE
),
(
  'Professional',
  'Ideal for growing businesses with advanced manufacturing needs',
  'Per User',
  'price_professional_placeholder',
  'prod_professional_placeholder',
  25.00,
  NULL,
  1,
  100000,
  10000000,
  NULL,
  TRUE
);

-- Add comment
COMMENT ON TABLE "planTemplate" IS 'Defines available subscription plans with pricing and limits';