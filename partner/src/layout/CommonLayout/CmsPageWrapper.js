import { useState } from 'react';

const CmsPageWrapper = (props) => {
  return (
    <>
      <div className='cms-page-wrapper'>
        {props.children}
      </div>
    </>
  )
}

export default CmsPageWrapper;
