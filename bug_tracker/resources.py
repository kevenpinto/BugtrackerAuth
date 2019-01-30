from __future__ import absolute_import
import falcon
from falcon.http_error import HTTPError



def _issue_to_json(issue):
    print 'Issue to json {}'.format(issue.closed)
    print 'Issue to json {}'.format(issue.opened)
    closed = ''
    if issue.closed:
        closed = issue.closed.isoformat()
    return {
        'id': issue.id,
        'title': issue.title,
        'description': issue.description,
        'opened': issue.opened.isoformat() if issue.opened else None,
        'closed': closed,
    }

def _issue_dash_to_json(stat):
    return {'stat': stat[0]}


class IssuesResource(object):
    def __init__(self, repo):
        self._repo = repo

    def on_get(self, req, resp):
        # print("In Issue Resource")
        with self._repo.open() as repo:
            issue_list = repo.issues.list_issues()
            resp.media = {
                'issues': [_issue_to_json(issue) for issue in issue_list]
            }
            resp.status = falcon.HTTP_200

    def on_post(self, req, resp):
        with self._repo.open() as repo:
            print("In Create Issue")
            print(req.media)
            new_issue = req.media
            new_id = repo.issues.create_issue(
                new_issue['title'],
                new_issue['description'],
                closed=new_issue.get('closed', False)
            )
        raise falcon.HTTPSeeOther('/issues/{}'.format(new_id))


class IssueResource(object):
    def __init__(self, repo):
        self._repo = repo

    def on_get(self, req, resp, issue_id):
        with self._repo.open() as repo:
            issue = repo.issues.fetch_issue(int(issue_id))
            resp.media = _issue_to_json(issue)
            resp.status = falcon.HTTP_200

    def on_put(self, req, resp, issue_id):
        with self._repo.open() as repo:
            print("In Update Issue")
            print(req.media)
            update = req.media
            repo.issues.update_issue(issue_id, **update)
            resp.status = falcon.HTTP_204

class UserResource(object):
    def __init__(self,repo):
        self._repo = repo

    def on_post(self, req, resp):
        # print("On get of the User Resource")
        with self._repo.open() as repo:
            new_user = req.media
            repo.users.create_user(new_user['email'], new_user['passwd'])
            resp.status = falcon.HTTP_200
            #raise falcon.HTTPSeeOther('/issues')

class DashResource(object):
    def __init__(self, repo):
        self._repo = repo

    def on_get(self, req, resp):
        with self._repo.open() as repo:
            dash_list = repo.dash.dash_stats()
            for stat in dash_list:
                resp.media = {
                    'dashlist': [_issue_dash_to_json(stat) for stat in dash_list]
                        }
            resp.status = falcon.HTTP_200

class ErrorHandler(object):
    @staticmethod
    def http(ex, req, resp, params):
        resp.body ='{"message": "Bug Tracker !!! -- Server not aware of resource Requested"}'
        raise

    @staticmethod
    def unexpected(ex, req, resp, params):
        resp.body = '{"message": "Bug Tracker !!! -- Server Feels poorly at the mo"}'
        logger.exception('Bugtracker -- Unexpected Application Error')
        raise falcon.HTTPInternalServerError()
