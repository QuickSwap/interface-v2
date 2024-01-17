import React from 'react';
import { Box } from '@mui/material';
import { useActivePopups } from 'state/application/hooks';
import { useURLWarningVisible } from 'state/user/hooks';
import PopupItem from './PopupItem';
import styles from 'styles/components/Popups.module.scss';

const Popups: React.FC = () => {
  // get all popups
  const activePopups = useActivePopups();
  const urlWarningActive = useURLWarningVisible();

  return (
    <>
      <Box
        className={styles.fixedPopupColumn}
        top={urlWarningActive ? '108px' : '88px'}
      >
        {activePopups.map((item) => (
          <PopupItem
            key={item.key}
            content={item.content}
            popKey={item.key}
            removeAfterMs={item.removeAfterMs}
          />
        ))}
      </Box>
      <Box
        className={styles.mobilePopupWrapper}
        height={activePopups?.length > 0 ? 'fit-content' : 0}
        margin={activePopups?.length > 0 ? '0 auto 20px' : 0}
      >
        <Box className={styles.mobilePopupInner}>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item) => (
              <PopupItem
                key={item.key}
                content={item.content}
                popKey={item.key}
                removeAfterMs={item.removeAfterMs}
              />
            ))}
        </Box>
      </Box>
    </>
  );
};

export default Popups;
