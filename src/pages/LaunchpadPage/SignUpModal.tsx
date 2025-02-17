'use client';

import React, { useState } from 'react';
import { Box } from '@material-ui/core';

const SignUpModal: React.FC<{ openModal: boolean; setOpenModal: any }> = ({
  openModal,
  setOpenModal,
}) => {
  const [email, setEmail] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleModal = (isClose = false) => {
    if (!isClose) {
      setConfirm(!confirm);
    }
    setOpenModal(!openModal);
    setEmail('');
  };

  return openModal && <Box>Sign Up modal</Box>;
};

export default SignUpModal;
