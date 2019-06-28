import React, { Component } from 'react';
import EditorControls from '../containers/EditorControls';
import EditorImageViewer from '../containers/EditorImageViewer';

class Editor extends Component {
  constructor() {
    super();
    this.state = {
      // display empty image frame and hide spinner initially
      preview: false,
      noImage: true,
      loadingImage: false,
      canvasHeight: '',
      canvasWidth: '',
      userImg: '',
      polygonSize: 20, // set 'polygon density' slider value to 20
      showVertices: true, // set 'display lines' checkbox as checked
    };

    // detect when user uploads image to file input
    const _URL = window.URL || window.webkitURL; // ??? wtf
  }

  onImageUpload() {
    angular.element('#userImg').change(function (e) {
      let file;
      let img;
      if ((file = this.files[0])) {
        // create preview of image uploaded in frame
        img = new Image();
        img.onload = function () {
          $scope.canvasHeight = this.height;
          $scope.canvasWidth = this.width;
          document.getElementById('previewImage').src = img.src;
          $scope.previewImage = true;
          $scope.$apply();
        };
        img.src = _URL.createObjectURL(file);
      }
    });
  }

  /* convert image to low-poly when 'Polygon it' button is clicked
    using delaunay triangulation and harris corner detection */
  polyframe() {
    // display loading spinner while creating low-poly canvas
    this.setState({
      noImage: false,
      loadingImage: true,
      previewImage: false,
    });

    this.clearPreviousImage();
  }

  clearPreviousImage() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  render() {
    return (
      <div className="container" id="editor">
        <div className="row">
          <div className="center-align">
            <h2>Polyframe</h2>
          </div>
        </div>
        <div className="row">
          <div className="col m8 s12">
            <EditorImageViewer />
          </div>
          <div className="col s12 m4">
            <EditorControls onImageUpload={this.onImageUpload} />
          </div>
        </div>

        {/* </div><!-- harris corner detection --> */}
        <canvas id="world" ng-hide="true" />
      </div>
    );
  }
}

export default Editor;
