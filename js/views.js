const m = require('mithril')

class IssuesList {
  constructor(vnode) {
    this.model = vnode.attrs.model
  }
  oninit() {
    this.model.loadIssues()
  }
  view() {
    return m('table.table', [
      m('thead', [
        m('th', 'title'),
        m('th', 'opened'),
        m('th', 'closed')
      ]),
      m('tbody', [
        this.model.list.map(item =>
          m('tr', [
            m('td.title-cell', m("a", {href: `/issues/${item.id}`, oncreate: m.route.link}, item.title)),
            m('td.opened-cell', new Date(item.opened).toLocaleString()),
            m('td.closed-cell', ((item.closed) ? new Date(item.closed).toLocaleString() : item.closed))
          ])
        )
      ])
    ])
  }
}

class ViewIssue {
  constructor(vnode) {
    this.model = vnode.attrs.model
    this.issueId = vnode.attrs.issueId
  }
  oninit() {
    this.model.loadIssue(this.issueId)
  }
  view() {
    let detail = this.model.issues[this.issueId]
    return detail
    ? m('div',[
        m('.row', [
          m('h1.col-sm-11', detail.title),
          m('.col-sm-1',
            m(
              'a.btn.btn-primary',
              {href: `/issues/${this.issueId}/edit`, oncreate: m.route.link},
              'Edit'
            )
          )
        ]),
        m('dl.row', [
          m('dt.col-sm-3', 'Opened'),
          m('dd.col-sm-3', new Date(detail.opened).toLocaleString()),
          m('dt.col-sm-3', 'Closed'),
          m('dd.col-sm-3', ((detail.closed) ? new Date(detail.closed).toLocaleString() : detail.closed)),
        ]),
        m('h2', 'Description'),
        m('p.description', detail.description)
      ]
    )
    : m('.alert.alert-info', 'Loading')
  }
}

class EditIssue {
  constructor(vnode) {
    this.model = vnode.attrs.model
    this.issueId = vnode.attrs.issueId
    this.closed = vnode.attrs.closed
  }
  async oninit() {
    await this.model.loadIssue(this.issueId)
  }
  view() {
    let issue = this.model.issues[this.issueId]
    return issue
    ? m(IssueEditor, {
      title: issue.title,
      descriptionText: issue.description,
      closed: issue.closed,
      onSubmit: async (fields) => {
        await this.model.updateIssue(this.issueId, fields)
        m.route.set(`/issues/${this.issueId}`)
        m.redraw()
      }
    })
    :m('.alert.alert-info', 'Loading')
  }
}

class CreateIssue {
  constructor(vnode) {
    this.model = vnode.attrs.model
  }
  view() {
    return m(IssueEditor, {
      title: '',
      descriptionText: '',
      closed: '',
      onSubmit: async ({descriptionText, title, closed}) => {
        await this.model.createIssue({description: descriptionText, title: title, closed:closed})
        m.route.set(`/issues`)
        m.redraw()
      }
    })
  }
}

class IssueEditor {
  constructor(vnode) {
    this.title = vnode.attrs.title
    this.descriptionText = vnode.attrs.descriptionText
    this.closed = vnode.attrs.closed
    //alert(vnode.attrs.closed)
    if (vnode.attrs.closed){
      this.closed = true
    } else {
      this.closed = false
    }
    this.onSubmit = vnode.attrs.onSubmit
  }
  view() {
    return m('form', {onsubmit: e => this.onSubmit({title: this.title, descriptionText: this.descriptionText ,closed: this.closed})}, [
      m('.form-group', [
        m('label', {'for': 'title-input'}, 'Issue Title'),
        m('input.form-control#title-input', {value: this.title, oninput: (e) => {this.title = e.target.value}})
      ]),
      m('.form-group', [
        m('label', {'for': 'description-input'}, 'Description'),
        m('textarea.form-control#description-input', {oninput: (e) => {this.descriptionText = e.target.value}}, this.descriptionText)
      ]),
      m('.form-group', [
        m('label', {'for': 'close-input'}, 'Close Issue'),
        m('input.input#close-input[type=checkbox]', {onclick: (e) => {
            this.closed = false;
            console.log(e.target.checked);
            if (e.target.checked){
                this.closed = true;
            }
            },checked :this.closed})
      ]),
      m('button.btn.btn-primary#save-button', {type: 'submit'}, 'Save')
    ])
  }
}


const ToolbarContainer = {
  view(vnode) {
    return m('div', [
      m('nav.navbar.navbar-expand-lg.navbar-light.bg-light', [
        m('svg',{height:80,width:80}, [
                    m("image[xlink:href='https://airelogic.com/wp-content/uploads/2016/07/cog64x64.gif']")
          ]),
        m('a.navbar-brand', {href: '/issues', oncreate: m.route.link}, 'Bug Tracker'),
        m('.collapse.navbar-collapse', [
          m('ul.navbar-nav', [
            m('li.nav-item', [
              m('a.nav-link', {href: '/issues/create', oncreate: m.route.link}, 'Create')
            ]),
            m('li.nav-item', [
              m('a.nav-link', {href: '/Dashboard', oncreate: m.route.link}, 'Dashboard')
            ]),
            m('li.nav-item', [
              m('a.nav-link', {href: '/About', oncreate: m.route.link}, 'About')
            ]),
            m('li.nav-item', [
              m('a.nav-link', {href: '/Logout', oncreate: m.route.link}, 'Logout')
            ])
          ])
        ])
      ]),
      m('.container', vnode.children)
    ])
  }
}

class AboutPage{
  constructor(vnode) {
    this.model = vnode.attrs.model
  }

  view(vnode) {
    return  m('div',[
                m('svg', [
                    m("image[xlink:href='https://airelogic.com/wp-content/uploads/2017/07/aire-logic-300x94.png']")
                ]),
                m('p',{class:"text-xl-left"},'Bug Tracker'),
                m('i', '............................Powered by Mithril and Python')
            ])
  }
}


class DashboardList {
  constructor(vnode) {
    this.model = vnode.attrs.model
  }

  oninit() {
    this.model.loadDash()
  }
  view() {
    return m('div', 'Bug Tracker Dashboard',[
               m('ul',{class: "list-group"}, [
                this.model.list.map(myitem =>
            m('li', {class: "list-group-item"}, myitem.stat.substring(2))
        ),
        ])
      ])
  }
}


class HomeView
{
constructor(vnode) {
    this.model = vnode.attrs.model
  }

view(vnode) {
    return m('div',[
           m('h1.app-title','Bugtracker'),
           m('h2.app-greeting','Welcome')
          // ,m('a', {href:'', onclick: this.model.login()}, 'Login')
          ,m('button.btn.btn-primary#Login-button',{
                            onclick:this.model.login()
                            }, 'Login')
          ])
}
}

class LogoutView
{
constructor(vnode) {
    this.model = vnode.attrs.model
  }

view(vnode) {
    this.model.logout()
    return m('div',[
           m('h1.app-title','Bug Tracker !!!!'),
           m('h2.app-greeting','Goodbye')
          ])
  }

onremove() {
    this.model.logout()
    }
}

module.exports = {IssuesList, ViewIssue, EditIssue, CreateIssue, IssueEditor, ToolbarContainer,AboutPage,DashboardList,HomeView,LogoutView}
