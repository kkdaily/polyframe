import React, { Component } from 'react';
import {
  Container, Grid, Header,
} from 'semantic-ui-react';
import EditorControls from '../../views/EditorControls';
import EditorImageViewer from '../../views/EditorImageViewer';
import { polygonizeImage } from '../../../utils/index';

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

  /* convert image to low-poly */
  async polygonIt() {
    this.setState({
      loading: true,
      showPreviewImage: false,
    });

    this.clearPreviousImage();

    await polygonizeImage(this.state.userImg, this.state.polygonSize, this.state.showLines);

    this.setState({
      loading: false,
    });
  }

  clearPreviousImage() {
    const canvas = document.getElementById('userImageCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
  }

  addImage(e) {
    this.state.childRefs.imgFile.click();
  }

  getChildRefs(childRefs) {
    this.setState({
      childRefs: Object.assign(this.state.childRefs, childRefs),
    });
  }

  handleCheckboxChange() {
    this.setState({
      showLines: !this.state.showLines,
    });
  }

  handleSliderChange(ev) {
    this.setState({
      polygonSize: ev.target.value,
    });
  }

  render() {
    return (
      <Container className="Editor" textAlign="center">
        <Grid relaxed stackable>
          <Grid.Row>
            <Grid.Column>
              <Header as="h1" className="title">Polyframe</Header>
              <Header as="h3" className="subtitle margin collapsed">Quick and easy low-polygon art</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={10}>
              <EditorImageViewer loading={this.state.loading} addImage={this.addImage} showPreviewImage={this.state.showPreviewImage} imageSrc={this.state.previewImageSrc} canvasHeight={this.state.canvasHeight} canvasWidth={this.state.canvasWidth} />
            </Grid.Column>
            <Grid.Column width={6}>
              <EditorControls polygonSize={this.state.polygonSize} handleSliderChange={this.handleSliderChange} handleCheckboxChange={this.handleCheckboxChange} addImage={this.addImage} imageSrc={this.state.previewImageSrc} onImageUpload={this.onImageUpload} polygonIt={this.polygonIt} getChildRefs={this.getChildRefs} />
            </Grid.Column>
          </Grid.Row>

          <canvas ref={c => (this._canvas = c)} width={this.state.userImg.width} height={this.state.userImg.height} id="world" className="hidden" />
        </Grid>
      </Container>
    );
  }
}

export default Editor;
