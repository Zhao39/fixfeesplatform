const path = require('path')
const fs = require("fs");

let dotenvPath = path.resolve(process.cwd(), '.env')
const liveEnvPath = '/var/www/html/fixfeesplatform-backend/dist/.env'
if (fs.existsSync(liveEnvPath)) {
  dotenvPath = liveEnvPath
}
//console.log('process.cwd()', process.cwd())
//console.log('--------dotenvPath---------', dotenvPath)
require('dotenv').config({ path: dotenvPath })

//console.log('process.env.BASE_URL:::::', process.env.BASE_URL)

export const {
  MAINTANCE_MODE,
  PORT,
  DB_HOST,
  DB_USER,
  DB_PWD,
  DB_NAME,
  DB_PORT,
  DB_CONNECTION_LIMIT,
  USE_WORKER,
  BASE_URL,
  BASE_FRONT_URL,
  BASE_APP_URL,
  BASE_PARTNER_URL,
  BASE_BUSINESS_URL,
  BACKEND_LOCATION, //localhost, prod
  ENVIRONMENT,
  SITE_MODE,
  TICKET_IS_LIMITED,
  AUTO_EMAIL_VERIFICATION,
  EMAIL_FUNC,
  CRON_FUNC,
  SMS_FUNC,
  SMS_FROM_NUMBER,
  SMS_API_KEY,
  SMS_API_SECRET,
  NMI_IS_LIVE,
  NMI_LIVE_SECRET_KEY,
  NMI_TEST_SECRET_KEY,
  NMI_SIGN_KEY,
  MAILER_TYPE,
  SES_HOST,
  SES_USER,
  SES_PASS,
  SES_SENDER_EMAIL,
  SENDER_EMAIL,
  SMTP_SERVER,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  GMAIL_SMTP_USERNAME,
  GMAIL_SMTP_PASSWORD,
  UPLOAD_DIR,
  LOG_DIR,
  ROUTES_DIR,
  MODELS_DIR,
  ASSETS_DIR,
  SSL_PRIVATE_KEY,
  SSL_CHAIN_CERT,
  AWS_REGION,
  AWS_S3_API_VERSION,
  AWS_S3_BUCKET,
  AWS_S3_BUCKET_BASE_URL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  TEST_EMAIL_ADDRESS,
  IRIS_API_KEY,
  GOOGLE_CLIENT_SECRET_JSON,
  GOOGLE_OAUTH_USER_REDIRECT_URL,
  GOOGLE_OAUTH_ADMIN_REDIRECT_URL,
  PAYQUICKER_CLIENT_ID,
  PAYQUICKER_CLIENT_SECRET,
  JWT_SECRET,
  ENCRYPT_HASH_KEY,
  DEFAULT_PASSWORD
} = process.env

export const FRONT_LOGIN_URL = BASE_APP_URL + "login";