import { BACKEND_LOCATION } from "./env.config";

export const API_VERSION = "2024-05-18" // will be changed when deployment
export const APP_NAME = "FixFeesPlatform"

// Security: These must be set via environment variables
export const ENCRYPT_HASH_KEY = process.env.ENCRYPT_HASH_KEY || (() => {
  throw new Error('ENCRYPT_HASH_KEY environment variable is required');
})();
export const JWT_SECRET = process.env.JWT_SECRET || (() => {
  throw new Error('JWT_SECRET environment variable is required');
})();
export const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || (() => {
  throw new Error('DEFAULT_PASSWORD environment variable is required');
})();

export const TOKEN_EXPIRE_TIMESTAMP = (BACKEND_LOCATION === "localhost" ? 10000 : 1) * 15 * 60; // 15 minutes

export const KYC_STATUS = {
    NOT_VERIVIED: 0,
    VERIVIED: 1,
    REJECTED: 2
}

//////////////////////////////////////////////////////////////////////////////////

export const LICENSE_TRIAL_PRICE = 1 //$
export const MEMBERSHIP_PRICE = { // license price according to membership
    1: 19.97,
    2: 200
}
export const MEMBERSHIP_PERIOD = { // license duration according to membership
    1: 30,
    2: 365
}
export const FEE_PERIOD = 30 //days
export const FEE_ANNUAL_PERIOD = 365 //days
export const TRIAL_LICENSE_DURATION = 7;//days

export const MINIMUM_WITHDRAWAL_AMOUNT = 20; //$
export const REFERRAL_FEE = 10 // percent

export const MEMBER_TYPE = {
    FREE_MEMBER: "Free Member",
}
export const PLAN_TYPE = {
    MONTHLY: "monthly",
    YEARLY: "yearly"
}

export const TICKET_DAILY_LIMIT = 3

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DDTHH:mm:ssZ"

export const USER_NOTIFICATION_STATUS = {
    NEW: "new",
    READ: "read",
    DELETED: "deleted"
}

export const NOTIFICATION_TYPE = {
    ALARM: "alarm",
    CONFIRM: "confirm",
    ACCEPT: "accept"
}

export const ENVIRONMENT = {
    PARTNER: "partner",
    BUSINESS: "business"
}

export const DEFAULT_PROCESSOR_ID = 3

export const RANK_TYPE = {
    SILVER: "silver",
    GOLD: "gold",
    PLATINUM: "platinum"
}

export const RANK_TYPE_TEXT = {
    "silver": "Silver",
    "gold": "Gold",
    "platinum": "Platinum"
}

export const TIER_TYPE = {
    TIER_4: "tier_4",
    TIER_3: "tier_3",
    TIER_2: "tier_2",
    TIER_1: "tier_1",
}

export const TIER_TYPE_TEXT = {
    "tier_4": "Tier 4",
    "tier_3": "Tier 3",
    "tier_2": "Tier 2",
    "tier_1": "Tier 1",
}

export const REWARD_TYPE = {
    TIER: "tier",
    OVERRIDE_RANK: "override_rank"
}

export const TRAINING_TYPE = {
    MERCHANT: "merchant",
    BRAND_PARTNER: "brand_partner",
    LIVE: "live"
}

export const MERCHANT_STATUS = {
    PROSPECTS: "-1",
    ONBOARDING: "0",
    UNDERWRITING: "1",
    INSTALL: "2",
    ACTIVE: "3",
    CLOSED: "4"
}

export const MERCHANT_STATUS_TEXT = {
    "-1": "Prospects",
    "0": "OnBoarding",
    "1": "Underwriting",
    "2": "Install",
    "3": "Active Merchant",
    "4": "Closed Merchant"
}

export const BRAND_PARTNER_STATUS = {
    INACTIVE: "0",
    ACTIVE: "1",
    OPTIN: "2",
    PROSPECTS: "3"
}

export const BRAND_PARTNER_STATUS_TEXT = {
    "0": "Inactive",
    "1": "Active",
    "2": "Opt-In",
    "3": "Prospects",
}

export const DATE_OPTION = {
    today: 'today',
    last_7: 'last_7',
    last_30: 'last_30',
    last_90: 'last_90',
    ytd: 'ytd',
    lifetime: 'lifetime'
}

export const PROSPECT_DAILY_LIMIT = 1000

export const PARTNER_DEFAULT_COMMISSION = 0.05  