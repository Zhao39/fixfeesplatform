
// material-ui
import { useTheme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import { Box, Stack, TextField, useMediaQuery } from '@mui/material';

// third-party

// project import

// assets
import { copyObject, get_data_value } from 'utils/misc';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { setSettingData } from 'store/reducers/settingPersist';
import ColumnCustomize from './ColumnCustomize';
import { SearchOutlined } from '@ant-design/icons';
import { SourceSelector } from './SourceSelector';
import { AD_SOURCE_LIST, AD_TABLE_PRESET_COLUMNS } from 'config/ad_constants';

const useStyles = makeStyles((theme) =>
  createStyles({
    formItemMd: {
      marginLeft: '8px',
      marginBottom: '8px',

    },
    formItemXs: {
      marginRight: '8px',
      marginBottom: '8px',
    },
  }),
);
export const getDefaultAdTableFormData = () => {
  const defaultFormData = {
    source: AD_SOURCE_LIST[0].value,
    columnPresetName: AD_TABLE_PRESET_COLUMNS[0].value,
    adTablePresetColumns: AD_TABLE_PRESET_COLUMNS
  }
  return defaultFormData
}

export const AdsDataTableForm = (props) => {
  const { searchKeyword, setSearchKeyword } = props
  const history = useNavigate()
  const location = useLocation();
  const dispatch = useDispatch()
  const classes = useStyles();

  const query = new URLSearchParams(location.search);
  const source = query.get('source') ?? "facebook"
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const settingPersistDataStore = useSelector((x) => x.settingPersist);
  const defaultTableFormData = getDefaultAdTableFormData()
  const adsTableFormData = get_data_value(settingPersistDataStore, 'adsTableFormData', defaultTableFormData)

  const saveTableFormData = (ads_table_form_data) => {
    const newData = copyObject(ads_table_form_data)
    console.log("saveTableFormData newData:::::::: ", newData)
    const settingData = {
      ...settingPersistDataStore,
      adsTableFormData: {
        ...newData
      }
    }
    dispatch(setSettingData(settingData))
  }

  const getFormItemClass = () => {
    return matchesXs ? classes.formItemXs : classes.formItemMd
  }

  return (
    <div style={{ zIndex: 2 }}>
      <Stack direction={`row`} flexWrap="wrap" alignItems={`center`}>
        <Box className={getFormItemClass()}>
          <TextField
            fullWidth
            name="keyword"
            value={searchKeyword}
            placeholder="Search campaign..."
            inputProps={{ type: 'search' }}
            InputProps={{
              startAdornment: <SearchOutlined />
            }}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Box>
        <Box className={getFormItemClass()}>
          <SourceSelector
            adsTableFormData={adsTableFormData}
            saveTableFormData={(d) => saveTableFormData(d)}
          />
        </Box>
        <Box className={getFormItemClass()}>
          <ColumnCustomize
            adsTableFormData={adsTableFormData}
            saveTableFormData={(d) => saveTableFormData(d)}
          />
        </Box>

      </Stack>
    </div>
  )
}
