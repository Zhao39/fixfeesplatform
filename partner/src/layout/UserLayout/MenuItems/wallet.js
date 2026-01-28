// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { WalletOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - summary ||============================== //

const wallet = {
  id: 'group-wallet',
  type: 'group',
  children: [
    {
      id: 'wallet',
      title: "Wallet",
      type: 'item',
      url: '/user/wallet',
      icon: WalletOutlined
    },
  ]
};

export default wallet;
