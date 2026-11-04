import React from 'react';

interface QuestionTransitionProps {
  questionKey: string;
  children: React.ReactNode;
}

export const QuestionTransition: React.FC<QuestionTransitionProps> = ({ questionKey, children }) => {
  return (
    <div key={questionKey} className="w-full animate-question-slide">
      {children}
    </div>
  );
};

