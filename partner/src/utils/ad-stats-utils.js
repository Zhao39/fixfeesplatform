import { STATS_BLOCK_LIST, STATS_COLUMN_LIST } from "config/stats_constants"
import { arrayUnderReset, copyObject, empty } from "./misc"

export const getSummaryBlockInfo = (key) => {
  try {
    for (let k in STATS_BLOCK_LIST) {
      if (STATS_BLOCK_LIST[k].value === key) {
        return STATS_BLOCK_LIST[k]
      }
    }
    return null
  } catch (e) {
    console.log("getSummaryBlockInfo e:::", e)
  }
}

export const getStatsColumnInfo = (key) => {
  try {
    for (let k in STATS_COLUMN_LIST) {
      if (STATS_COLUMN_LIST[k].value === key) {
        return STATS_COLUMN_LIST[k]
      }
    }
    return null
  } catch (e) {
    console.log("getStatsColumnInfo e:::", e)
  }
}

export const checkSummaryBlockIsActive = (blockList, key) => {
  try {
    for (let k in blockList) {
      if (blockList[k].value === key) {
        return true
      }
    }
    return false
  } catch (e) {
    console.log("checkSummaryBlockIsActive e:::", e)
    return false
  }
}

export const checkSummaryBlockColumnIsActive = (column_list, key) => {
  try {
    for (let k in column_list) {
      if (column_list[k] === key) {
        return true
      }
    }
    return false
  } catch (e) {
    console.log("checkSummaryBlockColumnIsActive e:::", e)
    return false
  }
}

export const isSummaryColumnSearchMatched = (item, searchKey) => {
  try {
    if(empty(item)) {
      return false
    }
    if(empty(searchKey)) {
      return true
    }
    searchKey = searchKey.toLowerCase()
    const desc = item.desc.toLowerCase()
    if(desc.includes(searchKey)) {
      return true
    }
  } catch (e) {
    console.log("isSummaryColumnSearchMatched e:::", e)
  }
  return false
}