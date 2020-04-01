FROM node:stretch-slim

RUN chsh -s /bin/bash
ENV SHELL=/bin/bash

RUN adduser --gecos '' --disabled-password nesmaths

RUN npm i -g serve

USER nesmaths
WORKDIR /home/nesmaths

ENTRYPOINT ["serve", "-s", "dist"]
