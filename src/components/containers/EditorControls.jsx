import React, { Component } from 'react';

class EditorControls extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="editor-controls">
        <div className="card-panel">
          <div className="col m12">
            <form action="#">
              <div className="file-field input-field">
                <div className="btn color-2">
                  <span>Image</span>
                  <input type="file" id="userImg" fileread="userImg" onChange={this.props.onImageUpload} />
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path" type="text" />
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="card-panel valign-wrapper">
          <div className="col m12">
            <form action="#" className="valign center-align">
              <input type="checkbox" className="filled-in color-2" id="test6" checked="checked" ng-model="showVertices" />
              <label htmlFor="test6">Display lines</label>
            </form>
          </div>
        </div>
        <div className="card-panel">
          <div className="col m12">
            <form action="#">
              <p className="range-field">
                <input type="range" id="test5" min="10" max="100" ng-model="polygonSize" />
              </p>
            </form>
          </div>
        </div>
        <div className="card-panel">
          <button className="btn-large polygon-btn color-1 center-align" ng-click="polyframe()" ng-disabled="userImg.length < 1">
                        Polygon it
          </button>
        </div>
      </div>
    );
  }
}

export default EditorControls;
