var app = angular.module('app');

app.controller('EditorCtrl', function($scope) {

    //display empty image frame and hide spinner initially
    $scope.preview = false;
    $scope.noImage = true;
    $scope.loadingImage = false;
    $scope.canvasHeight = '';
    $scope.canvasWidth = '';
    $scope.userImg = '';

    //spinner options
    var opts = {
      lines: 13 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 14 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 0.5 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'relative' // Element positioning
    }

    //create spinner object
    var target = document.getElementById('spinner');
    var spinner = new Spinner(opts).spin(target);

    //set 'polygon density' slider value to 20
    $scope.polygonSize = 20;
    //set 'display lines' checkbox as checked
    $scope.showVertices = true;

    //detect when user uploads image to file input
    var _URL = window.URL || window.webkitURL;
    angular.element("#userImg").change(function (e) {
        var file, img;
        if ((file = this.files[0])) {
            //create preview of image uploaded in frame
            img = new Image();
            img.onload = function () {
                $scope.canvasHeight = this.height;
                $scope.canvasWidth = this.width;
                document.getElementById("previewImage").src = img.src;
                $scope.previewImage = true;
                $scope.$apply();
            };
            img.src = _URL.createObjectURL(file);
        }
    });

    /* convert image to low-poly when 'Polygon it' button is clicked
    using delaunay triangulation and harris corner detection */
    $scope.polyframe = function() {

        //display loading spinner while creating low-poly canvas
        $scope.noImage = false;
        $scope.loadingImage = true;
        $scope.previewImage = false;

        //clear previous canvas image
        var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /*  
            Delaunay Triangulation 
            https://github.com/ironwallaby/delaunay 
        */
        var Delaunay;

        (function() {
            "use strict";

            var EPSILON = 1.0 / 1048576.0;

            function supertriangle(vertices) {
            var xmin = Number.POSITIVE_INFINITY,
                ymin = Number.POSITIVE_INFINITY,
                xmax = Number.NEGATIVE_INFINITY,
                ymax = Number.NEGATIVE_INFINITY,
                i, dx, dy, dmax, xmid, ymid;

            for(i = vertices.length; i--; ) {
              if(vertices[i][0] < xmin) xmin = vertices[i][0];
              if(vertices[i][0] > xmax) xmax = vertices[i][0];
              if(vertices[i][1] < ymin) ymin = vertices[i][1];
              if(vertices[i][1] > ymax) ymax = vertices[i][1];
            }

            dx = xmax - xmin;
            dy = ymax - ymin;
            dmax = Math.max(dx, dy);
            xmid = xmin + dx * 0.5;
            ymid = ymin + dy * 0.5;

            return [
              [xmid - 20 * dmax, ymid -      dmax],
              [xmid            , ymid + 20 * dmax],
              [xmid + 20 * dmax, ymid -      dmax]
            ];
          }

          function circumcircle(vertices, i, j, k) {
            var x1 = vertices[i][0],
                y1 = vertices[i][1],
                x2 = vertices[j][0],
                y2 = vertices[j][1],
                x3 = vertices[k][0],
                y3 = vertices[k][1],
                fabsy1y2 = Math.abs(y1 - y2),
                fabsy2y3 = Math.abs(y2 - y3),
                xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

            /* Check for coincident points */
            if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
              throw new Error("Eek! Coincident points!");

            if(fabsy1y2 < EPSILON) {
              m2  = -((x3 - x2) / (y3 - y2));
              mx2 = (x2 + x3) / 2.0;
              my2 = (y2 + y3) / 2.0;
              xc  = (x2 + x1) / 2.0;
              yc  = m2 * (xc - mx2) + my2;
            }

            else if(fabsy2y3 < EPSILON) {
              m1  = -((x2 - x1) / (y2 - y1));
              mx1 = (x1 + x2) / 2.0;
              my1 = (y1 + y2) / 2.0;
              xc  = (x3 + x2) / 2.0;
              yc  = m1 * (xc - mx1) + my1;
            }

            else {
              m1  = -((x2 - x1) / (y2 - y1));
              m2  = -((x3 - x2) / (y3 - y2));
              mx1 = (x1 + x2) / 2.0;
              mx2 = (x2 + x3) / 2.0;
              my1 = (y1 + y2) / 2.0;
              my2 = (y2 + y3) / 2.0;
              xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
              yc  = (fabsy1y2 > fabsy2y3) ?
                m1 * (xc - mx1) + my1 :
                m2 * (xc - mx2) + my2;
            }

            dx = x2 - xc;
            dy = y2 - yc;
            return {i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy};
          }

          function dedup(edges) {
            var i, j, a, b, m, n;

            for(j = edges.length; j; ) {
              b = edges[--j];
              a = edges[--j];

              for(i = j; i; ) {
                n = edges[--i];
                m = edges[--i];

                if((a === m && b === n) || (a === n && b === m)) {
                  edges.splice(j, 2);
                  edges.splice(i, 2);
                  break;
                }
              }
            }
          }

          Delaunay = {
            triangulate: function(vertices, key) {
              var n = vertices.length,
                  i, j, indices, st, open, closed, edges, dx, dy, a, b, c;

              /* Bail if there aren't enough vertices to form any triangles. */
              if(n < 3)
                return [];

              /* Slice out the actual vertices from the passed objects. (Duplicate the
               * array even if we don't, though, since we need to make a supertriangle
               * later on!) */
              vertices = vertices.slice(0);

              if(key)
                for(i = n; i--; )
                  vertices[i] = vertices[i][key];

              /* Make an array of indices into the vertex array, sorted by the
               * vertices' x-position. */
              indices = new Array(n);

              for(i = n; i--; )
                indices[i] = i;

              indices.sort(function(i, j) {
                return vertices[j][0] - vertices[i][0];
              });

              /* Next, find the vertices of the supertriangle (which contains all other
               * triangles), and append them onto the end of a (copy of) the vertex
               * array. */
              st = supertriangle(vertices);
              vertices.push(st[0], st[1], st[2]);
              
              /* Initialize the open list (containing the supertriangle and nothing
               * else) and the closed list (which is empty since we havn't processed
               * any triangles yet). */
              open   = [circumcircle(vertices, n + 0, n + 1, n + 2)];
              closed = [];
              edges  = [];

              /* Incrementally add each vertex to the mesh. */
              for(i = indices.length; i--; edges.length = 0) {
                c = indices[i];

                /* For each open triangle, check to see if the current point is
                 * inside it's circumcircle. If it is, remove the triangle and add
                 * it's edges to an edge list. */
                for(j = open.length; j--; ) {
                  /* If this point is to the right of this triangle's circumcircle,
                   * then this triangle should never get checked again. Remove it
                   * from the open list, add it to the closed list, and skip. */
                  dx = vertices[c][0] - open[j].x;
                  if(dx > 0.0 && dx * dx > open[j].r) {
                    closed.push(open[j]);
                    open.splice(j, 1);
                    continue;
                  }

                  /* If we're outside the circumcircle, skip this triangle. */
                  dy = vertices[c][1] - open[j].y;
                  if(dx * dx + dy * dy - open[j].r > EPSILON)
                    continue;

                  /* Remove the triangle and add it's edges to the edge list. */
                  edges.push(
                    open[j].i, open[j].j,
                    open[j].j, open[j].k,
                    open[j].k, open[j].i
                  );
                  open.splice(j, 1);
                }

                /* Remove any doubled edges. */
                dedup(edges);

                /* Add a new triangle for each edge. */
                for(j = edges.length; j; ) {
                  b = edges[--j];
                  a = edges[--j];
                  open.push(circumcircle(vertices, a, b, c));
                }
              }

              /* Copy any remaining open triangles to the closed list, and then
               * remove any triangles that share a vertex with the supertriangle,
               * building a list of triplets that represent triangles. */
              for(i = open.length; i--; )
                closed.push(open[i]);
              open.length = 0;

              for(i = closed.length; i--; )
                if(closed[i].i < n && closed[i].j < n && closed[i].k < n)
                  open.push(closed[i].i, closed[i].j, closed[i].k);

              /* Yay, we're done! */
              return open;
            },
            contains: function(tri, p) {
              /* Bounding box test first, for quick rejections. */
              if((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
                 (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
                 (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
                 (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1]))
                return null;

              var a = tri[1][0] - tri[0][0],
                  b = tri[2][0] - tri[0][0],
                  c = tri[1][1] - tri[0][1],
                  d = tri[2][1] - tri[0][1],
                  i = a * d - b * c;

              /* Degenerate tri. */
              if(i === 0.0)
                return null;

              var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
                  v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

              /* If we're outside the tri, fail. */
              if(u < 0.0 || v < 0.0 || (u + v) > 1.0)
                return null;

              return [u, v];
            }
          };

          if(typeof module !== "undefined")
            module.exports = Delaunay;
        })();


        /*
            harris corner detection 
            http://jsdo.it/imageData/hxMw 
        */  
        $(function() {

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

            /*
                Harris Corner Detection 
                http://jsdo.it/imageData/hxMw 
            */
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
        });

    
    }

})

    
