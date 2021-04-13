FROM node:12.19-slim

ENV USER=mossad

# install python and make
RUN apt-get update && \
	apt-get install -y python3 build-essential && \
	apt-get purge -y --auto-remove
	
# create user
RUN groupadd -r ${USER} && \
	useradd --create-home --home /home/mossad -r -g ${USER} ${USER}
	
# set up volume and user
USER ${USER}
WORKDIR /home/mossad

COPY package*.json ./
RUN npm install
VOLUME [ "/home/mossad" ]

COPY . .

ENTRYPOINT [ "node", "index.js" ]
