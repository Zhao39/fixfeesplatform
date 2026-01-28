// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
  SettingOutlined
} from '@ant-design/icons';


const settings = {
  id: 'group-settings',
  title: "",
  type: 'group',
  children: [    
    {
      id: 'settings',
      title: "Settings",
      type: 'collapse',
      icon: SettingOutlined,
      children: [
        {
          id: 'settings-account-info',
          title: "Account Info",
          type: 'item',
          url: '/user/settings/account-info/kyc-verification'
        },
        {
          id: 'settings-account-settings',
          title: "Account Settings",
          type: 'item',
          url: '/user/settings/account-settings/profile',
        }
      ]
    }
  ]
}

export default settings;
