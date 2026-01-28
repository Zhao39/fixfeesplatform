// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { ShopOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - store ||============================== //

const store = {
  id: 'group-store',
  type: 'group',
  children: [
    {
      id: 'store',
      title: "Store",
      type: 'collapse',
      icon: ShopOutlined,
      children: [
        {
          id: 'customers',
          title: "Customers",
          type: 'item',
          url: '/user/store/customers',
          breadcrumbs: false
        },
        {
          id: 'orders',
          title: "Orders",
          type: 'item',
          url: '/user/store/orders',
          breadcrumbs: false
        },
        {
          id: 'cost-of-goods',
          title: "Cost of Goods",
          type: 'item',
          url: '/user/store/cost-of-goods',
          breadcrumbs: false
        },
        {
          id: 'shipping',
          title: "Shipping",
          type: 'item',
          url: '/user/store/shipping',
          breadcrumbs: false
        },
        {
          id: 'gateway-costs',
          title: "Gateway Costs",
          type: 'item',
          url: '/user/store/gateway-costs',
          breadcrumbs: false
        },
        {
          id: 'custom-expenses',
          title: "Custom Expenses",
          type: 'item',
          url: '/user/store/custom-expenses',
          breadcrumbs: false
        }        
      ]
    }
  ]
};

export default store;
