// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { BgColorsOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - creativeCockpit ||============================== //

const creativeCockpit = {
  id: 'group-creative-cockpit',
  type: 'group',
  children: [
    {
      id: 'creative-cockpit',
      title: "Creative Cockpit",
      type: 'item',
      url: '/user/creative-cockpit',
      icon: BgColorsOutlined
    },
  ]
};

export default creativeCockpit;
