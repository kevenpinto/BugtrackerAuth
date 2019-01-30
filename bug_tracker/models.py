from __future__ import absolute_import
from datetime import datetime
import dateutil.parser
import sqlite3
from collections import namedtuple

from .migrate_database import do_migrations


class Repository(object):
    def __init__(self, database_location):
        self._database_location = database_location

    def open(self):
        return RepositoryConnection(sqlite3.connect(self._database_location))

    def migrate_database(self):
        with sqlite3.connect(self._database_location) as conn:
            cursor = conn.cursor()
            try:
                do_migrations(cursor)
            finally:
                cursor.close()


class RepositoryConnection(object):
    def __init__(self, conn):
        self._conn = conn
        self.issues = IssueRepository(self._conn)
        self.users = UserRepository(self._conn)
        self.dash = DashRepository(self._conn)

    def __enter__(self):
        return self

    def __exit__(self, exc, type_, tb):
        try:
            self._conn.__exit__(exc, type_, tb)
        finally:
            self._conn.close()

    def close(self):
        self._conn.close()

Issue = namedtuple('Issue', ['id', 'title', 'description', 'opened', 'closed'])

def make_issue(row):
    id_, title, description, opened, closed = row
    if opened:
        opened = dateutil.parser.parse(opened)
    if closed:
        closed = dateutil.parser.parse(closed)
    return Issue(id_, title, description, opened, closed)


class IssueRepository(object):
    def __init__(self, conn):
        self._conn = conn

    def list_issues(self):
        cursor = self._conn.cursor()
        try:
            cursor.execute(
                """SELECT
                    id,
                    title,
                    description,
                    opened_datetime,
                    closed_datetime
                    FROM issues
                    ORDER BY id""")
            return [make_issue(row) for row in cursor.fetchall()]
        finally:
            cursor.close()

    def fetch_issue(self, issue_id):
        cursor = self._conn.cursor()
        try:
            cursor.execute(
                """SELECT
                    id,
                    title,
                    description,
                    opened_datetime,
                    closed_datetime
                    FROM issues
                    WHERE id = {}""".format(issue_id))
            return make_issue(cursor.fetchone())
        finally:
            cursor.close()

    def create_issue(self, title, description,closed):
        closedDate = datetime.now() if closed else None
        cursor = self._conn.cursor()
        try:
            cursor.execute(
                """INSERT INTO issues(
                    title,
                    description,
                    closed_datetime
                ) VALUES(?,?,?);""",(title, description,closedDate))
            cursor.execute("select last_insert_rowid()")
            return cursor.fetchone()[0]
        finally:
            cursor.close()

    def update_issue(self, issue_id, **kwargs):
        print("Issue Id:",issue_id)
        print(kwargs)
        cursor = self._conn.cursor()
        try:
            if 'title' in kwargs:
                cursor.execute(
                    """UPDATE issues SET title = ? WHERE id = ?;""", (kwargs['title'], issue_id)
                     )
            if 'descriptionText' in kwargs:
                cursor.execute(
                    """UPDATE issues SET description = ? WHERE id = ?;""",(kwargs['descriptionText'], issue_id)
                )
            if 'closed' in kwargs:
                print 'updating closed date .......'
                print kwargs.get('closed')
                cursor.execute(
                     """UPDATE issues SET closed_datetime = ? WHERE id = ?"""
                         ,(datetime.now() if kwargs.get('closed') else None , issue_id)
                )

        finally:
            cursor.close()



class UserRepository(object):
    def __init__(self, conn):
        self._conn = conn

    def create_user(self, email, passwd):
        cursor = self._conn.cursor()
        try:
            cursor.execute(
                """INSERT INTO USERS(
                    email,
                    passwd
                ) VALUES(?,?);""", (email, passwd))
        finally:
            cursor.close()



class DashRepository(object):
    def __init__(self, conn):
        self._conn = conn

    def test(self):
        print("Hello from Dash Repository")

    def dash_stats(self):
        cursor = self._conn.cursor()
        sql_stmnt = """
         SELECT  '1-Total Open Issues = '||COUNT(*)
         FROM    issues
         WHERE   closed_datetime is NULL
         UNION
         SELECT  '2-Total Closed Issues = '||COUNT(*)
         FROM    issues
         WHERE   closed_datetime is NOT NULL
         UNION
         SELECT  '3-Bugs Opened this Week = '||COUNT(*)
         FROM    issues
         WHERE   date(opened_datetime) >= DATE('now','weekday 0','-7 days')
         UNION
         SELECT  '4-Bugs Closed this Week = ' || COUNT(*)
         FROM    issues
         WHERE   date(closed_datetime) >= DATE('now', 'weekday 0', '-7 days')
         UNION
         SELECT  '5-Bugs Opened in Last Week = '|| COUNT(*)
         FROM    issues
         WHERE   date(opened_datetime) >= DATE('now','weekday 0','-14 days') 
         AND     date(opened_datetime) <= DATE('now','weekday 0','-7 days')       
         UNION
         SELECT  '6-Bugs Closed in Last Week = '|| COUNT(*)
         FROM    issues
         WHERE   date(closed_datetime) >= DATE('now','weekday 0','-14 days') 
         AND     date(closed_datetime) <= DATE('now','weekday 0','-7 days')
        """
        try:
            cursor.execute(sql_stmnt)
            #return [make_dash(row) for row in cursor.fetchall()]
            return cursor.fetchall()
        finally:
            cursor.close()
