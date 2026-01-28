import { useState } from 'react';
import CmsPageWrapper from 'layout/CommonLayout/CmsPageWrapper';
import CustomPageLayout from 'layout/CommonLayout/CustomPageLayout';
import renderHTML from 'react-render-html';
import fileContent from 'data/cms/disclaimer';

const Disclaimer = () => {
  const pageContent = fileContent
  return (
    <CustomPageLayout showLogo={false}>
      <CmsPageWrapper>
        <>
          <div className="cms-content">
            {renderHTML(pageContent)}
          </div>
        </>
      </CmsPageWrapper>
    </CustomPageLayout>
  )
}
export default Disclaimer;
