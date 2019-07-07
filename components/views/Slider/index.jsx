import React, { Component } from 'react';
import './index.less';

class Slider extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Slider">
        <input type="range" min="10" max="100" value={this.props.polygonSize} onChange={this.props.handleChange} />
      </div>
    );
  }
}

export default Slider;