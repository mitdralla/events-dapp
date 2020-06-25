import React from 'react';

function PhoenixDAOLoader() {
	return (
		<div className="wrap">
  <div className="drop-outer">
    <svg className ="drop" width="100%" viewBox="0 0 30 42">
    <path fill="transparent" stroke="##2a96ed" strokeWidth="1.5"
        d="M15 3
           Q16.5 6.8 25 18
           A12.8 12.8 0 1 1 5 18
           Q13.5 6.8 15 3z" />
    </svg>
  </div>

  <div className="ripple ripple-1">
      <svg className="ripple-svg" viewBox="0 0 60 60" version="1.1"
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="24"/>
      </svg>
  </div>
  <div className="ripple ripple-2">
      <svg className="ripple-svg" viewBox="0 0 60 60" version="1.1"
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="24"/>
      </svg>
  </div>
  <div className="ripple ripple-3">
      <svg className="ripple-svg" viewBox="0 0 60 60" version="1.1"
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="24"/>
      </svg>
  </div>
</div>
	);
}

export default PhoenixDAOLoader;
