# talkpacific

Welcome to the development repository for TalkPacific — an AI-powered translation service.

## Overview

TalkPacific is under construction to become a tool to learn new languages. Utilizing Speech-To-Text (STT), Translation (T), and Text-To-Speech (TTS) technologies, TalkPacific is not just about translating languages; it's about enriching communication with personal language development and cultural comprehension.

## Development

Each component of the service is being developed in a respective directory. For example the electron destkop and react web app is inside the app-desktop-react directory. One backend api is in the api-talkpacific directory. To run or build these services directly, look inside the respective directory for instructions.

Otherwise, run everything with docker-compose from the root talkpacific directory:
```bash
git clone git@github.com:picret/talkpacific.git
cd talkpacific
docker compose up
```

## Set up

Copy and paste the `.env-template` files in the `app-desktop-react` and `api-talkpacific` directories to `.env` files. Fill in the necessary environment variables. After that, you can run the services with docker-compose.

By default the backend service can be accessed at http://localhost:5050 and the frontend service can be accessed at http://localhost:8080.

## Showcase

This is by no means polished at this point. But here is a quick showcase:

![TalkPacific Showcase](readme-showcase.mp4)