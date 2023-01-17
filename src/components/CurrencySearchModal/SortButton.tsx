import React from 'react';

interface SortButtonProps {
  toggleSortOrder: () => void;
  ascending: boolean;
}

const SortButton: React.FC<SortButtonProps> = ({
  toggleSortOrder,
  ascending,
}) => {
  return (
    <div className='filterWrapper' onClick={toggleSortOrder}>
      <p>{ascending ? '↑' : '↓'}</p>
    </div>
  );
};

export default SortButton;
