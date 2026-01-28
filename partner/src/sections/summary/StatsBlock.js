// material-ui
import { Grid, Typography, Skeleton, Box, Table, TableContainer, TableHead, TableCell, TableBody, TableRow } from '@mui/material';
import RoundIconCard from 'components/cards/statistics/RoundIconCard';
import {
  AimOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { empty, get_data_value, numberFormat, priceFormat } from 'utils/misc';
import StoreBlockSkeleton from './StoreBlockSkeleton';
import SkeletonCard from 'components/cards/SkeltonCard';
import { getStatsColumnInfo } from 'utils/ad-stats-utils';
import { FIELD_TYPE } from 'config/stats_constants';

const StatsBlock = (props) => {
  const { blockData = {}, pageData = {}, setPageData, loading, setLoading, shopCurrencySymbol } = props
  const statsData = pageData.statsData ?? {}
  const storeStats = statsData.storeStats ?? {}

  const diplayMode = blockData.diplayMode ?? "display_tiles"
  const column_list = blockData.column_list
  const current_column_list = blockData.current_column_list ?? column_list

  const getColumnValue = (column_info, column_name) => {
    let value = get_data_value(statsData, column_name)
    const type = column_info.type
    if (type === FIELD_TYPE.DECIMAL) {
      if (empty(value)) {
        value = 0
      }
      value = `${numberFormat(value, 2)}`
    }
    else if (type === FIELD_TYPE.INTEGER) {
      if (empty(value)) {
        value = 0
      }
      value = `${numberFormat(value, 0)}`
    }
    else if (type === FIELD_TYPE.PERCENT) {
      if (empty(value)) {
        value = 0
      }
      value = `${numberFormat(value, 0)}%`
    }
    else if (type === FIELD_TYPE.PRICE) {
      if (empty(value)) {
        value = 0
      }
      value = `${priceFormat(value, shopCurrencySymbol)}`
    }

    return value
  }

  return (
    <div>
      <Box>
        {
          (diplayMode === "display_tiles") ? (
            <Grid container spacing={3}>
              {
                (current_column_list.map((column_name, index) => {
                  const columnInfo = getStatsColumnInfo(column_name)
                  return (
                    <Fragment key={index} >
                      {
                        columnInfo ? (
                          <Grid item xs={12} lg={4} sm={6}>
                            <SkeletonCard
                              primary={blockData.is_custom ? columnInfo.desc : columnInfo.text}
                              secondary={getColumnValue(columnInfo, column_name)}
                              iconPrimary={AimOutlined}
                              color="warning.main"
                              bgcolor="warning.lighter"
                              isLoading={loading}
                            />
                          </Grid>
                        ) : (
                          <></>
                        )
                      }
                    </Fragment>
                  )
                }))
              }
            </Grid>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 350, border: '1px solid rgba(255, 255, 255, 0.05)' }} aria-label="table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Metrics</TableCell>
                      <TableCell align="left">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      (current_column_list.map((column_name, index) => {
                        const columnInfo = getStatsColumnInfo(column_name)
                        return (
                          <Fragment key={index}>
                            {
                              columnInfo ? (
                                <TableRow>
                                  <TableCell align="left">{blockData.is_custom ? columnInfo.desc : columnInfo.text}</TableCell>
                                  <TableCell align="left">{getColumnValue(columnInfo, column_name)}</TableCell>
                                </TableRow>
                              ) : (
                                <></>
                              )
                            }
                          </Fragment>
                        )
                      }))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )
        }
      </Box>
    </div>
  )
}

export default StatsBlock;
