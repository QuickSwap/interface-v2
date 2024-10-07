import { Box, Typography } from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureBlockProps {
  title: string;
  desc: string;
  actionLabel: string;
  image: string;
  onClick?: () => void;
  link?: string;
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({
  actionLabel,
  desc,
  image,
  title,
  onClick,
  link,
}) => {
  return (
    <Box
      className='feat_block'
      style={{
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(24px)',
        borderRadius: '16px',
        alignItems: 'start',
      }}
    >
      <Box className='cover_title' style={{ display: 'flex' }}>
        <img src={image} alt={title} />
        <Typography
          style={{
            fontSize: '18px',
            color: '#448aff',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box className='featureText' style={{ height: '100%' }}>
        <Box
          style={{
            height: '80%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <p>{desc}</p>
          {link ? (
            <Link to={link} className='link_action'>
              {actionLabel}
              <KeyboardArrowDown
                style={{
                  transform: 'rotate(-90deg)',
                  color: '#448aff',
                }}
              />
            </Link>
          ) : (
            <Box
              className='link_action'
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={onClick}
            >
              {actionLabel}
              <KeyboardArrowDown
                style={{
                  transform: 'rotate(-90deg)',
                  color: '#448aff',
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
export default FeatureBlock;
