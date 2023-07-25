import React from 'react';
import { WalletOptionProps } from './WalletOptionProps';
import IconifyOption from './IconifyOption';
import BarOptionContent from './BarOptionContent';
import styles from 'styles/components/WalletModal.module.scss';

const WalletOption: React.FC<WalletOptionProps> = (
  props: WalletOptionProps,
) => {
  const { iconify, link, installLink } = props;

  if (link) {
    return (
      <a
        href={link}
        target='_blank'
        rel='noopener noreferrer'
        className={styles.optionLink}
      >
        {iconify ? (
          <IconifyOption {...props} />
        ) : (
          <BarOptionContent {...props} />
        )}
      </a>
    );
  }

  if (installLink !== null) {
    return (
      <a
        href={installLink}
        target='_blank'
        rel='noopener noreferrer'
        className={styles.installLink}
      >
        {iconify ? (
          <IconifyOption {...props} />
        ) : (
          <BarOptionContent {...props} />
        )}
      </a>
    );
  }

  return null;
};

export default WalletOption;
