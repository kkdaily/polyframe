import React, { Component } from 'react';
import {
  Container, Grid, Header,
} from 'semantic-ui-react';
import EditorControls from '../../views/EditorControls';
import EditorImageViewer from '../../views/EditorImageViewer';
import polygonizeImage from '../../../utils/index';

class Editor extends Component {
  constructor() {
    super();
    this.state = {
      showPreviewImage: true,
      loading: false,
      canvasHeight: '',
      canvasWidth: '',
      userImg: '',
      polygonSize: 20,
      showLines: true,
      previewImageSrc: '',
      childRefs: {},
    };

    // detect when user uploads image to file input
    this.url = window.URL || window.webkitURL;

    this.polygonIt = this.polygonIt.bind(this);
    this.onImageUpload = this.onImageUpload.bind(this);
    this.addImage = this.addImage.bind(this);
    this.getChildRefs = this.getChildRefs.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.getCanvasRef = this.getCanvasRef.bind(this);
  }

  onImageUpload(e) {
    e.preventDefault();

    const file = e.target.files[0];
    const img = new Image();

    img.onload = () => {
      this.setState({
        canvasHeight: img.height,
        canvasWidth: img.width,
        previewImageSrc: img.src,
        userImg: img,
        showPreviewImage: true,
      });
    };

    img.src = this.url.createObjectURL(file);
  }

  getCanvasRef(ref) {
    this.canvas = ref;
  }

  getChildRefs(newChildRefs) {
    const { childRefs } = this.state;
    this.setState({
      childRefs: Object.assign(childRefs, newChildRefs),
    });
  }

  clearPreviousImage() {
    const canvas = document.getElementById('userImageCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /* convert image to low-poly */
  async polygonIt() {
    const { userImg, polygonSize, showLines } = this.state;

    this.setState({
      loading: true,
      showPreviewImage: false,
    });

    this.clearPreviousImage();

    await polygonizeImage(userImg, polygonSize, showLines);

    this.setState({
      loading: false,
    });
  }

  handleCheckboxChange() {
    const { showLines } = this.state;
    this.setState({
      showLines: !showLines,
    });
  }

  handleSliderChange(ev) {
    this.setState({
      polygonSize: ev.target.value,
    });
  }

  addImage() {
    const { childRefs } = this.state;
    childRefs.imgFile.click();
  }

  render() {
    const {
      loading, showPreviewImage, previewImageSrc, canvasHeight, canvasWidth, polygonSize, userImg,
    } = this.state;

    return (
      <Container className="Editor" textAlign="center">
        <Grid relaxed stackable>
          <Grid.Row>
            <Grid.Column>
              <Header as="h1" className="title">
                POLYFRAME
              </Header>
              <Header as="h3" className="subtitle margin collapsed">
                Quick and easy low-polygon art
              </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={10}>
              <EditorImageViewer
                loading={loading}
                addImage={this.addImage}
                showPreviewImage={showPreviewImage}
                imageSrc={previewImageSrc}
                canvasHeight={canvasHeight}
                canvasWidth={canvasWidth}
              />
            </Grid.Column>
            <Grid.Column width={6}>
              <EditorControls
                polygonSize={polygonSize}
                handleSliderChange={this.handleSliderChange}
                handleCheckboxChange={this.handleCheckboxChange}
                addImage={this.addImage}
                imageSrc={previewImageSrc}
                onImageUpload={this.onImageUpload}
                polygonIt={this.polygonIt}
                getChildRefs={this.getChildRefs}
              />
            </Grid.Column>
          </Grid.Row>
          <canvas
            id="world"
            className="hidden"
            ref={this.getCanvasRef}
            width={userImg.width}
            height={userImg.height}
          />
        </Grid>
      </Container>
    );
  }
}

export default Editor;
