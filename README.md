# Sync Party

Watch videos or listen to music synchronously with your friends. Imagine a virtual living room of a shared flat in a terribly cool city.

Use cases:

-   Watch a documentary or a vlog on YouTube with a friend from another country
-   Listen to a podcast together
-   Listen to the radio together, just like the old times, they say
-   Listen to an audiobook with your Australian boyfriend
-   Make party in the literal sense. Useful when it isn't feasible to meet in real life, COVID-19 I'm looking at you 😠 Just fire up a Zoom/Jitsi/what-have-you session, put headphones on, turn up some music and go for it.
-   Annoy your friends with your latest recordings
-   Review your recordings with your producer / manager
-   Present your films to your friends
-   Discuss your films with the team. Make sure everyone's on the same page - even the same split second this time.
-   Listen to the 20k tracks on your hard drive you collected before Spotify, in random fashion
-   Watch something in a foreign language & learn together
-   Watch a coding tutorial in sync with a coworker & improve your skills
-   Watch a cooking tutorial and do your deeds once in each kitchen

Supported media sources:

-   Uploaded video or audio files (`.mp4`, `.mp3`, `.m4a`, `.flac` etc.)
-   YouTube
-   Vimeo
-   SoundCloud
-   All kinds of freely available online media, static or streaming:
    -   Freely available public TV content, e.g. MediathekViewWeb content
    -   Online radios
    -   Files hosted somewhere

As this application is self-hosted, your & your friends' data stays as private as your server is secure. This project is completely open source and there is no tracking etc. involved. However, if you're watching content on YouTube or similar sites, their usual tracking strategies will take place.

## Contributing

If you spot a bug or want to contribute feel free to create an issue.

## Requirements

-   A Linux server (tested with Ubuntu 18.04)
-   Node.js >= 12
-   pm2 globally installed
-   SSL certificate (e.g. Let's Encrypt)

## Setup

-   Pull the repository
-   In `/server` & in `/client`:
    -   `npm install`
    -   Copy `.env.example`
    -   Rename to `.env`
    -   Enter your specific config values
-   You can run the following commands with a preceding space, preventing the passwords from being written into your bash history.
-   In `/server`: Create an admin user:
    -   Choose an excellent & unique password!
    -   In `/server/admin-cli`: `[SPACE] node run admin.js create-user <USERNAME> <PASSWORD> admin`
-   In `/server`: Create other users:
    -   Choose a good & unique password! Users can upload arbitrary files to your server.
    -   In `/server/admin-cli`: `[SPACE] node run admin.js create-user <USERNAME> <PASSWORD>`

## Production

-   If required, configure the `.env` files to run the app exposing only a local port and use a reverse proxy
-   Make sure your firewall is configured correctly
-   You might want to use a tool like `authbind` to run pm2 without root; see https://pm2.keymetrics.io/docs/usage/specifics/#listening-on-port-80-w-o-root
-   In `/client`: `npm run deploy`
-   In `/server`: `npm run deploy` or `npm install && [sudo] npm run start-production`

## Development

-   In `/client`: `npm install && npm start`
-   In `/server`: `npm install && npm start`

### Architecture

The server is written in Express, using Sequelize, sqlite, express-session. Cookie-based authentication: Passport.js.
The client is a React application in TypeScript.

Realtime communication is realized with Socket.io.

In production mode, the client application is delivered via the back end app.

In development, you'll want to run the front end via a separate server. CORS issues can be mitigated in the corresponding `.env` file.

## Admin CLI

In `/server/admin-cli`: `admin.js` +

-   `[SPACE] create-user <USERNAME> <PASSWORD> [admin]`
-   `list-users`
-   `delete-user <USERNAME>`
-   `delete-all-users`
-   `[SPACE] change-password <USERNAME> <NEW PASSWORD>`

## To Do

-   Server & client: Implement CSRF protection
-   Client: Fix a bug regarding `this.player` in `react-player` library

## Changelog

0.5.0: Initial release
