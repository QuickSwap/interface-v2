import { styled, Switch } from '@material-ui/core';

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    color: '#626683',
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#0fc676',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#1e463e',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: 'width 200px',
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: '#32394c',
    boxSizing: 'border-box',
  },
}));

export default AntSwitch;
