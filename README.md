# Sync Party

---

**v0.12.0 is a massive breaking change.** If you have an instance of SyncParty deployed with data you care about, please make sure to **copy the following files** to a different directory **before** pulling the new version:

-   `server/db` (the database)
-   `server/uploads` (all uploaded files)
-   `server/persistence.json` (current playing position for each item, for each user)

After pulling the current version, create a `data` directory on 1st level.

After setting up (see below), copy both files as well as the `uploads` folder back into `data`. If you run `npm run prod:deploy` now, the app should work the same as before. Fingers crossed 🤞

---

Watch videos or listen to music synchronously with your friends. Imagine a virtual living room of a shared flat in a terribly cool city.

Demo video: https://www.youtube.com/watch?v=6t5-cAwSfjk

## Use cases

-   Watch a documentary or a vlog on YouTube with a friend from another country
-   Listen to a podcast together
-   Listen to the radio together, just like the old times, they say
-   Listen to an audiobook with your Australian boyfriend
-   Make party in the literal sense! 🤘 Useful when it isn't feasible to meet in real life, COVID-19 I'm looking at you 😠 Put headphones on. Fire up a video chat session. Turn up some music. Go for it!
-   Annoy your friends with your latest recordings
-   Review your recordings with your producer / manager
-   Present your films to your friends
-   Discuss your films with the team. Make sure everyone's on the same page - even the same split second this time.
-   Listen to the 20k tracks on your hard drive, in random fashion
-   Watch something in a foreign language & learn together
-   Watch a coding tutorial in sync with a coworker & improve your skills
-   Watch a cooking tutorial and do your deeds once in each kitchen

## Features

-   Any amount of user accounts
-   As many Sync Parties as you wish
-   Invite up to 6 other users to your parties
-   Support for many sites & media formats
-   Video, audio, and text chat

## Supported media sources

-   Uploaded video or audio files (`.mp4`, `.mp3`, `.m4a`, `.flac` etc.)
-   YouTube
-   Vimeo
-   SoundCloud
-   All kinds of freely available online media, static or streaming:
    -   Freely available public TV content, e.g. MediathekViewWeb content
    -   Online radios
    -   Files hosted somewhere
    -   You name it...

As this application is self-hosted, your & your friends' data stays as private as your server is secure. This project is completely open source and there is no tracking involved. However, if you're watching content on YouTube or similar sites, the 3rd party's usual tracking will happen.

## Hosting SyncParty

### Requirements

-   A Linux VPS (tested with Ubuntu 22.04)
    -   Unfortunately, at the moment you can't deploy SyncParty on non-persisting nodes, like Heroku.
-   git
-   Node.js >= 18
-   pm2 globally installed
-   SSL certificate (e.g. Let's Encrypt)

### Setup

-   Clone the repository
-   `npm ci`
-   Copy `.env.example` into a new `.env`
-   Configure the `.env` file:
    -   `NODE_ENV=production`
    -   Choose a **different** port for the server & the websockets server. `3000` and `4000` work just fine; they are also used in the nginx example below.
    -   Choose a solid, random SESSION_SECRET
-   Use a reverse proxy to map requests to your domain to the app and use SSL (see example below)
-   Make sure your firewall is configured correctly
-   You might want to use a tool like `authbind` to run pm2 without root; see https://pm2.keymetrics.io/docs/usage/specifics/#listening-on-port-80-w-o-root
-   `npm run prod:deploy`

### nginx Reverse Proxy Example

```conf
    server_name syncparty.YOURSITE.xyz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:4000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    location /peerjs/ {
        proxy_pass http://localhost:3000/peerjs/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    client_max_body_size 2048M;
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/syncparty.YOURSITE.xyz/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/syncparty.YOURSITE.xyz/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
```

## Development

### Contributing

If you spot a bug or want to contribute feel free to create an issue.

### Requirements

-   Node.js >= 14

### Setup

-   Clone the repository
-   `npm ci`
-   Copy `.env.example` into a new `.env`
-   Configure the `.env` file:
    -   `NODE_ENV=development` (default)
    -   Choose a **different** port for the server & the websockets server. `3000` and `4000` are default.
    -   Choose some SESSION_SECRET
-   You have to start two processes for development.
    -   `npm run dev:server`
    -   `npm run dev:client`
-   The app is accessible at `https://localhost:3000`

### Architecture

SyncParty is written in TypeScript, using ES Modules.

The server is built with Express, Sequelize, sqlite, express-session. Cookie-based authentication: Passport.js.

The client is a React application in TypeScript.

Realtime communication is realized with Socket.io. Video chat via PeerJS.

The built client application is delivered via the app server. If you run `npm run prod:deploy`, the built files are copied into the `public` dir of the build folder. An `index.html` is statically served to respond to all requests, except those routed to `/api/...`. A reverse proxy like nginx is needed to use HTTPS. You can find an example configuration above.

## Admin CLI

### Creating Users

The app has to be built before you can create users.

-   Development: Just run `npm run dev:server`
-   Production: `npm run prod:server:build` or having run `npm run prod:deploy` at least once

You can run the following commands with a **preceding space**, preventing the passwords from being written into your bash history. [TODO better CLI]

-   Create an admin user:
    -   This user can create parties, add guests to parties etc. Usually there is only one admin and this is you.
    -   Choose an excellent & unique password!
    -   `[SPACE] npm run cli create-user <USERNAME> <PASSWORD> admin`
-   Create other users:
    -   Choose a good & unique password! Users can upload arbitrary files to your server.
    -   `[SPACE] npm run cli create-user <USERNAME> <PASSWORD>`

### All Commands

`[SPACE TO BYPASS BASH HISTORY] npm run cli ` +

-   `create-user <USERNAME> <PASSWORD> [admin]`
-   `list-users`
-   `delete-user <USERNAME>`
-   `delete-all-users`
-   `change-password <USERNAME> <NEW PASSWORD>`

## Changelog

-   0.13.0: [breaking] Remove TSFS again :)
-   0.12.0: [breaking] Use my TSFS framework; get rid of Create React App; unify into one npm project
-   0.9.0: [breaking] Simplify setup
-   0.8.1: Add video chat; license change to GPL-3.0; TS strict mode for back end as well
-   0.7.0: Add text chat
-   0.6.0:
    -   Ported the back end to TypeScript
    -   Global type definitions in the client app
-   0.5.2: Several minor refactorings & bugfixes
-   0.5.1: Bugfix: this.player sometimes undefined when trying to seek at media item change
-   0.5.0: Initial release
