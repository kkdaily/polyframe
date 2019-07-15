import React from 'react';
import {
  Container, Image, Segment, Header, Button,
} from 'semantic-ui-react';

const EditorImageViewer = (props) => {
  const {
    loading, imageSrc, showPreviewImage, canvasHeight, canvasWidth, addImage,
  } = props;

  return (
    <Container className="EditorImageViewer">
      { imageSrc.length
        ? (
          <Segment loading={loading} id="imagePreview" className="padding collapsed">
            { showPreviewImage
              ? <Image src={imageSrc} centered />
              : <canvas id="userImageCanvas" height={canvasHeight} width={canvasWidth} />
            }
          </Segment>
        )
        : (
          <Segment id="zeroState" placeholder>
            <Image id="placeholder" src="/images/image-placeholder.svg" size="small" centered />
            <Header as="h3">
              Add an image to get started
            </Header>
            <Button onClick={addImage} primary>Add Image</Button>
          </Segment>
        )
      }
    </Container>
  );
};

export default EditorImageViewer;
