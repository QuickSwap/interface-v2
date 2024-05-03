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
      style={{
        width: '204px',
        height: '318px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(24px)',
        backgroundColor: 'rgb(0 0 0 / 12%)',
        borderRadius: '16px',
        alignItems: 'start',
      }}
    >
      <img src={image} alt={title} />
      <Box className='featureText' style={{ height: '100%' }}>
        <Typography
          style={{
            fontSize: '18px',
            color: '#448aff',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          {title}
        </Typography>
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
            <Link to={link}>
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
