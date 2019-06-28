import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Editor from './components/pages/Editor';

function App() {
  return (
    <Router>
      <div className="App">
        <Route path="/" exact component={Home} />
        <Route path="/editor/" component={Editor} />
      </div>
    </Router>
  );
}

export default App;
