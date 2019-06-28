import React, { Component } from 'react';

class EditorImageViewer extends Component {
  render() {
    return (
      <div id="image-frame">
        <div id="spinner" ng-show="loadingImage" ng-style="{'height': canvasHeight, 'width': canvasWidth}" />
        <div ng-show="!loadingImage" className="valign-wrapper">
          <img id="previewImage" ng-show="previewImage" className="responsive-img valign" />
          <canvas id="canvas" className="responsive-img valign" ng-show="!previewImage && !loadingImage" height="{{canvasHeight}}" width="{{canvasWidth}}" />
        </div>
      </div>
    );
  }
}

export default EditorImageViewer;
