# DevPolls-Api

A graphql based api endpoint for DevPolls web app

It is set to auto-deploy to https://dashboard.heroku.com/apps/devpolls-api-qa

[![Node CI](https://github.com/devpolls/devpolls-api/actions/workflows/nodejs.yml/badge.svg)](https://github.com/devpolls/devpolls-api/actions/workflows/nodejs.yml)

[![DeepScan grade](https://deepscan.io/api/teams/5348/projects/17276/branches/390641/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5348&pid=17276&bid=390641)

[![codecov](https://codecov.io/gh/siristechnology/devpolls-api/branch/master/graph/badge.svg)](https://codecov.io/gh/siristechnology/devpolls-api)

### GraphQL

![graphql](/packages/server/assets/images/graphql-interface.png)

## Steps to run

1. `yarn` --to install npm modules
2. Create .env file as per .env.sample file. Get actual values from Heroku env if you need to.
3. Don't checkin .env file
4. `yarn dev` --to start api-server and worker in development mode
5. `yarn build` --to build admin dashboard
6. `yarn start` --to start api-server and worker in prod mode
7. `jest --runInBand -t 'some test description'` -- it will run tests with `some test description` in `it` description
8. `yarn lint` --to show linting errors. Add [`--fix`] to auto fix errors.

## Key points

1. Uses mongoose as ORM for mongodb
2. Mongoose schema at /src/db-service/mongooseSchema.js

## Most basic MongoDB commands (terminal)

-   `show dbs` --to show all dbs
-   `use devpollsdb` --to switch to devpollsdb
-   `show collections` --to show all collections/tables
-   `db.articles.find()` --to show all articles in the collection
-   `db.articles.find({title: 'new title'})` --to show article/articles with title = 'new title'
-   `db.articles.find({}, {title: 1})` --to show title field of all articles (no criteria)
-   `db.articles.remove({})` --to remove all articles documents
-   `db.articles.remove({title: 'new title'})` --to remove all articles with title = 'new title'
-   `db.articles.update({_id:{$exists:true}}, { $set: {createdDate: '2019-01-01'}}, {multi: true})` --to update multiple articles with createdDate = '2019-01-01'
-   `db.articles.find().sort({_id: -1}).limit(10)` -- to display latest articles (i.e order by descending and take 10 records)

## Some helpful commands

1. Run `kill-port 4000` to kill process in port 4000. kill-port is a npm module
