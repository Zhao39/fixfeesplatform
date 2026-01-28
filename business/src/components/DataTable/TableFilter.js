import { EyeInvisibleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { IconButton, InputAdornment, OutlinedInput } from '@mui/material'
import React from 'react'


const TableFilter = (props) => {
    const { onClickFilterCallback, defaultKeyword } = props
    const [keyword, setKeyword] = React.useState(defaultKeyword)
    const onKeywordChange = (e) => {
        const val = e.target.value
        setKeyword(val)
        onClickFilterCallback(val)
    }
    return (
        <>
            <OutlinedInput
                size="small"
                type="search"
                placeholder="search"
                value={keyword}
                onChange={onKeywordChange}
                startAdornment={
                    <InputAdornment position="start" sx={{width: '1px'}}>
                        <SearchOutlined />
                    </InputAdornment>
                }
            />
        </>
    )
}

export default TableFilter;