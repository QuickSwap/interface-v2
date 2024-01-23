import React from 'react';
import styles from 'styles/components/Header.module.scss';
import SparkleLeft from 'svgs/SparkleLeft.svg';
import SparkleRight from 'svgs/SparkleRight.svg';
import SparkleTop from 'svgs/SparkleTop.svg';
import SparkleBottom from 'svgs/SparkleBottom.svg';
import Image from 'next/image';

export const NewSparkleTag: React.FC = () => {
  return (
    <>
      <Image
        src='/assets/images/NewTag.png'
        alt='new menu'
        width={46}
        height={30}
      />
      <SparkleLeft
        className={`${styles.menuItemSparkle} ${styles.menuItemSparkleLeft}`}
      />
      <SparkleRight
        className={`${styles.menuItemSparkle} ${styles.menuItemSparkleRight}`}
      />
      <SparkleBottom
        className={`${styles.menuItemSparkle} ${styles.menuItemSparkleBottom}`}
      />
      <SparkleTop
        className={`${styles.menuItemSparkle} ${styles.menuItemSparkleTop}`}
      />
    </>
  );
};
