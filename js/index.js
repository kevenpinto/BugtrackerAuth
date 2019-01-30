require('babel-polyfill')
const m = require('mithril')
const {IssuesList, ViewIssue, CreateIssue, EditIssue, ToolbarContainer, AboutPage, DashboardList, HomeView,LogoutView} = require('./views')
const {IssuesModel,DashboardModel, AuthModel} = require('./viewmodels')

const issuesModel = new IssuesModel()
const dashboardModel = new DashboardModel()
const auth = new AuthModel()


auth.handleAuthentication()
// Route Guards
m.route(document.body, '/Auth', {
  '/Auth': {
    render(vnode) {
        return m(
        ToolbarContainer,
        (auth.isAuthenticated())
        ? m.route.set("/issues")
        : m(HomeView, {model: auth}))
    }
  },
  '/Logout': {
    render(vnode) {
      return m(ToolbarContainer, m(LogoutView, {model: auth}))
    }
  },
  '/issues': {
    render(vnode) {
    return m(
        ToolbarContainer,
        (auth.isAuthenticated())
        ? m(IssuesList, {model: issuesModel})
        : m.route.set("/Auth"))
   }
  },
  '/issues/create': {
    render(vnode) {
      return m(ToolbarContainer,
       (auth.isAuthenticated())
       ? m(CreateIssue, {model: issuesModel})
       : m.route.set("/Auth"))
    }
  },
  '/issues/:issueId': {
    render(vnode) {
      return m(
        ToolbarContainer,
        (vnode.attrs.issueId === 'new')
        ? m(CreateIssue, {model: issuesModel})
        : m(ViewIssue, {model: issuesModel, issueId: vnode.attrs.issueId}))
    }
  },
  '/issues/:issueId/edit': {
    render(vnode) {
      return m(ToolbarContainer,
      (auth.isAuthenticated())
      ?m(EditIssue, {model: issuesModel, issueId: vnode.attrs.issueId})
      : m.route.set("/Auth"))
    }
  },
  '/About': {
    render(vnode) {
      return m(ToolbarContainer, m(AboutPage))
    }
  },
  '/Dashboard': {
    render(vnode) {
      return m(ToolbarContainer,
      (auth.isAuthenticated())
      ?m(DashboardList, {model: dashboardModel})
      :m.route.set("/Auth"))
   }
  }
})
