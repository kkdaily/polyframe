import React, { Component } from 'react';
import {
  Container, Segment, Button, Checkbox,
} from 'semantic-ui-react';
import Slider from '../Slider/index';

class EditorControls extends Component {
  componentDidMount() {
    this.props.getChildRefs(this.refs);
  }

  render() {
    return (
      <Container className="EditorControls">
        <Segment.Group className="controls-group">
          <Segment padded>
            <input ref="imgFile" type="file" id="userImg" onChange={this.props.onImageUpload} />
            <Button onClick={this.props.addImage}>Add Image</Button>
          </Segment>
          <Segment padded>
            <Checkbox checked={this.props.showLines} onChange={this.props.handleCheckboxChange} label="Show Lines" defaultChecked />
          </Segment>
          <Segment padded>
            <Slider polygonSize={this.props.polygonSize} handleChange={this.props.handleSliderChange} />
          </Segment>
          <Segment padded>
            <Button onClick={this.props.polygonIt} disabled={!this.props.imageSrc} primary>
              Polygon It
            </Button>
          </Segment>
        </Segment.Group>
      </Container>
    );
  }
}

export default EditorControls;
