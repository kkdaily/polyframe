import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Home from './components/pages/Home/Home';
import Editor from './components/pages/Editor/Editor';

function App() {
  return (
    <Router>
      <div className="App">
        <Route path="/" exact component={Home} />
        <Route path="/editor/" exact component={Editor} />
      </div>
    </Router>
  );
}

export default App;
