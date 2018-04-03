import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Home, About, Activities, User } from './containers';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/:userName" component={User} />
    <Route exact path="/activities/:username" component={Activities} />
  </Switch>
);

export default Routes;
