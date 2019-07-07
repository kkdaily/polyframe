import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Grid, Image, Button, Header,
} from 'semantic-ui-react';

function Home() {
  return (
    <Container className="Home" textAlign="center">
      <Grid relaxed stackable>
        <Grid.Row>
          <Grid.Column>
            <Header as="h1" className="title">Polyframe</Header>
            <Header as="h3" className="subtitle margin collapsed">Quick and easy low-polygon art</Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row centered>
          <Image alt="Fall leaves before converting to low-poly" size="large" src="images/leaves-original.jpg" rounded />
          <Image alt="Fall leaves after converting to low-poly" size="large" src="images/leaves-poly.png" rounded />
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Link to="/editor/">
              <Button className="primary" size="big">Create Now</Button>
            </Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default Home;
