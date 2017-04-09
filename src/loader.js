import React, { PureComponent } from 'react';

class Loader extends PureComponent {
  render() {
    return (
      <div className="loader" style={{display: this.props.loading ? '' : 'none'}}>
        <div /><div /><div />
      </div>
    )
  }
}

export default Loader
