import React, { Component } from 'react';
import {
  Container, Segment, Button, Checkbox,
} from 'semantic-ui-react';
import Slider from '../Slider/index';

class EditorControls extends Component {
  componentDidMount() {
    const { getChildRefs } = this.props;
    getChildRefs(this.refs);
  }

  render() {
    const {
      onImageUpload, addImage, showLines, handleCheckboxChange, polygonSize, handleSliderChange,
      polygonIt, imageSrc,
    } = this.props;

    return (
      <Container className="EditorControls">
        <Segment.Group className="controls-group">
          <Segment padded>
            <input
              ref="imgFile"
              type="file"
              id="userImg"
              onChange={onImageUpload}
            />
            <Button onClick={addImage}>Add Image</Button>
          </Segment>
          <Segment padded>
            <Checkbox
              checked={showLines}
              onChange={handleCheckboxChange}
              label="Show Lines"
              defaultChecked
            />
          </Segment>
          <Segment padded>
            <Slider polygonSize={polygonSize} handleChange={handleSliderChange} />
          </Segment>
          <Segment padded>
            <Button onClick={polygonIt} disabled={!imageSrc} primary>
              Polygon It
            </Button>
          </Segment>
        </Segment.Group>
      </Container>
    );
  }
}

export default EditorControls;
