import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LendAlertBox: React.FC = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible ? (
        <div className='lendAlertWrapper'>
          <div className='lendAlertBox'>
            <svg width='24px' height='24px' viewBox='0 0 24 24'>
              <path
                d='M12 5.99 19.53 19H4.47L12 5.99M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z'
                fill='currentColor'
              ></path>
            </svg>
          </div>
          <p>{t('lendAlertDesc')}</p>
          <div
            className='lendAlertClose'
            onClick={() => {
              setVisible(false);
            }}
          >
            &times;
          </div>
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default LendAlertBox;
