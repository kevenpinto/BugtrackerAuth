Bugs Fixed
1) User can now add an apostrophe in the Bug Title and Description
2) User Can now Close an issue -- New Checkbox added at Creation (retrospective bug logging) and Edit
3) Edit Screen now persists any Changes to the Description
4) Dates are now displayed in the Users Timezone
5) Added an About Page
6) Register Page has Email Check -- On Success the data is stored in the database and no more (See unable to deliver below)
7) Dashboard Page created that returns Bug Stats
8) Useful Rest Messages -- (try http://localhost:8640/eskimo)
9) Authentication and Authorisation now done Using Auth0

Unable to Complete
1) Ability to assign bugs to users, and for bugs to have creators

Known Issue
The first time one logins -- Auth0 components asks the user to login again ... I will fix this when i get some time but for now pls make do


Installation
Kindly use the new Package .json as it contains the "auth0-js": "^9.10.0" component in there
Kindly replace the Python Files in your Virtual Environment with these -- i have not used any new packages 
Kindly Replace the JS files with these files
Kindly replace the database with this one as i have seeded it with some back dated bugs to generate dashboard stats
