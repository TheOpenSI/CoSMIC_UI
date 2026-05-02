FROM node:25-trixie AS base

WORKDIR /app


FROM base AS install
RUN mkdir -p /temp/dev
COPY ./package.json ./yarn.lock /temp/dev/
RUN cd /temp/dev && yarn install


FROM base AS prerelease
COPY --from=install /temp/dev/node_modules ./node_modules/
COPY ./ ./


EXPOSE          \
    5173/tcp    \
    24678/tcp

# NOTE:
# Check in `package.json` file under `scripts` field for more details
CMD [ "yarn", "run", "dev" ]
