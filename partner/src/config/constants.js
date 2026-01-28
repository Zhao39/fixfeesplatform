export const BACKEND_LOCATION = "prod"; //"localhost", "dev", "prod"
export const RECAPTCHA_ENABLED = "true"; //"false", "true"

export const APP_NAME = "FixFeesPlatform"; //partners.fixmyfees.com 
export const WEBSITE_VERSION = "1.6";
export const TOKEN_EXPIRE_TIMESTAMP = (BACKEND_LOCATION === "localhost" ? 10000 : 1) * 15 * 60; // 15 minutes


let base_site_url = "";
let base_api_url = "";
let socket_server_url = "";
let base_upload_url = "";
let base_front_url = ""
let base_app_url = ""

if (BACKEND_LOCATION === "localhost") {
  base_site_url = "http://localhost"
  base_api_url = base_site_url + ":8090"
  base_front_url = base_site_url + ":3000"
  base_app_url = base_front_url
  socket_server_url = base_api_url
  base_upload_url = base_site_url + ""
}
else if (BACKEND_LOCATION === "dev") {
  base_site_url = "http://35.155.153.70"
  base_api_url = base_site_url + ":8090"
  base_front_url = base_site_url + ""
  base_app_url = base_front_url
  socket_server_url = base_api_url
  base_upload_url = base_site_url + ""
}
else if (BACKEND_LOCATION === "prod") {
  base_site_url = "https://partners.fixmyfees.com"
  base_api_url = "https://api.fixmyfees.com"
  base_front_url = base_site_url + ""
  base_app_url = "https://partners.fixmyfees.com"
  socket_server_url = base_api_url + ":8090"
  base_upload_url = base_app_url + ""
}

export const BASE_SITE_URL = base_site_url
export const BASE_FRONT_URL = base_front_url
export const BASE_APP_URL = base_app_url
export const BASE_API_URL = base_api_url
export const SOCKET_SERVER_URL = socket_server_url
export const BASE_UPLOAD_URL = base_upload_url

export const SITE_MODE = "live";
export const SYSTEM_ERROR = "System error. Please try again later!";
export const CTA_YES = "Yes";
export const CTA_NO = "No";
export const CTA_CANCEL = "Cancel";

export const RECAPTCHA_KEY = "6LdbHf8qAAAAACWWVPQUpfmyzhuESTDuk3g2Irmd"; //"6LeMLwcfAAAAAGZ8Vb5m6UjxUl3wTboTmmKqn4IQ"

export const WITHDRAWAL_MIN_AMOUNT = 20
export const LICENSE_PRICE = 19.97

export const MAIN_USER_ROUTE = "/user/dashboard" // "/user/summary";
export const USER_LOCKED_ROUTE = "/user/locked"
export const PRIMARY_COLOR = "#0eaf00";

export const SOCIAL_FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61550362210536";
export const SOCIAL_INSTAGRAM_URL = "https://www.instagram.com/fixmyfees/";
export const SOCIAL_LINKEDIN_URL = "https://www.linkedin.com/company/fix-my-fees";

export const COMMUNITY_URL = "https://facebook.com";

//////////////////////////////////////////////////////////////////////////////////////////////////
export const CARD_TYPE_LIST = [
  {
    value: "passport",
    text: "Passport"
  },
  {
    value: "id_card",
    text: "ID Card"
  }
]
export const KYC_STATUS = {
  NOT_VERIVIED: 0,
  VERIVIED: 1,
  REJECTED: 2
}

export const ACCOUNT_TYPE = {
  BRAND: "brand",
  AGENCY: "agency"
}

export const MEMBERSHIP_PLANS = [
  {
    id: 1,
    membership_type: 1,
    active: true,
    icon: '',
    title: 'Brand Partner Membership',
    description: '',
    price: LICENSE_PRICE,
    period: 'month',
    featureList: []
  },

];

export const COUPON_TYPE_LIST = [ //type: 0 - day trial coupon, 1 - percent discount coupon, 2: 100% discount forever
  {
    id: 1,
    type: 0,
    value: 7,
    desc: "7 Day Trial Coupon",
  },
  // {
  //   id: 2,
  //   type: 0,
  //   value: 14,
  //   desc: "14 Day Trial Coupon",
  // },
  {
    id: 3,
    type: 0,
    value: 30,
    desc: "30 Day Trial Coupon",
  },
  {
    id: 4,
    type: 1,
    value: 50,
    desc: "50% Discount Coupon",
  },
  {
    id: 5,
    type: 2,
    value: 99999999,
    desc: "100% Discount Coupon",
  },
];

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

export const MERCHANT_COLORS = {
  "-1": 'linear-gradient(164deg, rgba(250,250,250,1) 0%, rgba(254,255,239,0.5943627450980392) 0%, rgba(252,252,252,1) 50%, rgba(255,255,255,0.6307773109243697) 97%)',
  "0": 'linear-gradient(308deg, rgba(228,241,0,1) 0%, rgba(247,255,53,0.7232142857142857) 36%, rgba(207,255,0,1) 100%)',
  "1": 'linear-gradient(308deg, rgba(241,186,0,1) 0%, rgba(255,212,53,0.7232142857142857) 36%, rgba(255,175,0,1) 100%)',
  "2": 'linear-gradient(308deg, rgba(0,21,241,1) 0%, rgba(73,53,255,0.7232142857142857) 36%, rgba(0,87,255,1) 100%)',
  "3": 'linear-gradient(308deg, rgba(0,241,105,1) 0%, rgba(8,156,62,0.7232142857142857) 0%, rgba(22,150,0,1) 100%)',
  "4": 'linear-gradient(203deg, rgba(201,46,12,1) 11%, rgba(201,123,12,1) 26%, rgba(201,81,12,1) 68%, rgba(201,46,12,1) 84%)',
}
export const MERCHANT_STATUS_LIST = {
  "-1": "Prospects",
  "0": "OnBoarding",
  "1": "Underwriting",
  "2": "Install",
  "3": "Active Merchant",
  "4": "Closed Merchant"
}
export const PARTNER_COLORS = {
  "3": 'linear-gradient(164deg, rgba(250,250,250,1) 0%, rgba(254,255,239,0.5943627450980392) 0%, rgba(252,252,252,1) 50%, rgba(255,255,255,0.6307773109243697) 97%)',
  "2": 'linear-gradient(308deg, rgba(228,241,0,1) 0%, rgba(247,255,53,0.7232142857142857) 36%, rgba(207,255,0,1) 100%)',
  "1": 'linear-gradient(308deg, rgba(0,241,105,1) 0%, rgba(8,156,62,0.7232142857142857) 0%, rgba(22,150,0,1) 100%)',
  "0": 'linear-gradient(203deg, rgba(201,46,12,1) 11%, rgba(201,123,12,1) 26%, rgba(201,81,12,1) 68%, rgba(201,46,12,1) 84%)',
}
export const BRAND_PARTNER_STATUS_LIST = {
  "0": "Inactive",
  "1": "Active",
  "2": "Opt-In",
  "3": "Prospects",
}
export const ADMIN_TYPE = {
  "SUPER_ADMIN": "superadmin",
  "ADMIN": "admin",
  "ASSISTANT": "assistant"
}
