import React from 'react';

const Loader = props => {
  return (
    <div className="loader" style={{display: props.loading ? '' : 'none'}}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default Loader
