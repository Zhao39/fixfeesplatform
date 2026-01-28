import React from 'react'

const TableColumnResizer = (props) => {
    const { column } = props
    return (
        <>
            <div
                {...column.getResizerProps()}
                className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                onClick={(event) => event.stopPropagation()}
                onKeyPress={(event) => event.stopPropagation()} tabIndex="0" role="button"
            />
        </>
    )
}

export default TableColumnResizer;