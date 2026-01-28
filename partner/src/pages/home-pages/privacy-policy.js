import { useState } from 'react';
import CmsPageWrapper from 'layout/CommonLayout/CmsPageWrapper';
import CustomPageLayout from 'layout/CommonLayout/CustomPageLayout';
import renderHTML from 'react-render-html';
import fileContent from 'data/cms/privacy-policy';

const PrivacyPolicy = () => {
  const pageContent = fileContent
  return (
    <CustomPageLayout showLogo={true}>
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
export default PrivacyPolicy;
