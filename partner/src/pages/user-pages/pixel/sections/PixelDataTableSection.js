import { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@mui/material';

// third-party

// project import
import { useDispatch, useSelector } from 'react-redux';
import { get_data_value } from 'utils/misc';
import PixelDataTableBlock from './PixelDataTableBlock';

const PixelDataTableSection = () => {
  const dispatch = useDispatch()

  const userDataStore = useSelector((x) => x.auth);
  const userId = userDataStore?.user?.id
  //console_log("userId::::", userId)
  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const currentStoreId = get_data_value(settingPersistDataStore, 'currentStoreId')
  const currentStoreUpdateTimestamp = get_data_value(settingPersistDataStore, 'currentStoreUpdateTimestamp', 0)
  const currentDateRange = get_data_value(settingPersistDataStore, 'currentDateRange')

  const [loading, setLoading] = useState(true)
  const defaultItemList = []
  const [itemList, setItemList] = useState(defaultItemList)
  const [pageData, setPageData] = useState({})
  const loadPageData = async () => {
     
  }

  const [sumRow, setSumRow] = useState(null)
  const initItemList = (item_list) => {
    let totalRowItem = {
      "name": 0,
      "clicks": 0,
      "cpc": 0,
      "cpm": 0,
      "cpp": 0,
      "ctr": 0,
      "impressions": 0,
      "reach": 0,
      "spend": 0,
    }
    const keys = Object.keys(totalRowItem)
    if (item_list) {
      for (let k in item_list) {
        const item = item_list[k]
        if (item) {
          for (let k in item) {
            const value = item[k]
            if (value) {
              if (k === 'name') {
                totalRowItem['name'] = totalRowItem['name'] + 1
              }
              else {
                if (keys.includes(k)) {
                  totalRowItem[k] = totalRowItem[k] + Number(item[k])
                }
              }
            }
          }
        }
      }
      const trimKeys0 = [
        "name",
        "clicks",
        "impressions",
        "reach",
      ]
      const trimKeys2 = [
        "spend",     
        "cpc",
        "cpm",
        "cpp",
        "ctr",
      ]
      for (let key in totalRowItem) {
        if (trimKeys0.includes(key)) {
          totalRowItem[key] = totalRowItem[key].toFixed(0)
        }
        else if (trimKeys2.includes(key)) {
          totalRowItem[key] = totalRowItem[key].toFixed(2)
        }
      }
      totalRowItem['name'] = `( ${totalRowItem['name']} Source${totalRowItem['name'] > 1 ? 's' : ''} )`
      setSumRow(totalRowItem)
    }
    setItemList(item_list)
    return item_list
  }

  useEffect(() => {
    loadPageData()
  }, [currentStoreId, currentStoreUpdateTimestamp, currentDateRange])


  return (
    <Grid container item xs={12} spacing={3}>
      <Grid item xs={12}>
        <PixelDataTableBlock data={itemList} sumRow={sumRow} loading={loading} />
      </Grid>
    </Grid>
  )
}

export default PixelDataTableSection;
