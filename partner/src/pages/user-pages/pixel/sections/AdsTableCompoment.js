import PropTypes from 'prop-types';
// material-ui
import { Box, Link, Tooltip, Typography } from '@mui/material';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { showAdValue } from 'utils/ad-table-utils';
import { empty, strtoupper, ucfirst } from 'utils/misc';

const getPixelIcon = (field_name, source) => {
  let icon = "es-icon.png"
  if (field_name.includes('gst_pixel_')) {
    icon = "es-icon.png"
  } else {
    if (source === 'facebook') {
      icon = "fb-icon.png"
    }
    else if (source === 'tiktok') {
      icon = "tiktok-icon.png"
    }
  }
  return icon
}

export const THCompoment = (field_name, label, desc = "", source = '') => {
  const tooltipTitle =
    <div className="tableColumnDescTooltipContainer">
      <Typography variant='body1' className="tableColumnDescTooltipTitle">{ !empty(source) ? `${strtoupper(label)} on ${ucfirst(source)}` : `${strtoupper(label)} on ES Pixel`}</Typography>
      {
        (!empty(desc)) ? (
          <>
            <Typography variant='body2' className="tableColumnDescTooltipText">{desc}</Typography>
          </>
        ) : (
          <></>
        )
      }
    </div>
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
      <div>
        <Tooltip title={tooltipTitle} placement="bottom">
          <img
            src={`/assets/global/images/${getPixelIcon(field_name, source)}`}
            alt="icon"
            style={{ width: '12px', height: 'auto', marginRight: '6px' }}
          />
        </Tooltip>
      </div>
      <div>{label}</div>
    </div>
  )
}

const AdsCellExpander = ({ row }) => {
  const collapseIcon = row.isExpanded ? <DownOutlined /> : <RightOutlined />;
  return (
    <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }} {...row.getToggleRowExpandedProps()}>
      {collapseIcon}
    </Box>
  );
};
AdsCellExpander.propTypes = {
  row: PropTypes.object
};
export const CellExpander = AdsCellExpander;

export const TDViewOrderCompoment = (props, showAdOrderListModal, item) => {
  const { value, row } = props
  if (value && Number(value) !== 0) {
    const item_id = row.original.id // row.original.item_type === 'campaign' ? row.original.fb_pixel_campaign_id : row.original.fb_pixel_adset_id
    const item_type = row.original.item_type === 'campaign' ? 'campaign_id' : 'adset_id'
    return <Link
      variant="h6"
      color="primary"
      title={`View Orders`}
      sx={{ display: 'block', cursor: 'pointer' }}
      onClick={() => { showAdOrderListModal(row) }}
    >
      {showAdValue(value, item)}
    </Link>
  } else {
    return <></>
  }
}