
// material-ui
import { MenuItem, Select, Tooltip } from '@mui/material';

// third-party

// project import

// assets
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { AD_SOURCE_LIST } from 'config/ad_constants';
 
export const SourceSelector = (props) => {
  const {adsTableFormData, saveTableFormData} = props
  const history = useNavigate()
  const location = useLocation();
  const dispatch = useDispatch()

  const handleChangeTableSource = (e) => {
    const fieldName = e.target.name
    const fieldValue = e.target.value
    const ads_table_form_data = { ...adsTableFormData }
    ads_table_form_data[fieldName] = fieldValue
    saveTableFormData(ads_table_form_data)

    const url = `/user/pixel/ads?source=${fieldValue}`
    history(url)
  }

  return (
    <Tooltip placement="top" title="Select AD Source" >
      <Select
        name="tableSource"
        value={adsTableFormData['source']}
        onChange={handleChangeTableSource}
        placeholder=""
        inputProps={{}}
      >
        {
          AD_SOURCE_LIST.map((item, index) => {
            return (
              <MenuItem key={index} value={item['value']}>{item['text']}</MenuItem>
            )
          })
        }
      </Select>
    </Tooltip>
  )
}
