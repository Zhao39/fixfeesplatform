import { useState } from 'react';

// material-ui
import { Step, Stepper, StepLabel, Box, Typography } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import { useEffect } from 'react';

// step options
//const steps = ['Onboarding', 'Underwriting (In progress)', 'Install', 'Active Merchant'];
const stepColors = ['white', 'yellow', 'Orange', 'Blue', 'Green', 'red'];

const StepBar = (props) => {
  const { step, steps } = props
  const [activeStep, setActiveStep] = useState(step + 1);

  useEffect(() => {
    setActiveStep(step + 1)
  }, [step])

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep);
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={parseInt(activeStep)} alternativeLabel>
          {steps.map((labelObj, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={() => (
                  <svg width={index == parseInt(activeStep) ? "37" : "37"} height={index == parseInt(activeStep) ? "37" : "37"} style={{ position: 'relative', top: '1px' }}>
                    <circle cx={index == parseInt(activeStep) ? "17" : "17"} cy={index == parseInt(activeStep) ? "17" : "17"} r={index == parseInt(activeStep) ? "17" : "17"} fill={stepColors[index]} />
                    <text
                      x={index == parseInt(activeStep) ? "17" : "17"}
                      y={index == parseInt(activeStep) ? "17" : "17"}
                      fill={index < 3 ? '#9605FC' : 'white'}
                      fontSize={index == parseInt(activeStep) ? "16" : "16"}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {index + 1}
                    </text>
                  </svg>
                )}

              >
                <span style={index == parseInt(activeStep) ? { color: 'white' } : {}}>{labelObj}</span>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </>
  )
}

export default StepBar;
