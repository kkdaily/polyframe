import cornerDetection from './cornerDetection';

const polygonizeImage = (userImage, canvasEl, polygonSize, showVertices) => {
  const image = new Image();

  return new Promise((resolve) => {
    image.onload = () => resolve(cornerDetection(userImage, canvasEl, polygonSize, showVertices));
    image.src = userImage.src;
  });
};

export default polygonizeImage;
