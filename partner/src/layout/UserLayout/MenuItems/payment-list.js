// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DollarOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - summary ||============================== //

const paymentList = {
  id: 'group-payment-list',
  type: 'group',
  children: [
    {
      id: 'payment-list',
      title: "Payment History",
      type: 'item',
      url: '/user/payment-list',
      icon: DollarOutlined
    },
  ]
};

export default paymentList;
