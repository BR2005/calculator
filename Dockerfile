FROM node:22
WORKDIR /calculator
COPY calculator.html .
COPY server.js .
EXPOSE 3000
CMD [ "node", "server.js" ]
