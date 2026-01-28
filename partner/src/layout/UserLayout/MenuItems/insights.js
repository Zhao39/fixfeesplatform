// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { AlignCenterOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - insights ||============================== //

const insights = {
  id: 'group-insights',
  type: 'group',
  children: [
    {
      id: 'insights',
      title: "Insights",
      type: 'collapse',
      icon: AlignCenterOutlined,
      children: [
        {
          id: 'scdp',
          title: "SCDP",
          type: 'item',
          url: '/user/insights/scdp',
          breadcrumbs: false
        },
        {
          id: 'cohorts',
          title: "Cohorts",
          type: 'item',
          url: '/user/insights/cohorts',
          breadcrumbs: false
        },
        {
          id: 'product-analytics',
          title: "Product Analytics",
          type: 'item',
          url: '/user/insights/product-analytics',
          breadcrumbs: false
        },
        {
          id: 'ltv',
          title: "LTV 60/90 Days",
          type: 'item',
          url: '/user/insights/ltv',
          breadcrumbs: false
        },
        {
          id: 'sales-cycle',
          title: "Sales Cycle",
          type: 'item',
          url: '/user/insights/sales-cycle',
          breadcrumbs: false
        },
        {
          id: 'product-journey',
          title: "Product Journey",
          type: 'item',
          url: '/user/insights/product-journey',
          breadcrumbs: false
        },
        {
          id: 'bundling',
          title: "Bundling",
          type: 'item',
          url: '/user/insights/bundling',
          breadcrumbs: false
        },
        {
          id: 'aov',
          title: "AOV",
          type: 'item',
          url: '/user/insights/aov',
          breadcrumbs: false
        },
        {
          id: 'survey',
          title: "Post-Purchase Survey",
          type: 'item',
          url: '/user/insights/survey',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default insights;
