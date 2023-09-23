import { Box } from '@material-ui/core';
import React from 'react';
import { Calculator } from './Calculator';
import { Graph } from './Graph';
import { AboutSecction } from './AboutSection';
import { FaqSection } from './FaqSection';
import { HistoricalTable } from './HistoricalTable';
import { StepsSection } from './StepsSection';

import '../styles/calculator.scss';

const CalculatorPage: React.FC = () => {
  return (
    <Box width='100%' mb={3} id='calculator-page'>
      <Calculator />
      {/* <Graph />
      <AboutSecction />
      <StepsSection />
      <FaqSection />
      <HistoricalTable /> */}
    </Box>
  );
};

export default CalculatorPage;
