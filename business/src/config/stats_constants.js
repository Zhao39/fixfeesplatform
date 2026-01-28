export const FIELD_TYPE = {
  PRICE: 'price',
  DECIMAL: 'decimal',
  INTEGER: 'integer',
  PERCENT: 'percent',
}
export const STATS_COLUMN_LIST = [
  //////////////////////////////////////////////////////////////
  {
    value: 'storeStats_order_revenue',
    text: 'Order Revenue',
    desc: 'Order Revenue',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'storeStats_orders',
    text: 'Orders',
    desc: 'Orders',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'storeStats_returns',
    text: 'Returns',
    desc: 'Returns',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'storeStats_taxes',
    text: 'Taxes',
    desc: 'Taxes',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'storeStats_aov',
    text: 'AOV',
    desc: 'AOV',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'storeStats_new_customers_percent',
    text: 'New Customers',
    desc: 'New Customers',
    type: FIELD_TYPE.PERCENT
  },
  {
    value: 'storeStats_returning_customers_percent',
    text: 'Returning Customers',
    desc: 'Returning Customers',
    type: FIELD_TYPE.PERCENT
  },
  {
    value: 'storeStats_new_customer_orders',
    text: 'New Customer Orders',
    desc: 'New Customer Orders',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'storeStats_items_sold',
    text: 'Units Sold',
    desc: 'Units Sold',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'storeStats_new_customer_revenue',
    text: 'New Customer Revenue',
    desc: 'New Customer Revenue',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'storeStats_returning_customer_revenue',
    text: 'Returning Customer Revenue',
    desc: 'Returning Customer Revenue',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'storeStats_sales',
    text: 'Total Sales',
    desc: 'Total Sales',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'storeStats_unique_customers',
    text: 'Unique Customers',
    desc: 'Unique Customers',
    type: FIELD_TYPE.INTEGER
  },
  ///////////////////////////////////////////////////////////////////
  {
    value: 'custom_totalNetProfit',
    text: 'Net Profit',
    desc: 'Net Profit',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'custom_totalRoas',
    text: 'ROAS',
    desc: 'ROAS',
    type: FIELD_TYPE.DECIMAL
  },
  {
    value: 'custom_totalNetMargin',
    text: 'Net Margin',
    desc: 'Net Margin',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'custom_totalReturnsPercent',
    text: 'Returns',
    desc: 'Returns',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'custom_totalAdSpend',
    text: 'Ads',
    desc: 'Ads',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'custom_totalBlendedCpa',
    text: 'Blended CPA',
    desc: 'Blended CPA',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'custom_totalNcpa',
    text: 'NCPA',
    desc: 'NCPA',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'custom_totalCashTurnover',
    text: 'Cash Turnover',
    desc: 'Cash Turnover',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'custom_totalPoas',
    text: 'POAS',
    desc: 'POAS',
    type: FIELD_TYPE.DECIMAL
  },
  ////////////////////////////////////////////////////////////////
  {
    value: 'facebook_totalAdSpend',
    text: 'Facebook Ads',
    desc: 'Facebook Ads',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'facebook_totalRoas',
    text: 'ROAS',
    desc: 'Facebook ROAS',
    type: FIELD_TYPE.DECIMAL
  },
  {
    value: 'facebook_totalCpc',
    text: 'CPC',
    desc: 'Facebook CPC',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'facebook_totalCpm',
    text: 'CPM',
    desc: 'Facebook CPM',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'facebook_totalCpa',
    text: 'CPA',
    desc: 'Facebook CPA',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'facebook_totalCv',
    text: 'Conversion Value',
    desc: 'Facebook CV',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'facebook_totalClicks',
    text: 'Clicks',
    desc: 'Facebook Clicks',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'facebook_totalImpressions',
    text: 'Impressions',
    desc: 'Facebook Impressions',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'facebook_totalPurchases',
    text: 'Purchases',
    desc: 'Facebook Purchases',
    type: FIELD_TYPE.INTEGER
  },
  /////////////////////////////////////////////////////////////////////////
  {
    value: 'tiktok_totalAdSpend',
    text: 'Tiktok Ads',
    desc: 'Tiktok Ads',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'tiktok_totalRoas',
    text: 'ROAS',
    desc: 'Tiktok ROAS',
    type: FIELD_TYPE.DECIMAL
  },
  {
    value: 'tiktok_totalCpc',
    text: 'CPC',
    desc: 'Tiktok CPC',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'tiktok_totalCpm',
    text: 'CPM',
    desc: 'Tiktok CPM',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'tiktok_totalCpa',
    text: 'CPA',
    desc: 'Tiktok CPA',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'tiktok_totalCv',
    text: 'Conversion Value',
    desc: 'Tiktok CV',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'tiktok_totalClicks',
    text: 'Clicks',
    desc: 'Tiktok Clicks',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'tiktok_totalImpressions',
    text: 'Impressions',
    desc: 'Tiktok Impressions',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'tiktok_totalPurchases',
    text: 'Purchases',
    desc: 'Tiktok Purchases',
    type: FIELD_TYPE.INTEGER
  },
  ////////////////////////////////////////////
  {
    value: 'gst_pixel_purchases',
    text: 'Purchases',
    desc: 'Pixel Purchases',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'gst_pixel_new_customer_purchases',
    text: 'NCP',
    desc: 'Pixel New Customer Purchases',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'gst_pixel_new_customer_purchases_percent',
    text: 'NCPP',
    desc: 'Pixel New Customer Purchases Percent',
    type: FIELD_TYPE.PERCENT
  },
  {
    value: 'gst_pixel_cv',
    text: 'CV',
    desc: 'Pixel CV',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_new_customer_cv',
    text: 'NC CV',
    desc: 'Pixel New Customer CV',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_roas',
    text: 'ROAS',
    desc: 'Pixel ROAS',
    type: FIELD_TYPE.DECIMAL
  },
  {
    value: 'gst_pixel_new_customer_roas',
    text: 'NC ROAS',
    desc: 'Pixel New Customer ROAS',
    type: FIELD_TYPE.DECIMAL
  },
  {
    value: 'gst_pixel_cpa',
    text: 'CPA',
    desc: 'Pixel CPA',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_new_customer_cpa',
    text: 'NC CPA',
    desc: 'Pixel New Customer CPA',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_aov',
    text: 'AOV',
    desc: 'Pixel AOV',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_new_customer_aov',
    text: 'NC AOV',
    desc: 'Pixel New Customer AOV',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_conversion_rate',
    text: 'CR',
    desc: 'Pixel Conversion Rate',
    type: FIELD_TYPE.DECIMAL
  },
  {
    value: 'gst_pixel_new_customer_conversion_rate',
    text: 'NC CR',
    desc: 'Pixel New Customer Conversion Rate',
    type: FIELD_TYPE.DECIMAL
  },
  {
    value: 'gst_pixel_cost_of_goods',
    text: 'COGS',
    desc: 'Pixel Cost of Goods',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_new_customer_cost_of_goods',
    text: 'NC COGS',
    desc: 'Pixel New Customer Cost of Goods',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_profit',
    text: 'Profit',
    desc: 'Pixel New Profit',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_conversion_value_delta',
    text: 'CVD',
    desc: 'Pixel Conversion Value Delta',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'gst_pixel_sessions',
    text: 'Sessions',
    desc: 'Pixel Sessions',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'gst_pixel_unique_visitors',
    text: 'Unique Visitors',
    desc: 'Pixel Unique Visitors',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'gst_pixel_new_visitors',
    text: 'NV',
    desc: 'Pixel New Visitors',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'gst_pixel_new_visitor_percent',
    text: 'NVP',
    desc: 'Pixel New Visitors Percent',
    type: FIELD_TYPE.PERCENT
  },
  {
    value: 'gst_pixel_cost_per_new_visitors',
    text: 'Cost NV',
    desc: 'Pixel Cost Per New Visitors',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'gst_pixel_unique_add_cart',
    text: 'ATC',
    desc: 'Pixel Unique Add To Carts',
    type: FIELD_TYPE.INTEGER
  },
  {
    value: 'gst_pixel_cost_per_add_cart',
    text: 'Cost ATC',
    desc: 'Pixel Cost Per Add To Carts',
    type: FIELD_TYPE.INTEGER
  },
  ///////////////////////////////////////////////////////
  {
    value: 'ltv_ltv',
    text: 'LTV',
    desc: 'LTV',
    type: FIELD_TYPE.PRICE
  },
  {
    value: 'ltv_frequency',
    text: 'Frequency',
    desc: 'LTV Frequency',
    type: FIELD_TYPE.DECIMAL
  },
  {
    value: 'ltv_cpa',
    text: 'LTV/CPA',
    desc: 'LTV/CPA',
    type: FIELD_TYPE.DECIMAL
  },
]

export const STATS_BLOCK_LIST = [
  {
    value: 'store_stats',
    text: 'Store',
    column_list: ['storeStats_order_revenue', 'storeStats_orders', 'storeStats_returns', 'storeStats_taxes', 'storeStats_aov', 'storeStats_new_customers_percent', 'storeStats_returning_customers_percent', 'storeStats_new_customer_orders', 'storeStats_items_sold', 'storeStats_new_customer_revenue', 'storeStats_returning_customer_revenue', 'storeStats_sales']
  },
  {
    value: 'ltv',
    text: 'LTV',
    column_list: ['ltv_ltv', 'storeStats_unique_customers', 'ltv_frequency', 'ltv_cpa']
  },
  {
    value: 'net_stats',
    text: 'Custom Metrics',
    column_list: ['custom_totalNetProfit', 'custom_totalRoas', 'custom_totalNetMargin', 'custom_totalReturnsPercent', 'custom_totalAdSpend', 'custom_totalBlendedCpa', 'custom_totalNcpa', 'custom_totalCashTurnover', 'custom_totalPoas']
  },
  {
    value: 'facebook_ads',
    text: 'Facebook Ads',
    column_list: ['facebook_totalAdSpend', 'facebook_totalRoas', 'facebook_totalCpc', 'facebook_totalCpm', 'facebook_totalCpa', 'facebook_totalCv', 'facebook_totalClicks', 'facebook_totalImpressions', 'facebook_totalPurchases']
  },
  {
    value: 'tiktok_ads',
    text: 'Tiktok Ads',
    column_list: ['tiktok_totalAdSpend', 'tiktok_totalRoas', 'tiktok_totalCpc', 'tiktok_totalCpm', 'tiktok_totalCpa', 'tiktok_totalCv', 'tiktok_totalClicks', 'tiktok_totalImpressions', 'tiktok_totalPurchases']
  }
]
