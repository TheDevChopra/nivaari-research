import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { ResearchExperience } from './app/research/ResearchExperience';

export const App: React.FC = () => {
  return (
    <>
      <ResearchExperience />
      <Analytics />
    </>
  );
};

export default App;

