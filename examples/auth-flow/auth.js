module.exports = {
  login(email, pass, cb) {
    cb = arguments[arguments.length - 1];
    if (localStorage.token) {
      if (cb) cb(true);
      this.onChange(true);
      return;
    }

    apiRequest(email, pass, (res) => {
      if (res.authenticated) {
        localStorage.token = res.token;
        localStorage.client = res.client;
        localStorage.expiry = res.expiry;
        localStorage.uid = res.uid;
        if (cb) cb(true);
        this.onChange(true);
      } else {
        if (cb) cb(false);
        this.onChange(false);
      }
    });
  },

  getToken() {
    return localStorage.token;
  },

  getEverything() {
    return localStorage;
  },

  logout(cb) {
    delete localStorage.token;
    delete localStorage.client;
    delete localStorage.expiry;
    delete localStorage.uid;
    if (cb) cb();
    this.onChange(false);
  },

  loggedIn() {
    return !!localStorage.token;
  },

  onChange() {
  },

};

function apiRequest(email, pass, cb) {
  $.ajax({
    method: 'POST',
    url: 'http://localhost:3000/v1/auth/sign_in',
    data: { email: email, password: pass },
  }).done((data, textStatus, jqXHR) => {
    cb({
      authenticated: true,
      token: jqXHR.getResponseHeader('access-token'),
      client: jqXHR.getResponseHeader('client'),
      expiry: jqXHR.getResponseHeader('expiry'),
      uid: jqXHR.getResponseHeader('uid'),
      'token-type': 'bearer',
    });
  }).fail(() => {
    cb({ authenticated: false });
  });

}
