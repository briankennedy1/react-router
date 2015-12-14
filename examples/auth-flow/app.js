import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, History } from 'react-router';
import { createHistory, useBasename } from 'history';
import auth from './auth';

const history = useBasename(createHistory)({
  basename: '/auth-flow',
});

const App = React.createClass({
  getInitialState() {
    return {
      loggedIn: auth.loggedIn(),
    };
  },

  updateAuth(loggedIn) {
    this.setState({
      loggedIn: loggedIn,
    });
  },

  componentWillMount() {
    auth.onChange = this.updateAuth;
    auth.login();
  },

  render() {
    return (
      <div>
        <ul>
          <li>
            {this.state.loggedIn ? (
              <Link to="/logout">Log out</Link>
            ) : (
              <Link to="/login">Sign in</Link>
            )}
          </li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/dashboard">Dashboard</Link> (authenticated)</li>
        </ul>
        {this.props.children}
      </div>
    );
  },
});

const Dashboard = React.createClass({
  getInitialState() {
    return {
      everything: auth.getEverything(),
    };
  },

  TripleHandler() {
    console.log(`Testing token state: ${this.state.everything.token}`);
    $.ajax({
      method: 'GET',
      url: 'http://localhost:3000/v1/players/bondb001/batting/triples',
      headers: {
        'access-token': this.state.everything.token,
        client: this.state.everything.client,
        expiry: this.state.everything.expiry,
        uid: this.state.everything.uid,
        'token-type': 'Bearer',
      },
    }).done((data, textStatus, res) => {
      this.setState({everything: {
        token: res.getResponseHeader('access-token'),
        client: res.getResponseHeader('client'),
        expiry: res.getResponseHeader('expiry'),
        uid: res.getResponseHeader('uid'),
      }, });
    }).fail(() => {
      console.log('fail');
    });
  },

  DoubleHandler() {
    console.log(`Testing token state: ${this.state.everything.token}`);
    $.ajax({
      method: 'GET',
      url: 'http://localhost:3000/v1/players/bondb001/batting/doubles',
      headers: {
        'access-token': this.state.everything.token,
        client: this.state.everything.client,
        expiry: this.state.everything.expiry,
        uid: this.state.everything.uid,
        'token-type': 'Bearer',
      },
    }).done((data, textStatus, res) => {
      this.setState({everything: {
        token: res.getResponseHeader('access-token'),
        client: res.getResponseHeader('client'),
        expiry: res.getResponseHeader('expiry'),
        uid: res.getResponseHeader('uid'),
      }, });
    }).fail(() => {
      console.log('fail');
    });
  },

  render() {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>You made it!</p>
        <button onClick={this.TripleHandler}>Triples</button>
        <button onClick={this.DoubleHandler}>Doubles</button>
        <p>Token: {this.state.everything.token}</p>
        <p>Client: {this.state.everything.client}</p>
        <p>Expiry: {this.state.everything.expiry}</p>
        <p>UID: {this.state.everything.uid}</p>
      </div>
    );
  },
});

const Login = React.createClass({
  mixins: [History],

  getInitialState() {
    return {
      error: false,
    };
  },

  handleSubmit(event) {
    event.preventDefault();

    const email = this.refs.email.value;
    const pass = this.refs.pass.value;

    auth.login(email, pass, (loggedIn) => {
      if (!loggedIn)
        return this.setState({ error: true });

      const { location } = this.props;

      if (location.state && location.state.nextPathname) {
        this.history.replaceState(null, location.state.nextPathname);
      } else {
        this.history.replaceState(null, '/');
      }
    });
  },

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label><input ref="email" placeholder="email" defaultValue="bk3@bk3.com" /></label>
        <label><input ref="pass" placeholder="password" /></label> (hint: password1)<br />
        <button type="submit">login</button>
        {this.state.error && (
          <p>Bad login information</p>
        )}
      </form>
    );
  },
});

const About = React.createClass({
  render() {
    return (
      <div>
        <h1>About</h1>
        <p>Aboooooot it baby.</p>
      </div>
    );
  },
});

const Logout = React.createClass({
  componentDidMount() {
    auth.logout();
  },

  render() {
    return <p>You are now logged out</p>;
  },
});

function requireAuth(nextState, replaceState) {
  if (!auth.loggedIn())
    replaceState({ nextPathname: nextState.location.pathname }, '/login');
}

render((
  <Router history={history}>
    <Route path="/" component={App}>
      <Route path="login" component={Login} />
      <Route path="logout" component={Logout} />
      <Route path="about" component={About} />
      <Route path="dashboard" component={Dashboard} onEnter={requireAuth} />
    </Route>
  </Router>
), document.getElementById('example'));
