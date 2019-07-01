import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Grid, Image, Button, Header,
} from 'semantic-ui-react';
import './styles.css';

function Home() {
  return (
    <Container textAlign="center">
      <Grid doubling relaxed stackable verticalAlign="middle" style={{ height: '100vh' }}>
        <Grid.Row>
          <Grid.Column>
            <Header as="h1" className="title">Polyframe</Header>
            <Header as="h3" className="subtitle margin collapsed">Quick and easy low-polygon art</Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row centered>
          <Grid.Column width={7}>
            <Image alt="Fall leaves before converting to low-poly" src="images/leaves-original.jpg" rounded />
          </Grid.Column>
          <Grid.Column width={7}>
            <Image alt="Fall leaves after converting to low-poly" src="images/leaves-poly.png" rounded />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Link to="/editor/">
              <Button className="primary" circular size="huge">Create Now</Button>
            </Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default Home;
