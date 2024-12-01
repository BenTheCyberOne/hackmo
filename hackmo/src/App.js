import logo from './logo.svg';
import './App.css';
import UserDashboard from './components/UserDashboard';
import Register from './components/Register'; // Assuming you have a Register component
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={UserDashboard} />
        {/* Other routes can go here */}
      </Switch>
    </Router>
  );
};

export default App;
