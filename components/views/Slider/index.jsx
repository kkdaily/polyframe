import React from 'react';

const Slider = (props) => {
  const { polygonSize, handleChange } = props;

  return (
    <div className="Slider">
      <input type="range" min="10" max="100" value={polygonSize} onChange={handleChange} />
    </div>
  );
};

export default Slider;
