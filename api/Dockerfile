FROM node:slim

WORKDIR /app
ADD ./package.json .
RUN npm install
ADD . .
EXPOSE 3300
CMD ["npm", "start"]
