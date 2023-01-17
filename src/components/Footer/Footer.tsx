import React from 'react';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';
import 'components/styles/Footer.scss';

const Footer: React.FC = () => {
  const copyrightYear = new Date().getFullYear();

  return (
    <div className='footer'>
      <QuickIcon />
      <p>© {copyrightYear} QuickSwap.</p>
    </div>
  );
};

export default Footer;
