import React from 'react';

interface LabelProps {
  title: string;
}

export const Label: React.FC<LabelProps> = ({ title }) => {
  return (
    <label className="block mb-1 ml-1 text-sm text-slate-600">
      {title}
    </label>
  );
};
