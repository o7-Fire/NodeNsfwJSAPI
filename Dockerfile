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
RUN mkdir ./certsFiles/
RUN cd ./certsFiles/ && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt
COPY package*.json ./
RUN npm install
VOLUME [ "/home/mossad" ]

COPY . .

ENTRYPOINT [ "npm", "start" ]
