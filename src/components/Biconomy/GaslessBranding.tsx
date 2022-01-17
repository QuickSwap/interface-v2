import {
  createTheme,
  ThemeProvider,
  Typography,
  useTheme,
} from '@material-ui/core';
import * as React from 'react';

interface IGaslessBrandingProps extends React.HTMLAttributes<HTMLDivElement> {
  enabled: boolean;
}

const GaslessBranding: React.FC<IGaslessBrandingProps> = ({
  enabled,
  children,
}) => {
  const defaultTheme = useTheme();
  if (!enabled) {
    return <>{children}</>;
  }

  const palette = defaultTheme.palette;

  const theme = createTheme({
    ...defaultTheme,
    palette: {
      ...defaultTheme.palette,
      primary: {
        ...defaultTheme.palette.primary,
        main: '#C0AE4B',
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <div style={{ zIndex: 10, position: 'relative' }}>{children}</div>
      </ThemeProvider>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 20,
          // backgroundColor: '#C0AE4B',
          borderRadius: '20px 20px 0 0',
          border: '1px solid #C0AE4B',
          borderBottom: 0,
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 20,
          backgroundColor: '#C0AE4B',
          border: '1px solid #C0AE4B',
          borderTop: 0,
          borderBottom: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            top: -1,
            backgroundColor: palette.background.paper,
            borderRadius: '0 0 20px 20px',
          }}
        ></div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '0',
          right: '0',
          transform: 'translate(0, 100%)',
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          color: '#00000090',
          backgroundColor: '#C0AE4B',
          borderRadius: '0 0 20px 20px',
          border: '1px solid #C0AE4B',
          padding: 8,
        }}
      >
        <Typography variant='caption'>Powered by</Typography>
        <Typography style={{ fontWeight: 800 }} variant='caption'>
          Biconomy
        </Typography>
      </div>
    </>
  );
};

export default GaslessBranding;
