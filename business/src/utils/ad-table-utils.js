import { AD_TABLE_COLUMN_LIST, AD_TABLE_DEFAULT_COLUMN_LIST, AD_TABLE_PRESET_COLUMNS } from "config/ad_constants"
import { arrayUnderReset, checkNumber, copyObject, empty } from "./misc"

export const getTableColumnInfo = (key) => {
  try {
    for (let k in AD_TABLE_COLUMN_LIST) {
      if (AD_TABLE_COLUMN_LIST[k].value === key) {
        return AD_TABLE_COLUMN_LIST[k]
      }
    }
    return null
  } catch (e) {
    console.log("getTableColumnInfo e:::", e)
  }
}

export const checkTableColumnIsDefault = (key) => {
  try {
    for (let k in AD_TABLE_DEFAULT_COLUMN_LIST) {
      if (AD_TABLE_DEFAULT_COLUMN_LIST[k] === key) {
        return true
      }
    }
  } catch (e) {
    console.log("checkTableColumnIsDefault e:::", e)
  }
  return false
}

export const getCurrentColumnPresetData = (adsTableFormData) => {
  const adTablePresetColumns = [
    ...adsTableFormData.adTablePresetColumns
  ]
  const adTablePresetColumnsObj = arrayUnderReset(adTablePresetColumns, 'value')
  const currentColumnPresetData = adTablePresetColumnsObj[adsTableFormData['columnPresetName']] ?? adTablePresetColumns[0]
  return copyObject(currentColumnPresetData)
}

export const filterTableColumnInfo = (item, searchKey) => {
  try {
    if (empty(searchKey)) {
      return true
    }
    const value = item.value.toLowerCase()
    if (value.includes(searchKey.toLowerCase())) {
      return true
    }
  } catch (e) {
    console.log("filterTableColumnInfo e:::", e)
  }
  return false
}

export const showAdValue = (value, itemProperty = null, symbol= "") => {
  try {
    const check_number = checkNumber(value)
    if (check_number === 'integer') {
      //return value
    }
    else if (check_number === 'float') {
      value = Number(value).toFixed(2)
    }

    if (itemProperty) {
      if (itemProperty['unit']) {
        if(empty(symbol)) {
          if (itemProperty['unit'] === 'price') {
            symbol = "$"
          } else if(itemProperty['unit'] === 'percentage') {
            symbol = "%"
          }
        }

        if(symbol) {
          const unitPosition = itemProperty['unitPosition'] ?? 'before'
          if (unitPosition === 'before') {
            value = `${symbol} ${value}`
          } else {
            value = `${value} ${symbol}`
          }
        }
      }
    }
  } catch (e) {
    console.log("showAdValue e:::", e)
  }
  return value
}

////////////////////////// total sum ads fields (insight) //////////////////////////
export const generateAdsSumRowData = (item_list) => {
  try {
    let itme_count = item_list.length

    let totalRowItem = {}
    totalRowItem['name'] = item_list.length
    totalRowItem['name'] = `( ${totalRowItem['name']} Campaign${totalRowItem['name'] > 1 ? 's' : ''} )`

    let clicks = 0
    let spend = 0
    let impressions = 0
    let reach = 0
    let budget = 0
    let purchase = 0

    let cpc = 0
    let cpm = 0
    let cpp = 0
    let ctr = 0

    let gst_pixel_purchases = 0
    let gst_pixel_new_customer_purchases = 0
    let gst_pixel_new_customer_purchases_percent = 0
    let gst_pixel_cv = 0
    let gst_pixel_new_customer_cv = 0
    let gst_pixel_roas = 0
    let gst_pixel_new_customer_roas = 0
    let gst_pixel_cpa = 0
    let gst_pixel_new_customer_cpa = 0
    let gst_pixel_aov = 0
    let gst_pixel_new_customer_aov = 0
    let gst_pixel_conversion_rate = 0
    let gst_pixel_new_customer_conversion_rate = 0
    let gst_pixel_cost_of_goods = 0
    let gst_pixel_new_customer_cost_of_goods = 0
    let gst_pixel_profit = 0
    let gst_pixel_conversion_value_delta = 0
    let gst_pixel_sessions = 0
    let gst_pixel_unique_visitors = 0
    let gst_pixel_new_visitors = 0
    let gst_pixel_new_visitor_percent = 0
    let gst_pixel_cost_per_new_visitors = 0
    let gst_pixel_unique_add_cart = 0
    let gst_pixel_cost_per_add_cart = 0

    for (let k in item_list) {
      const item = item_list[k]
      if (item['clicks']) {
        clicks += Number(item['clicks'])
      }
      if (item['spend']) {
        spend += Number(item['spend'])
      }
      if (item['impressions']) {
        impressions += Number(item['impressions'])
      }
      if (item['reach']) {
        reach += Number(item['reach'])
      }
      if (item['budget']) {
        budget += Number(item['budget'])
      }
      if (item['purchase']) {
        purchase += Number(item['purchase'])
      }
      if (item['cpp']) {
        cpp += Number(item['cpp'])
      }

      if (item['gst_pixel_purchases']) {
        gst_pixel_purchases += Number(item['gst_pixel_purchases'])
      }
      if (item['gst_pixel_new_customer_purchases']) {
        gst_pixel_new_customer_purchases += Number(item['gst_pixel_new_customer_purchases'])
      }
      if (item['gst_pixel_new_customer_purchases_percent']) {
        gst_pixel_new_customer_purchases_percent += Number(item['gst_pixel_new_customer_purchases_percent'])
      }
      if (item['gst_pixel_cv']) {
        gst_pixel_cv += Number(item['gst_pixel_cv'])
      }
      if (item['gst_pixel_new_customer_cv']) {
        gst_pixel_new_customer_cv += Number(item['gst_pixel_new_customer_cv'])
      }
      if (item['gst_pixel_roas']) {
        gst_pixel_roas += Number(item['gst_pixel_roas'])
      }
      if (item['gst_pixel_new_customer_roas']) {
        gst_pixel_new_customer_roas += Number(item['gst_pixel_new_customer_roas'])
      }
      if (item['gst_pixel_cpa']) {
        gst_pixel_cpa += Number(item['gst_pixel_cpa'])
      }
      if (item['gst_pixel_new_customer_cpa']) {
        gst_pixel_new_customer_cpa += Number(item['gst_pixel_new_customer_cpa'])
      }
      if (item['gst_pixel_aov']) {
        gst_pixel_aov += Number(item['gst_pixel_aov'])
      }
      if (item['gst_pixel_new_customer_aov']) {
        gst_pixel_new_customer_aov += Number(item['gst_pixel_new_customer_aov'])
      }
      if (item['gst_pixel_conversion_rate']) {
        gst_pixel_conversion_rate += Number(item['gst_pixel_conversion_rate'])
      }
      if (item['gst_pixel_new_customer_conversion_rate']) {
        gst_pixel_new_customer_conversion_rate += Number(item['gst_pixel_new_customer_conversion_rate'])
      }
      if (item['gst_pixel_cost_of_goods']) {
        gst_pixel_cost_of_goods += Number(item['gst_pixel_cost_of_goods'])
      }
      if (item['gst_pixel_new_customer_cost_of_goods']) {
        gst_pixel_new_customer_cost_of_goods += Number(item['gst_pixel_new_customer_cost_of_goods'])
      }
      if (item['gst_pixel_profit']) {
        gst_pixel_profit += Number(item['gst_pixel_profit'])
      }
      if (item['gst_pixel_conversion_value_delta']) {
        gst_pixel_conversion_value_delta += Number(item['gst_pixel_conversion_value_delta'])
      }
      if (item['gst_pixel_sessions']) {
        gst_pixel_sessions += Number(item['gst_pixel_sessions'])
      }
      if (item['gst_pixel_unique_visitors']) {
        gst_pixel_unique_visitors += Number(item['gst_pixel_unique_visitors'])
      }
      if (item['gst_pixel_new_visitors']) {
        gst_pixel_new_visitors += Number(item['gst_pixel_new_visitors'])
      }
      if (item['gst_pixel_new_visitor_percent']) {
        gst_pixel_new_visitor_percent += Number(item['gst_pixel_new_visitor_percent'])
      }
      if (item['gst_pixel_cost_per_new_visitors']) {
        gst_pixel_cost_per_new_visitors += Number(item['gst_pixel_cost_per_new_visitors'])
      }
      if (item['gst_pixel_unique_add_cart']) {
        gst_pixel_unique_add_cart += Number(item['gst_pixel_unique_add_cart'])
      }
      if (item['gst_pixel_cost_per_add_cart']) {
        gst_pixel_cost_per_add_cart += Number(item['gst_pixel_cost_per_add_cart'])
      }
    }
    totalRowItem['clicks'] = clicks
    totalRowItem['spend'] = spend.toFixed(2)
    totalRowItem['impressions'] = impressions
    totalRowItem['reach'] = reach
    totalRowItem['budget'] = budget
    totalRowItem['purchase'] = purchase
    if (clicks > 0) {
      cpc = spend / clicks
    }
    totalRowItem['cpc'] = cpc.toFixed(2)
    if (impressions > 0) {
      cpm = 1000 * spend / impressions
    }
    totalRowItem['cpm'] = cpm.toFixed(2)

    if (itme_count > 0) {
      cpp = cpp / itme_count
    }
    totalRowItem['cpp'] = cpp.toFixed(2)

    if (impressions > 0) {
      ctr = 100 * clicks / impressions
    }
    totalRowItem['ctr'] = ctr.toFixed(2)

    totalRowItem['gst_pixel_purchases'] = gst_pixel_purchases
    totalRowItem['gst_pixel_new_customer_purchases'] = gst_pixel_new_customer_purchases

    if (itme_count > 0) {
      gst_pixel_new_customer_purchases_percent = gst_pixel_new_customer_purchases_percent / itme_count
    }
    totalRowItem['gst_pixel_new_customer_purchases_percent'] = gst_pixel_new_customer_purchases_percent.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_cv = gst_pixel_cv / itme_count
    }
    totalRowItem['gst_pixel_cv'] = gst_pixel_cv.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_new_customer_cv = gst_pixel_new_customer_cv / itme_count
    }
    totalRowItem['gst_pixel_new_customer_cv'] = gst_pixel_new_customer_cv.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_roas = gst_pixel_roas / itme_count
    }
    totalRowItem['gst_pixel_roas'] = gst_pixel_roas.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_new_customer_roas = gst_pixel_new_customer_roas / itme_count
    }
    totalRowItem['gst_pixel_new_customer_roas'] = gst_pixel_new_customer_roas.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_cpa = gst_pixel_cpa / itme_count
    }
    totalRowItem['gst_pixel_cpa'] = gst_pixel_cpa.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_new_customer_cpa = gst_pixel_new_customer_cpa / itme_count
    }
    totalRowItem['gst_pixel_new_customer_cpa'] = gst_pixel_new_customer_cpa.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_aov = gst_pixel_aov / itme_count
    }
    totalRowItem['gst_pixel_aov'] = gst_pixel_aov.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_new_customer_aov = gst_pixel_new_customer_aov / itme_count
    }
    totalRowItem['gst_pixel_new_customer_aov'] = gst_pixel_new_customer_aov.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_conversion_rate = gst_pixel_conversion_rate / itme_count
    }
    totalRowItem['gst_pixel_conversion_rate'] = gst_pixel_conversion_rate.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_new_customer_conversion_rate = gst_pixel_new_customer_conversion_rate / itme_count
    }
    totalRowItem['gst_pixel_new_customer_conversion_rate'] = gst_pixel_new_customer_conversion_rate.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_cost_of_goods = gst_pixel_cost_of_goods / itme_count
    }
    totalRowItem['gst_pixel_cost_of_goods'] = gst_pixel_cost_of_goods.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_new_customer_cost_of_goods = gst_pixel_new_customer_cost_of_goods / itme_count
    }
    totalRowItem['gst_pixel_new_customer_cost_of_goods'] = gst_pixel_new_customer_cost_of_goods.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_profit = gst_pixel_profit / itme_count
    }
    totalRowItem['gst_pixel_profit'] = gst_pixel_profit.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_conversion_value_delta = gst_pixel_conversion_value_delta / itme_count
    }
    totalRowItem['gst_pixel_conversion_value_delta'] = gst_pixel_conversion_value_delta.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_sessions = gst_pixel_sessions / itme_count
    }
    totalRowItem['gst_pixel_sessions'] = gst_pixel_sessions.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_unique_visitors = gst_pixel_unique_visitors / itme_count
    }
    totalRowItem['gst_pixel_unique_visitors'] = gst_pixel_unique_visitors.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_new_visitors = gst_pixel_new_visitors / itme_count
    }
    totalRowItem['gst_pixel_new_visitors'] = gst_pixel_new_visitors.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_new_visitor_percent = gst_pixel_new_visitor_percent / itme_count
    }
    totalRowItem['gst_pixel_new_visitor_percent'] = gst_pixel_new_visitor_percent.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_cost_per_new_visitors = gst_pixel_cost_per_new_visitors / itme_count
    }
    totalRowItem['gst_pixel_cost_per_new_visitors'] = gst_pixel_cost_per_new_visitors.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_unique_add_cart = gst_pixel_unique_add_cart / itme_count
    }
    totalRowItem['gst_pixel_unique_add_cart'] = gst_pixel_unique_add_cart.toFixed(2)
    if (itme_count > 0) {
      gst_pixel_cost_per_add_cart = gst_pixel_cost_per_add_cart / itme_count
    }
    totalRowItem['gst_pixel_cost_per_add_cart'] = gst_pixel_cost_per_add_cart.toFixed(2)

    return totalRowItem

  } catch (e) {
    console.log("generateAdsSumRowData e:::", e)
  }
  return false
}


