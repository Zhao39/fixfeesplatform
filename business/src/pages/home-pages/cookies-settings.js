import { useState } from 'react';
import CmsPageWrapper from 'layout/CommonLayout/CmsPageWrapper';
import CustomPageLayout from 'layout/CommonLayout/CustomPageLayout';
import renderHTML from 'react-render-html';
import fileContent from 'data/cms/cookies-settings';

const CookiesSettings = () => {
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
export default CookiesSettings;
