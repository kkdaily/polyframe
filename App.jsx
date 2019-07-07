import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/pages/Home';
import Editor from './components/pages/Editor';

function App() {
  return (
    <Router>
      <div className="App" style={{
        display: 'flex',
        flexFlow: 'wrap',
        alignItems: 'center',
        padding: '10px',
        height: '100vh'
      }}>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/editor" component={Editor} />
          <Route component={Home} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
