# Sync Party

Watch videos or listen to music synchronously with your friends. Imagine a virtual living room of a shared flat in a terribly cool city.

Demo video: https://www.youtube.com/watch?v=6t5-cAwSfjk

Features:

-   Any amount of user accounts
-   As many Sync Parties as you wish
-   Invite up to 6 other users to your parties
-   Support for many sites & media formats
-   Video, audio, and text chat

Use cases:

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

Supported media sources:

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

## Contributing

If you spot a bug or want to contribute feel free to create an issue.

## Requirements

-   A Linux server (tested with Ubuntu 18.04)
-   Node.js >= 12
-   pm2 globally installed
-   SSL certificate (e.g. Let's Encrypt)

## Setup

-   Clone the repository
-   In `/server` & in `/client`:
    -   `npm ci`
    -   Copy `.env.example`
    -   Rename to `.env`
    -   Enter your specific config values
-   You can run the following commands with a preceding space, preventing the passwords from being written into your bash history.
-   In `/server/build`: Create an admin user:
    -   Choose an excellent & unique password!
    -   In `/server/build/admin-cli`: `[SPACE] node admin.js create-user <USERNAME> <PASSWORD> admin`
-   In `/server`: Create other users:
    -   Choose a good & unique password! Users can upload arbitrary files to your server.
    -   In `/server/build/admin-cli`: `[SPACE] node admin.js create-user <USERNAME> <PASSWORD>`

## Production

-   If required, configure the `.env` files to run the app exposing only a local port and use a reverse proxy (see example below)
-   Make sure your firewall is configured correctly
-   You might want to use a tool like `authbind` to run pm2 without root; see https://pm2.keymetrics.io/docs/usage/specifics/#listening-on-port-80-w-o-root
-   In `/server`: `npm run deploy`

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

-   In `/client`: `npm ci && npm start`
-   In `/server`: `npm ci && npm start`

### Architecture

The server is written in Express, using Sequelize, sqlite, express-session. Cookie-based authentication: Passport.js.
The client is a React application in TypeScript.

Realtime communication is realized with Socket.io.

In production mode, the client application is delivered via the back end app. If you run `npm run deploy` the `build` folder's contents are copied into the `client-build` dir of the server, whose `index.html` is statically served to all requests except those routed to `/api/...`. A reverse proxy like nginx is needed to use HTTPS. You can find an example configuration above.

In development, you'll run the front end via the webpack dev server included in `create-react-app`.

### Documentation

Autogenerated API documentation is found under `/server/doc/index.html`. This document is generated everytime you `npm start` your dev server.

## Admin CLI

In `/server/build/admin-cli`: `admin.js` +

-   `[SPACE] create-user <USERNAME> <PASSWORD> [admin]`
-   `list-users`
-   `delete-user <USERNAME>`
-   `delete-all-users`
-   `[SPACE] change-password <USERNAME> <NEW PASSWORD>`

## Changelog

-   0.9.0: [breaking] Simplify setup
-   0.8.1: Add video chat; license change to GPL-3.0; TS strict mode for back end as well
-   0.7.0: Add text chat
-   0.6.0:
    -   Ported the back end to TypeScript
    -   Global type definitions in the client app
-   0.5.2: Several minor refactorings & bugfixes
-   0.5.1: Bugfix: this.player sometimes undefined when trying to seek at media item change
-   0.5.0: Initial release
