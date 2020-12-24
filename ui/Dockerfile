FROM node:slim as build

WORKDIR /app
ADD ./package.json .
ADD ./yarn.lock .
RUN yarn install
ADD . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
