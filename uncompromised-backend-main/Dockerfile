FROM node:20.9.0
WORKDIR /code
COPY package.json /code
RUN npm install
COPY . /code
ENTRYPOINT ["/bin/bash", "/code/entrypoint.sh"]
#CMD ["npm", "run", "prod"]
CMD ["node", "index.js"]

