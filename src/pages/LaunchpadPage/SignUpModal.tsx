// import { XMarkIcon } from '@heroicons/react/20/solid';
import React, { useState, useEffect } from 'react';
import { isValidEmail } from 'pages/LaunchpadPage/Util';
import { X, AlertCircle } from 'react-feather';
import { Button, Box, Typography } from '@material-ui/core';
import { TelegramIcon } from './SocialIcon';
import ConfirmEmailImg from 'assets/images/launchpad/confirm-email.png';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';

const SignUpModal: React.FC<{
  openModal?: boolean;
  setOpenModal?: any;
}> = ({ openModal, setOpenModal }) => {
  const [email, setEmail] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const { mutate, isLoading, data } = useSubscribeNewsletter();

  const handleModal = (isClose = false) => {
    if (!isClose) {
      setConfirm(!confirm);
    }
    setOpenModal(!openModal);
    setEmail('');
  };

  const handleOnChange = (e: any) => {
    setEmail(e.target.value);
    setMessage(null);
  };

  const handleSubmit = async () => {
    if (!email) {
      setMessage('Please fill out all the required fields.');
    } else if (isValidEmail(email)) {
      setMessage(null);
      try {
        await mutate(email);
      } catch (error) {
        console.log(error);
        setStatus(500);
        setMessage('Error joining the waitlist.');
      }
    } else {
      setMessage('Email invalid.');
    }
  };

  useEffect(() => {
    console.log('isLoading', isLoading);
    console.log('data', data);
    if (isLoading || !data) {
      return;
    }
    if (data.error) {
      setStatus(500);
      setMessage(
        data.error === 'Error'
          ? 'Error! failed to subscribe to the newsletter.'
          : data.error,
      );
      return;
    }
    setStatus(201);
    setMessage(null);
    setConfirm(true);
  }, [isLoading, data]);

  return openModal ? (
    <div className='signupModal'>
      {confirm ? (
        <div className='signup-container shadow-sm shadow-slate-800 rounded-2xl'>
          <div
            className='flex items-center justify-end'
            style={{ marginBottom: '1rem' }}
          >
            <X
              className='cursor-pointer'
              style={{ width: '18px', height: '18px', color: '#919EAB' }}
              onClick={() => handleModal(true)}
            />
          </div>
          <div style={{ paddingBottom: '1rem' }}>
            <img
              className='confirm-email'
              src={ConfirmEmailImg}
              alt='confirm-email'
            />
            <h2 className='text-center'>
              Thank you for your interest in QuickLaunch
            </h2>
            <p
              className='text-center'
              style={{
                marginBottom: '1.5rem',
                color: '#C7CAD9',
                fontSize: '0.875rem',
              }}
            >
              We&apos;ve received your request and will be in touch shortly at{' '}
              <span className='font-semibold'>{email}</span>.
            </p>
            <Button
              fullWidth
              className='bg-blue1 p'
              style={{
                borderRadius: '12px',
                height: '100%',
                padding: '12px',
              }}
              onClick={() => {
                handleModal();
              }}
            >
              Back to site
            </Button>
          </div>
        </div>
      ) : (
        <div className='signup-container shadow-sm shadow-slate-800 rounded-2xl'>
          <div
            className='flex items-center justify-between'
            style={{ marginBottom: '1rem' }}
          >
            <h2 className='font-bold leading-7' style={{ color: '#EBECF2' }}>
              Sign up for updates
            </h2>
            <X
              className='cursor-pointer'
              style={{ width: '18px', height: '18px', color: '#919EAB' }}
              onClick={() => handleModal(true)}
            />
          </div>
          <div style={{ paddingBottom: '1rem' }}>
            <p
              className='text-sm mb-6 text-justify'
              style={{ color: '#C7CAD9', marginBottom: '1.5rem' }}
            >
              Drop your email here, and we&apos;ll keep you in the loop with all
              the exciting updates about QuickSwap Launches!
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                className={`w-full flex items-center border border-solid text-white ${message &&
                  'message-border'}`}
                style={{
                  height: '54px',
                  background: '#1B1E29',
                  borderColor: '#919EAB33',
                  padding: '0.5rem 0.75rem',
                  gap: '0.5rem',
                  borderRadius: '0.5rem',
                }}
              >
                {message && (
                  <AlertCircle
                    className='w-6 h-6'
                    style={{ color: '#FF5C5C' }}
                  />
                )}
                <input
                  type='email'
                  value={email}
                  onChange={(e) => handleOnChange(e)}
                  placeholder='Enter email'
                  className='w-full h-auto bg-transparent text-white'
                />
              </div>
              {message && <p className='error-message'>{message}</p>}
            </div>
            <Button
              fullWidth
              className='bg-blue1 p'
              style={{
                borderRadius: '12px',
                height: '100%',
                padding: '16px',
              }}
              onClick={() => {
                handleSubmit();
              }}
            >
              Get in touch
            </Button>
            <div className='join-tel-container'>
              <p style={{ color: '#C7CAD9', fontSize: '0.875rem' }}>and</p>
            </div>
            <h3 className='text-[#EBECF2] leading-6 font-semibold text-center mb-4'>
              Join us on Telegram
            </h3>
            <p
              style={{
                color: '#C7CAD9',
                fontSize: '0.875rem',
                textAlign: 'center',
                marginBottom: '1rem',
              }}
            >
              Join our Telegram channel for exclusive updates on upcoming crypto
              launches, industry insights, and real-time discussions
            </p>
            <Button
              fullWidth
              className='telegram-btn'
              onClick={(event) => {
                event.preventDefault();
                window.open('https://t.me/QuickLaunchOfficial');
              }}
            >
              <TelegramIcon className='telegram-icon'></TelegramIcon>
              Join us on Telegram
            </Button>
          </div>
          <div style={{ padding: '0.5rem 1rem 1rem 0' }}>
            <div className='terms-container'>
              <p>By sending this form, you agree to the</p>{' '}
              <a
                href='https://quickswap.exchange/#/tos'
                target='_blank'
                className='text-xs font-normal leading-5 text-[#448AFF] underline'
                rel='noreferrer'
              >
                Terms and Conditions
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <></>
  );
};

export default SignUpModal;
