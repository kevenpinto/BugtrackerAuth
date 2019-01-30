import auth0 from "auth0-js";
const m = require('mithril')

const myauth0  = new auth0.WebAuth({
    domain: 'bugtrackerkev.eu.auth0.com',
    clientID: 'HmiIOhgX43s12dqxioorpmQ6OxKpg10N',
    redirectUri: 'http://localhost:8640/#!/issues',
    responseType: 'token id_token',
    scope: 'openid profile email'
    })

class IssuesModel {
  constructor() {
    this.issues = {}
  }
  async loadIssues() {
    let response = await m.request('/issues')
    this.issues = {}
    for (let issue of response.issues) {
      this.issues[issue.id] = issue
    }
    return this.issues
  }
  get list() {
    return Object.keys(this.issues).map(i => this.issues[i])
  }
  async loadIssue(issueId) {
    let response = await m.request(`/issues/${issueId}`)
    this.issues[issueId] = response
    return response
  }
  async updateIssue(issueId, fields) {
    await m.request({
      method: "PUT",
      url: `/issues/${issueId}`,
      data: fields
    })
    return await this.loadIssue(issueId)
  }
  async createIssue(fields) {
    await m.request({
      method: "POST",
      url: `/issues`,
      data: fields
    })
    return await this.loadIssues()
  }
}

class DashboardModel {
  constructor() {
    this.dashlist = {}
  }

  async loadDash() {
    let response = await m.request('/Dashboard')
    this.dashlist = {}
    var i
    for (i=0; i<response.dashlist.length; i++) {
        //console.log(response.dashlist[i])
        this.dashlist[i] = response.dashlist[i]
        }
     console.log(this.dashlist)
     //alert(this.dashlist)
     return this.dashlist
  }

  get list() {
    return Object.keys(this.dashlist).map(i => this.dashlist[i])
  }
}

class AuthModel {
    constructor()
    {
      this.clsauth =   myauth0
    }

      login() {
       console.log('In Login Method')
        this.clsauth.authorize()
      }

    handleAuthentication() {
    console.log('In handle Authentication')
    this.clsauth.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        m.route.set("/issues");
      } else if (err) {
        m.route.set("/Auth");
        console.log(err);
      }
    })
  }

  setSession(authResult) {
    console.log('In Set Session')
    // Set the time that the Access Token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )
    localStorage.setItem("access_token", authResult.accessToken)
    localStorage.setItem("id_token", authResult.idToken)
    localStorage.setItem("expires_at", expiresAt)
    // navigate to the home route
    m.route.set("/issues")
  }

  logout() {
    console.log('In Logout')
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    // navigate to the default route
    m.route.set("/Auth");
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    console.log('In Authenticated...')
    let expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return new Date().getTime() < expiresAt;
  }
}


module.exports = {IssuesModel, DashboardModel, AuthModel}
