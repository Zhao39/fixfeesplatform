// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DiffOutlined } from '@ant-design/icons';

// ==============================|| MENU ITEMS - optimizations ||============================== //

const optimizations = {
  id: 'group-optimizations',
  type: 'group',
  children: [
    {
      id: 'optimizations',
      title: "Optimizations",
      type: 'item',
      url: '/user/optimizations',
      icon: DiffOutlined,
      target: false,
      chip: {
        label: '30%',
        color: 'primary',
        size: 'small',
        variant: 'combined'
      }
    }
  ]
};

export default optimizations;
