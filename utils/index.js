import cornerDetection from './cornerDetection.js';

export const polygonizeImage = (userImage, canvasEl, polygonSize, showVertices) => {
  const image = new Image();

  return new Promise((resolve) => {
    image.onload = () => resolve(cornerDetection(userImage, canvasEl, polygonSize, showVertices));
    image.src = userImage.src;
  });
};