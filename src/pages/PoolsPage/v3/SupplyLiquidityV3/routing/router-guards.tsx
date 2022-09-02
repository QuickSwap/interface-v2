import React, { useEffect } from 'react';
import Loader from 'components/Loader';
import { Redirect, Route } from 'react-router-dom';
import { useCurrentStep } from 'state/mint/v3/hooks';

export function RouterGuard({
  Component,
  allowance,
  redirect,
  ...rest
}: {
  Component: any;
  allowance: any;
  redirect: string;
  [x: string]: any;
}) {
  const currentStep = useCurrentStep();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return allowance ? (
    <Route
      {...rest}
      render={function() {
        return <Component {...rest} />;
      }}
    />
  ) : currentStep === 0 ? (
    <Redirect to={redirect} />
  ) : (
    <div className='f f-ac f-jc'>
      <Loader size={'36px'} stroke='white' />
    </div>
  );
}
