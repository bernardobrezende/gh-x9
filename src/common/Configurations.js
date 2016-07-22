'use strict'

module.exports = (function() {

  const PORT = process.env.PORT || process.env.GH_X9_PORT || 3000
  const BASE_URL = process.env.GH_X9_URL || `http://localhost:${PORT}`

  return {
    server: {
      base_url: BASE_URL,
      port: PORT
    },
    github: {
      url_auth: 'https://github.com/login/oauth/authorize',
      client_id: process.env.GH_X9_CLIENT_ID,
      client_secret: process.env.GH_X9_CLIENT_SECRET,
      redirect_uri: {
        relative: '/auth/github/callback',
        full: `${BASE_URL}/auth/github/callback`
      },
      scope: [],
      state: process.env.GH_X9_STATE
    }
  }
})()
