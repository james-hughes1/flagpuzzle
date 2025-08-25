# FlagPuzzle Project

## About

A project that helped me to learn javascript. You race to fit blocks into place as they fall, whilst also scoring points by answering the correct country that matches the flag. At the end, your score is added to a leaderboard on MongoDB which actually updates.

## How to run

Run `npm install` to install packages.
Create a .env file with the following 
> - DB_USERNAME=
> - DB_PASSWORD=
> - DB_CLUSTER=
> - DB_NAME=
> - BASE_URL=http://localhost:5000
> - PORT=5000

BASE_URL should be either http://localhost:5000 for dev environment, or the actual domain on your production environment.

In MongoDB, set your database to accept all IP addresses ("Network Access") but choose a strong password. The DB_NAME is that of your database; the collection within the database will be called "scores".

## Tools

 - **Javascript.** Used to write code that defines the functionality of the app.
 - **CSS.** Defines the styling of the website frontend.
 - **npm.** Package & dependency manager
 - **node.js** Enable Javascript code to be run on a server (and a local dev server)
    - Run `npm start` to start the server.
 - **Husky, ESLint & Prettier.** Continuous integration tools that ensure consistent code formatting for js.
 - **MongoDB.** Database.
 - **EJS.** Views.

 ## Acknowledgements

Flag SVG icons sourced from [flagpedia.net](https://flagpedia.net)

