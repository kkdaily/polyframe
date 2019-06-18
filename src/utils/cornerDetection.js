/*
    harris corner detection 
    http://jsdo.it/imageData/hxMw 
*/
'use strict'

// preload the image
var image = new Image();

image.src = $scope.userImg;
image.onload = main;

// main
function main() {

    var h = image.height;
    var w = image.width;

    var $canvas = $("#world"),
    c = $canvas[0].getContext("2d");
    $canvas.attr({
        width: w+"px",
        height: h+"px"
    });
    c.fillRect(0,0, w,h);
    c.drawImage(image, 0,0, w,h);
    
    var gray = rgba2gray(image);

    //decrease $scope.polygonSize to increase density of polygons
    var corners = detectCorners(gray, $scope.polygonSize, 0.08);
    
    var grayImageData = gray2rgba(add(corners, multiple(gray, 0.5)));
    c.putImageData(grayImageData, 0,0);

    // rgba -> gray
    function rgba2gray(image) {
        // input image
        var imageData = c.getImageData(0,0, w,h);
        var data = imageData.data;
        // output matrix
        var out = [];     
        var index = 0,
            step = w*4;
        for (var i = 0; i < h; i++) {
            var row = out[i] = [];
            for (var j = 0; j < w; j++) {
                row[j] = 0.3 * data[index] + 0.59 * data[index+1] + 0.11 * data[index+2];
                index += 4;
            }
        }
        return out;
    }
    // gray -> rgba
    function gray2rgba(image) {
        // output image
        var imageData = c.createImageData(w,h);
        var data = imageData.data;
        
        var index = 0,
            step = w*4;
        for (var i = 0; i < h; i++) {
            var row = image[i];
            for (var j = 0; j < w; j++) {
                var v = row[j];
                data[index] = v;
                data[index+1] = v;
                data[index+2] = v;
                data[index+3] = 255;
                index += 4;
            }
        }
        return imageData;
    }

    // threshold
    function threshold(image, value, maxValue, type) {
        var w = image[0].length,
            h = image.length;
        var out = zeros(w, h);
        if (type === "binary") {
            for (var i = 0; i < h; i++) {
                var inputRow = image[i];
                var row = out[i];
                for (var j = 0; j < w; j++) {
                    if (inputRow[j] > value) row[j] = maxValue;
                }
            }
        }
        else if (type === "toZero") {
            for (var i = 0; i < h; i++) {
                var inputRow = image[i];
                var row = out[i];
                for (var j = 0; j < w; j++) {
                    var v = inputRow[j];
                    if (v > value) row[j] = v;
                }
            }
        }
        return out;
    }
    // Sobel
    function Sobel(image, dx, dy) {
        var w = image[0].length,
            h = image.length;
        var out = zeros(w, h);
        if (dx === 1 && dy === 0) {
            var prevRow = image[0],
                currentRow = image[1],
                nextRow = image[2];
            for (var i = 1; i < h-1; i++) {
                var row = out[i];
                for (var j = 0; j < w; j++) {
                    row[j] = prevRow[j] + 2 * currentRow[j] + nextRow[j];
                }
                prevRow = currentRow;
                currentRow = nextRow;
                nextRow = image[i+2];
            }
            for (var i = 0; i < h; i++) {
                var inputRow = image[i];
                var row = out[i];
                for (var j = 1; j < w-1; j++) {
                    row[j] = -inputRow[j-1] + inputRow[j+1];
                }
            }
        }
        else if (dx === 0 && dy === 1) {
            for (var i = 0; i < h; i++) {
                var inputRow = image[i];
                var row = out[i];
                for (var j = 1; j < w-1; j++) {
                    row[j] = inputRow[j-1] + 2 * inputRow[j] + inputRow[j+1];
                }
            }
            var prevRow = image[0],
                currentRow = image[1],
                nextRow = image[2];
            for (var i = 1; i < h-1; i++) {
                var row = out[i];
                for (var j = 0; j < w; j++) {
                    row[j] = -prevRow[j] + nextRow[j];
                }
                prevRow = currentRow;
                currentRow = nextRow;
                nextRow = image[i+2];
            }
        }
        else {
            console.log("not implemented");
        }
        return out;
    }
    // alloc matrix
    function createMat(w, h, value) {
        var out = [];
        for (var i = 0; i < h; i++) {
            var row = out[i] = [];
            for (var j = 0; j < w; j++) {
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
        var out = [];
        for (var i = 0; i < h; i++) {
            var inputRow1 = mat1[i], 
                inputRow2 = mat2[i];
            var row = out[i] = [];
            for (var j = 0; j < w; j++) {
                row[j] = inputRow1[j] + inputRow2[j];
            }
        }
        return out;
    }
    // multiple matrix
    function multiple(mat1, mat2) {
        var out = [];
        if (typeof mat2 === "object") {
            for (var i = 0; i < h; i++) {
                var inputRow1 = mat1[i], 
                    inputRow2 = mat2[i];
                var row = out[i] = [];
                for (var j = 0; j < w; j++) {
                    row[j] = inputRow1[j] * inputRow2[j];
                }
            }
        }
        else if (typeof mat2 === "number") {
            for (var i = 0; i < h; i++) {
                var inputRow1 = mat1[i];
                var row = out[i] = [];
                for (var j = 0; j < w; j++) {
                    row[j] = inputRow1[j] * mat2;
                }
            }
        }
        else {
            console.log("not implemented");
        }
        return out;
    }
    // 3x3 box filter
    function blur(image) {
        var w = image[0].length,
            h = image.length;
        var out = zeros(w, h);
        var prevRow = image[0], 
            currentRow = image[1], 
            nextRow = image[2];
        var buf = 0;
        for (var i = 1; i < h-1; i++) {
            var row = out[i];
            for (var j = 1; j < w-1; j++) {
                for (var p = -1; p <= 1; p++) {
                    buf += prevRow[j+p];
                }
                for (var p = -1; p <= 1; p++) {
                    buf += currentRow[j+p];
                }
                for (var p = -1; p <= 1; p++) {
                    buf += nextRow[j+p];
                }
                row[j] = buf / 9;
                buf = 0;
            }
            prevRow = currentRow;
            currentRow = nextRow;
            nextRow = image[i+2];
        }
        return out;
    }

    function detectCorners(image, kernelSize, kp, minH) {

        //array of corner coordinates for delauney triangulation
        var cornerLocations = [];

        var w = image[0].length,
            h = image.length;
        kernelSize = kernelSize>0 ? kernelSize : 7;
        kp = kp>0 ? kp : 0.0008;
        minH = minH>0 ? minH : 10000;
        
        var dx = Sobel(image, 1, 0), 
            dy = Sobel(image, 0, 1);
        
        var dxdx = blur(multiple(dx, dx)),
            dydy = blur(multiple(dy, dy)),
            dxdy = blur(multiple(dx, dy));
        
        var H = zeros(w, h);
        for (var i = 0; i < h; i++) {
            var xxRow = dxdx[i],
                yyRow = dydy[i],
                xyRow = dxdy[i];
            var row = H[i];
            for (var j = 0; j < w; j++) {
                var xx = xxRow[j],
                    yy = yyRow[j],
                    xy = xyRow[j],
                    trace = xx + yy;
                row[j] = xx*yy - xy*xy - kp*trace*trace;
            }
        }
        H = threshold(H, minH, 255, "toZero");
                    
        // non-maximum suppression 
        var out = zeros(w, h);
        var k = Math.floor(kernelSize/2);
        for (var i = k; i < h-k; i++) {
            for (var j = k; j < w-k; j++) {
                var v = H[i][j];
                if (v <= 0) continue;
                var flag = true;
                for (var p = -k; p <= k && flag; p++) {
                    var y = i+p;
                    // if (y < 0 || y >= h) continue;
                    for (var q = -k; q <= k; q++) {
                        if (q === 0 && p === 0) continue;
                        var x = j+q;
                        // if (x < 0 || x >= w) continue;
                        if (v <= H[y][x]) {
                            flag = false;
                            break;
                        }
                    }
                }
                if (flag) {

                    //push coordinate of corner to array
                    // (y, x) coordinates
                    cornerLocations.push([j, i]);

                    // local maximum
                    out[i][j] = 255;                  
                }
            }
        }
        
        //add corners to background
        cornerLocations.push([0,0], [w, 0], [w, h], [0, h]);

        //draw triangle on image
        var canvas = document.getElementById("canvas"),
            ctx = canvas.getContext("2d");
            vertices = cornerLocations,
            i, x, y;

        var triangles = Delaunay.triangulate(vertices);
                console.timeEnd("triangulate");
                for(i = triangles.length; i; ) {
                ctx.beginPath();
                --i; ctx.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
                var p1 = vertices[triangles[i]];
                --i; ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
                var p2 = vertices[triangles[i]];
                --i; ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
                var p3 = vertices[triangles[i]];
                ctx.closePath();

                //find center of triangle
                var centerX = Math.floor((p1[0] + p2[0] + p3[0]) / 3);
                var centerY = Math.floor((p1[1] + p2[1] + p3[1]) / 3);

                //find rgba value of original color image at centroid coordinates
                var pixel = c.getImageData(centerX, centerY, 1, 1).data,
                    red = pixel[0],
                    blue = pixel[1],
                    green = pixel[2],
                    alpha = pixel[3];

                //fill in triangles using rgb value of centroid
                ctx.fillStyle = 'rgba(' + red + ', ' + blue + ', ' + green + ', ' + alpha + ')';
                ctx.fill();

                //make lines transparent
                if ($scope.showVertices !== true) {
                    ctx.strokeStyle = 'rgba(' + red + ', ' + blue + ', ' + green + ', ' + alpha + ')';
                } else {
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
                }
                
                ctx.stroke();
                }
                    
        return out;
    }
    //hide loading spinner and display low-poly canvas
    $scope.loadingImage = false;
    $scope.$apply();
}

export {
    main
}