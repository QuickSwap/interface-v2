import React from 'react';

import NewTag from 'assets/images/NewTag.png';
import SparkleLeft from 'assets/images/SparkleLeft.svg';
import SparkleRight from 'assets/images/SparkleRight.svg';
import SparkleTop from 'assets/images/SparkleTop.svg';
import SparkleBottom from 'assets/images/SparkleBottom.svg';
import 'components/styles/Header.scss';

export const NewSparkleTag: React.FC = () => {
  return (
    <>
      <img src={NewTag} alt='new menu' width={46} />
      <img
        className='menuItemSparkle menuItemSparkleLeft'
        src={SparkleLeft}
        alt='menuItem sparkle left'
      />
      <img
        className='menuItemSparkle menuItemSparkleRight'
        src={SparkleRight}
        alt='menuItem sparkle right'
      />
      <img
        className='menuItemSparkle menuItemSparkleBottom'
        src={SparkleBottom}
        alt='menuItem sparkle bottom'
      />
      <img
        className='menuItemSparkle menuItemSparkleTop'
        src={SparkleTop}
        alt='menuItem sparkle top'
      />
    </>
  );
};
