import React from 'react';
import { Check } from 'react-feather';
import { Helmet } from 'react-helmet';
import './index.scss';

interface IStepTitle {
  title: string;
  isCompleted: boolean;
  step: number;
}

export function StepTitle({ title, isCompleted, step }: IStepTitle) {
  return (
    <div className='f f-ac mb-2'>
      <Helmet>
        <title>{`Quickswap — ${title}`}</title>
      </Helmet>
      <div
        className={`step-title__circle ${
          isCompleted ? 'done' : ''
        } f f-ac f-jc`}
      >
        {isCompleted ? (
          <Check stroke={'white'} strokeWidth={3} size={15} />
        ) : (
          step
        )}
      </div>
      <div className='step-title__text ml-1'>{title}</div>
    </div>
  );
}
