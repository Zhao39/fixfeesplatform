
export const AD_SOURCE_LIST = [
  {
    value: 'facebook',
    text: 'Facebook'
  },
  {
    value: 'tiktok',
    text: 'Tiktok'
  }
]

export const AD_TABLE_COLUMN_LIST = [
  {
    value: 'status',
    text: 'Status',
    columnText: 'Status'
  },
  {
    value: 'name',
    text: 'Name',
    columnText: 'Name'
  },
  //////////////////////////////////////
  {
    value: 'gst_pixel_purchases',
    text: 'Pixel Purchases',
    columnText: 'Purchases',
    columnDesc: "The total value of purchases on ES Pixel",
  },
  {
    value: 'gst_pixel_new_customer_purchases',
    text: 'Pixel New Customer Purchases',
    columnText: 'NCP',
    columnDesc: "The total value of purchases created by new customers on ES Pixel"
  },
  {
    value: 'gst_pixel_new_customer_purchases_percent',
    text: 'Pixel New Customer Purchases Percent',
    columnText: 'NCPP',
    columnDesc: "The percentage of new customer purchases by total purchases on ES Pixel",
    unit: "percentage",
    unitPosition: "after"
  },
  {
    value: 'gst_pixel_cv',
    text: 'Pixel CV',
    columnText: 'CV',
    columnDesc: "Conversion value on ES Pixel",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_new_customer_cv',
    text: 'Pixel New Customer CV',
    columnText: 'NC CV',
    columnDesc: "Conversion value on ES Pixel",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_roas',
    text: 'Pixel ROAS',
    columnText: 'ROAS',
    columnDesc: "The total return on ad spend (ROAS) from purchases on ES Pixel"
  },
  {
    value: 'gst_pixel_new_customer_roas',
    text: 'Pixel New Customer ROAS',
    columnText: 'NC ROAS',
    columnDesc: "The total return on ad spend (ROAS) from new customers' purchases on ES Pixel"
  },
  {
    value: 'gst_pixel_cpa',
    text: 'Pixel CPA',
    columnText: 'CPA',
    columnDesc: "Total Customer Cost Per Acquisition on ES Pixel",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_new_customer_cpa',
    text: 'Pixel New Customer CPA',
    columnText: 'NC CPA',
    columnDesc: "New Customer Cost Per Acquisition on ES Pixel",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_aov',
    text: 'Pixel AOV',
    columnText: 'AOV',
    columnDesc: "Equates to Total Sales (excluding taxes, duties, and shipping) / Number of orders. This is directly from Shopify"
  },
  {
    value: 'gst_pixel_new_customer_aov',
    text: 'Pixel New Customer AOV',
    columnText: 'NC AOV',
    columnDesc: "Equates to New Customers' Sales (excluding taxes, duties, and shipping) / Number of New Customers' orders. This is directly from Shopify"
  },
  {
    value: 'gst_pixel_conversion_rate',
    text: 'Pixel Conversion Rate',
    columnText: 'CR',
    columnDesc: "The percentage of Website purchases by Sessions",
    unit: "percentage",
    unitPosition: "after"
  },
  {
    value: 'gst_pixel_new_customer_conversion_rate',
    text: 'Pixel New Customer Conversion Rate',
    columnText: 'NC CR',
    columnDesc: "The percentage of New Customers' purchases by Sessions",
    unit: "percentage",
    unitPosition: "after"
  },
  {
    value: 'gst_pixel_cost_of_goods',
    text: 'Pixel Cost of Goods',
    columnText: 'COGS',
    columnDesc: "Cost of goods sold in this time frame, minus cost of goods of refunded items in this time frame.",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_new_customer_cost_of_goods',
    text: 'Pixel New Customer Cost of Goods',
    columnText: 'NC COGS',
    columnDesc: "Cost of goods sold by new customer, minus cost of goods of refunded items in this time frame.",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_profit',
    text: 'Pixel Profit',
    columnText: 'Profit',
    columnDesc: "Order Revenue - Returns - Expenses (COGS, Shipping, Handling, Payment Gateways, Taxes, Custom Expenses) - Ad Spend",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_conversion_value_delta',
    text: 'Pixel Conversion Value Delta',
    columnText: 'CVD',
    columnDesc: "ES Pixel CV - Facebook CV  - Tiktok CV",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_sessions',
    text: 'Pixel Sessions',
    columnText: 'Sessions',
    columnDesc: "Total number of sessions"
  },
  {
    value: 'gst_pixel_unique_visitors',
    text: 'Pixel Unique Visitors',
    columnText: 'Unique Visitors',
    columnDesc: "Total number of visitors"
  },
  {
    value: 'gst_pixel_new_visitors',
    text: 'Pixel New Visitors',
    columnText: 'NV',
    columnDesc: "Total number of new visitors"
  },
  {
    value: 'gst_pixel_new_visitor_percent',
    text: 'Pixel New Visitors Percent',
    columnText: 'NVP',
    columnDesc: "The percentage of new visitors by total visitors",
    unit: "percentage",
    unitPosition: "after"
  },
  {
    value: 'gst_pixel_cost_per_new_visitors',
    text: 'Pixel Cost Per New Visitors',
    columnText: 'Cost NV',
    columnDesc: "Pixel Cost Per New Visitors",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'gst_pixel_unique_add_cart',
    text: 'Pixel Unique Add To Carts',
    columnText: 'ATC',
    columnDesc: "Total unique items in Cart"
  },
  {
    value: 'gst_pixel_cost_per_add_cart',
    text: 'Pixel Cost Per Add To Carts',
    columnText: 'Cost ATC',
    columnDesc: "Total cost per Cart Item",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'spend',
    text: 'Spend',
    columnText: 'Spend',
    columnDesc: "The approximate total amount of money you've spent on your campaign, ad set or ad during its schedule.",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'budget',
    text: 'Budget',
    columnText: 'Budget',
    columnDesc: "The maximum amount you're willing to spend on your ad sets or campaigns, on average each day or over the lifetime of your scheduled ad sets or campaigns. \nThis column does not apply to ads, only ad sets and campaigns.",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'purchase',
    text: 'Purchases',
    columnText: 'Purchases',
    columnDesc: "The total value of purchases, attributed to your ads.\nIn some cases, this metric may be estimated."
  },
  {
    value: 'clicks',
    text: 'Clicks',
    columnText: 'Clicks',
    columnDesc: "The number of clicks, taps or swipes on your ads."
  },
  {
    value: 'cpc',
    text: 'CPC',
    columnText: 'CPC',
    columnDesc: "The average cost for each click",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'cpm',
    text: 'CPM',
    columnText: 'CPM',
    columnDesc: "The average cost for 1,000 impressions.",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'cpp',
    text: 'CPP',
    columnText: 'CPP',
    columnDesc: "The average cost of a purchase driven through your ads. It's calculated by dividing the total ad spend with the total number of purchases.",
    unit: "price",
    unitPosition: "before"
  },
  {
    value: 'ctr',
    text: 'CTR',
    columnText: 'CTR',
    columnDesc: "The percentage of impressions where a click occurred out of the total number of impressions.",
    unit: "percentage",
    unitPosition: "after"
  },
  {
    value: 'impressions',
    text: 'Impressions',
    columnText: 'Impressions',
    columnDesc: "The number of times your ads were on screen."
  },
  {
    value: 'reach',
    text: 'Reach',
    columnText: 'Reach',
    columnDesc: "The number of Accounts Center accounts that saw your ads at least once. Reach is different from impressions, which may include multiple views of your ads by the same Accounts Center accounts."
  }
]

export const AD_TABLE_DEFAULT_COLUMN_LIST = ['status', 'name'] //not druggable, not removable

export const AD_TABLE_PRESET_COLUMNS = [
  {
    value: 'default',
    text: 'Default',
    desc: 'Our default recommended preset',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_roas',
      'gst_pixel_cv',
      'gst_pixel_purchases',
      'gst_pixel_cpa',
      'spend',
      'clicks',
      'cpc',
      'cpm',
      'cpp',
      'ctr'
    ]
  },
  {
    value: 'all_page',
    text: 'All Page (Pixel Only)',
    desc: 'View common performance metrics across all paid, social & organic channels.',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_purchases',
      'gst_pixel_new_customer_purchases',
      'gst_pixel_new_customer_purchases_percent',
      'gst_pixel_cv',
      'gst_pixel_new_customer_cv',
      'gst_pixel_roas',
      'gst_pixel_new_customer_roas',
      'gst_pixel_cpa',
      'gst_pixel_new_customer_cpa',
      'gst_pixel_aov',
      'gst_pixel_new_customer_aov',
      'gst_pixel_conversion_rate',
      'gst_pixel_new_customer_conversion_rate',
      'gst_pixel_cost_of_goods',
      'gst_pixel_new_customer_cost_of_goods',
      'gst_pixel_profit',
      'gst_pixel_conversion_value_delta',
      'gst_pixel_sessions',
      'gst_pixel_unique_visitors',
      'gst_pixel_new_visitors',
      'gst_pixel_new_visitor_percent',
      'gst_pixel_cost_per_new_visitors',
      'gst_pixel_unique_add_cart',
      'gst_pixel_cost_per_add_cart'
    ]
  },
  {
    value: 'paid_performance',
    text: 'Paid Performance',
    desc: 'View common performance metrics, such as reach and cost per result.',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_roas',
      'gst_pixel_cv',
      'gst_pixel_purchases',
      'gst_pixel_cpa',
      'spend',
      'budget'
    ]
  },
  {
    value: 'paid_performance_pixel',
    text: 'Paid Performance (Pixel Only)',
    desc: 'View metrics about traffic and conversions from your ads.',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_roas',
      'gst_pixel_cv',
      'gst_pixel_purchases',
      'gst_pixel_cpa'
    ]
  },
  {
    value: 'bidding_optimization',
    text: 'Bidding & Optimization',
    desc: 'View details about bid strategy and the cost of delivering your ads.',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_roas',
      'gst_pixel_cpa',
      'spend',
      'cpc',
      'ctr',
      'impressions',
      'reach'
    ]
  },
  {
    value: 'traffic',
    text: 'Traffic',
    desc: 'View metrics about site visitors and activities, such as add-to-carts and bounce rate.',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_cv',
      'gst_pixel_purchases',
      'gst_pixel_cpa',
      'gst_pixel_sessions',
      'gst_pixel_unique_visitors',
      'gst_pixel_new_visitors',
      'gst_pixel_new_visitor_percent',
      'spend',
      'ctr',
      'impressions',
      'reach'
    ]
  },
  {
    value: 'new_customers',
    text: 'New Customers',
    desc: 'View new customer metrics such as revenue, ROAS, and conversion rate.',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_new_customer_purchases',
      'gst_pixel_new_customer_purchases_percent',
      'gst_pixel_new_customer_cv',
      'gst_pixel_new_customer_roas',
      'gst_pixel_new_customer_cpa',
      'gst_pixel_new_customer_aov',
      'gst_pixel_new_customer_conversion_rate',
      'gst_pixel_new_customer_cost_of_goods',
      'spend',
      'clicks',
      'impressions'
    ]
  },
  {
    value: 'profit_inventory',
    text: 'Profit & Inventory',
    desc: 'Track costs, profit margins and inventory metrics.',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_cv',
      'gst_pixel_purchases',
      'gst_pixel_profit',
      'gst_pixel_cost_of_goods',
      'gst_pixel_new_customer_cost_of_goods',
      'gst_pixel_conversion_value_delta',
      'spend'
    ]
  },
  {
    value: 'purchases',
    text: 'Purchases',
    desc: 'View metrics about new and returning customer purchases.',
    column_list: [
      ...AD_TABLE_DEFAULT_COLUMN_LIST,
      'gst_pixel_roas',
      'gst_pixel_new_customer_roas',
      'gst_pixel_cv',
      'gst_pixel_new_customer_cv',
      'gst_pixel_purchases',
      'gst_pixel_new_customer_purchases',
      'gst_pixel_cpa',
      'gst_pixel_new_customer_cpa',
      'gst_pixel_aov',
      'gst_pixel_new_customer_aov',
      'spend',
      'bueget'
    ]
  }
]

export const AD_ORDER_RELATED_COLUMNS = [
  'gst_pixel_purchases',
  'gst_pixel_new_customer_purchases',
  'gst_pixel_new_customer_purchases_percent',
  'gst_pixel_cv',
  'gst_pixel_new_customer_cv',
  'gst_pixel_roas',
  'gst_pixel_new_customer_roas',
  'gst_pixel_cpa',
  'gst_pixel_new_customer_cpa'
]