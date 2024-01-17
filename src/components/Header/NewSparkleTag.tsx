import React from 'react';
import styles from 'styles/components/Header.module.scss';

const NewTag = '/assets/images/NewTag.png';
const SparkleLeft = '/assets/images/SparkleLeft.svg';
const SparkleRight = '/assets/images/SparkleRight.svg';
const SparkleTop = '/assets/images/SparkleTop.svg';
const SparkleBottom = '/assets/images/SparkleBottom.svg';

export const NewSparkleTag: React.FC = () => {
  return (
    <>
      <picture>
        <img src={NewTag} alt='new menu' width={46} />
      </picture>
      <picture>
        <img
          className={`${styles.menuItemSparkle} ${styles.menuItemSparkleLeft}`}
          src={SparkleLeft}
          alt='menuItem sparkle left'
        />
      </picture>
      <picture>
        <img
          className={`${styles.menuItemSparkle} ${styles.menuItemSparkleRight}`}
          src={SparkleRight}
          alt='menuItem sparkle right'
        />
      </picture>
      <picture>
        <img
          className={`${styles.menuItemSparkle} ${styles.menuItemSparkleBottom}`}
          src={SparkleBottom}
          alt='menuItem sparkle bottom'
        />
      </picture>
      <picture>
        <img
          className={`${styles.menuItemSparkle} ${styles.menuItemSparkleTop}`}
          src={SparkleTop}
          alt='menuItem sparkle top'
        />
      </picture>
    </>
  );
};
