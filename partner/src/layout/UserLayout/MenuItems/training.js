// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { PlaySquareOutlined } from '@ant-design/icons';

const training = {
  id: 'group-training',
  type: 'group',
  children: [
    {
      id: 'training',
      title: "Training",
      type: 'item',
      url: '/user/training',
      icon: PlaySquareOutlined
    },
  ]
};

export default training;
