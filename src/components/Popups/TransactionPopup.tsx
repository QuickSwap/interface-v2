import React, { useEffect } from 'react';
import { Box, LinearProgress } from 'theme/components';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink } from 'utils/index';
import { ArrowUpRight } from 'react-feather';

interface TransactionPopupProps {
  hash: string;
  pending?: boolean;
  success?: boolean;
  summary?: string;
}

const TransactionPopup: React.FC<TransactionPopupProps> = ({
  hash,
  pending,
  success,
  summary,
}) => {
  const { chainId } = useActiveWeb3React();
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        return Math.min(oldProgress + 2.5, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Box margin='0 0 12px' className='flex justify-between items-center'>
        <small
          className={`weight-600 ${
            pending ? 'text-yellow3' : success ? 'text-success' : 'text-error'
          }`}
        >
          {pending ? 'Processing…' : success ? 'Confirmed' : 'Failed'}
        </small>
        {chainId && hash.length > 0 && (
          <a
            className='text-secondary'
            href={getEtherscanLink(chainId, hash, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
          >
            <ArrowUpRight />
          </a>
        )}
      </Box>
      <small>
        {summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
      </small>
      {pending && (
        <Box className='pendingBar'>
          <LinearProgress value={progress} />
        </Box>
      )}
    </>
  );
};

export default TransactionPopup;
