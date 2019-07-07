/*
    harris corner detection
    http://jsdo.it/imageData/hxMw
*/

import Delaunay from './triangulate.js';

// main
const cornerDetection = (image, polygonSize, showVertices) => {
  return new Promise((resolve, reject) => {
    const h = image.height;
    const w = image.width;

    const c = document.getElementById('world').getContext('2d');
    c.fillRect(0, 0, w, h);
    c.drawImage(image, 0, 0, w, h);

    const gray = rgba2gray(image);

    // decrease polygonSize to increase density of polygons
    const corners = detectCorners(gray, polygonSize, 0.08);

    const grayImageData = gray2rgba(add(corners, multiple(gray, 0.5)));
    c.putImageData(grayImageData, 0, 0);

    // rgba -> gray
    function rgba2gray(image) {
      // input image
      const imageData = c.getImageData(0, 0, w, h);
      const data = imageData.data;
      // output matrix
      const out = [];
      let index = 0;

      const step = w * 4;
      for (let i = 0; i < h; i++) {
        const row = out[i] = [];
        for (let j = 0; j < w; j++) {
          row[j] = 0.3 * data[index] + 0.59 * data[index + 1] + 0.11 * data[index + 2];
          index += 4;
        }
      }
      return out;
    }
    // gray -> rgba
    function gray2rgba(image) {
      // output image
      const imageData = c.createImageData(w, h);
      const data = imageData.data;

      let index = 0;

      const step = w * 4;
      for (let i = 0; i < h; i++) {
        const row = image[i];
        for (let j = 0; j < w; j++) {
          const v = row[j];
          data[index] = v;
          data[index + 1] = v;
          data[index + 2] = v;
          data[index + 3] = 255;
          index += 4;
        }
      }
      return imageData;
    }

    // threshold
    function threshold(image, value, maxValue, type) {
      const w = image[0].length;
      const h = image.length;
      const out = zeros(w, h);
      if (type === 'binary') {
        for (var i = 0; i < h; i++) {
          var inputRow = image[i];
          var row = out[i];
          for (var j = 0; j < w; j++) {
            if (inputRow[j] > value) row[j] = maxValue;
          }
        }
      } else if (type === 'toZero') {
        for (var i = 0; i < h; i++) {
          var inputRow = image[i];
          var row = out[i];
          for (var j = 0; j < w; j++) {
            const v = inputRow[j];
            if (v > value) row[j] = v;
          }
        }
      }
      return out;
    }
    // Sobel
    function Sobel(image, dx, dy) {
      const w = image[0].length;
      const h = image.length;
      const out = zeros(w, h);
      if (dx === 1 && dy === 0) {
        var prevRow = image[0];
        var currentRow = image[1];
        var nextRow = image[2];
        for (var i = 1; i < h - 1; i++) {
          var row = out[i];
          for (var j = 0; j < w; j++) {
            row[j] = prevRow[j] + 2 * currentRow[j] + nextRow[j];
          }
          prevRow = currentRow;
          currentRow = nextRow;
          nextRow = image[i + 2];
        }
        for (var i = 0; i < h; i++) {
          var inputRow = image[i];
          var row = out[i];
          for (var j = 1; j < w - 1; j++) {
            row[j] = -inputRow[j - 1] + inputRow[j + 1];
          }
        }
      } else if (dx === 0 && dy === 1) {
        for (var i = 0; i < h; i++) {
          var inputRow = image[i];
          var row = out[i];
          for (var j = 1; j < w - 1; j++) {
            row[j] = inputRow[j - 1] + 2 * inputRow[j] + inputRow[j + 1];
          }
        }
        var prevRow = image[0];
        var currentRow = image[1];
        var nextRow = image[2];
        for (var i = 1; i < h - 1; i++) {
          var row = out[i];
          for (var j = 0; j < w; j++) {
            row[j] = -prevRow[j] + nextRow[j];
          }
          prevRow = currentRow;
          currentRow = nextRow;
          nextRow = image[i + 2];
        }
      } else {
        console.log('not implemented');
      }
      return out;
    }
    // alloc matrix
    function createMat(w, h, value) {
      const out = [];
      for (let i = 0; i < h; i++) {
        const row = out[i] = [];
        for (let j = 0; j < w; j++) {
          row[j] = value;
        }
      }
      return out;
    }
    function zeros(w, h) {
      return createMat(w, h, 0);
    }
    // add matrix
    function add(mat1, mat2) {
      const out = [];
      for (let i = 0; i < h; i++) {
        const inputRow1 = mat1[i];


        const inputRow2 = mat2[i];
        const row = out[i] = [];
        for (let j = 0; j < w; j++) {
          row[j] = inputRow1[j] + inputRow2[j];
        }
      }
      return out;
    }
    // multiple matrix
    function multiple(mat1, mat2) {
      const out = [];
      if (typeof mat2 === 'object') {
        for (var i = 0; i < h; i++) {
          var inputRow1 = mat1[i];
          const inputRow2 = mat2[i];
          var row = out[i] = [];
          for (var j = 0; j < w; j++) {
            row[j] = inputRow1[j] * inputRow2[j];
          }
        }
      } else if (typeof mat2 === 'number') {
        for (var i = 0; i < h; i++) {
          var inputRow1 = mat1[i];
          var row = out[i] = [];
          for (var j = 0; j < w; j++) {
            row[j] = inputRow1[j] * mat2;
          }
        }
      } else {
        console.log('not implemented');
      }
      return out;
    }
    // 3x3 box filter
    function blur(image) {
      const w = image[0].length;
      const h = image.length;
      const out = zeros(w, h);
      let prevRow = image[0];
      let currentRow = image[1];
      let nextRow = image[2];
      let buf = 0;
      for (let i = 1; i < h - 1; i++) {
        const row = out[i];
        for (let j = 1; j < w - 1; j++) {
          for (var p = -1; p <= 1; p++) {
            buf += prevRow[j + p];
          }
          for (var p = -1; p <= 1; p++) {
            buf += currentRow[j + p];
          }
          for (var p = -1; p <= 1; p++) {
            buf += nextRow[j + p];
          }
          row[j] = buf / 9;
          buf = 0;
        }
        prevRow = currentRow;
        currentRow = nextRow;
        nextRow = image[i + 2];
      }
      return out;
    }

    function detectCorners(image, kernelSize, kp, minH) {
      // array of corner coordinates for delauney triangulation
      const cornerLocations = [];
      const w = image[0].length;
      const h = image.length;
      kernelSize = kernelSize > 0 ? kernelSize : 7;
      kp = kp > 0 ? kp : 0.0008;
      minH = minH > 0 ? minH : 10000;

      const dx = Sobel(image, 1, 0);
      const dy = Sobel(image, 0, 1);
      const dxdx = blur(multiple(dx, dx));
      const dydy = blur(multiple(dy, dy));
      const dxdy = blur(multiple(dx, dy));

      let H = zeros(w, h);
      for (var i = 0; i < h; i++) {
        const xxRow = dxdx[i];
        const yyRow = dydy[i];
        const xyRow = dxdy[i];
        const row = H[i];
        for (var j = 0; j < w; j++) {
          const xx = xxRow[j];
          const yy = yyRow[j];
          const xy = xyRow[j];
          const trace = xx + yy;
          row[j] = xx * yy - xy * xy - kp * trace * trace;
        }
      }
      H = threshold(H, minH, 255, 'toZero');

      // non-maximum suppression
      const out = zeros(w, h);
      const k = Math.floor(kernelSize / 2);
      for (var i = k; i < h - k; i++) {
        for (var j = k; j < w - k; j++) {
          const v = H[i][j];
          if (v <= 0) continue;
          let flag = true;
          for (let p = -k; p <= k && flag; p++) {
            var y = i + p;
            // if (y < 0 || y >= h) continue;
            for (let q = -k; q <= k; q++) {
              if (q === 0 && p === 0) continue;
              var x = j + q;
              // if (x < 0 || x >= w) continue;
              if (v <= H[y][x]) {
                flag = false;
                break;
              }
            }
          }
          if (flag) {
            // push coordinate of corner to array
            // (y, x) coordinates
            cornerLocations.push([j, i]);

            // local maximum
            out[i][j] = 255;
          }
        }
      }

      // add corners to background
      cornerLocations.push([0, 0], [w, 0], [w, h], [0, h]);

      // draw triangle on image
      var ctx = document.getElementById('userImageCanvas').getContext('2d'),
        vertices = cornerLocations,
        i, x, y;

      const triangles = Delaunay.triangulate(vertices);
      for (i = triangles.length; i;) {
        ctx.beginPath();
        --i; ctx.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        const p1 = vertices[triangles[i]];
        --i; ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        const p2 = vertices[triangles[i]];
        --i; ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        const p3 = vertices[triangles[i]];
        ctx.closePath();

        // find center of triangle
        const centerX = Math.floor((p1[0] + p2[0] + p3[0]) / 3);
        const centerY = Math.floor((p1[1] + p2[1] + p3[1]) / 3);

        // find rgba value of original color image at centroid coordinates
        const pixel = c.getImageData(centerX, centerY, 1, 1).data;

        const red = pixel[0];
        const blue = pixel[1];
        const green = pixel[2];
        const alpha = pixel[3];

        // fill in triangles using rgb value of centroid
        ctx.fillStyle = `rgba(${red}, ${blue}, ${green}, ${alpha})`;
        ctx.fill();

        // make lines transparent
        if (showVertices !== true) {
          ctx.strokeStyle = `rgba(${red}, ${blue}, ${green}, ${alpha})`;
        } else {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
        }

        ctx.stroke();
      }
      resolve(out);
    }
  });
};

export default cornerDetection;
