FROM node:16-bullseye-slim

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
#RUN cd ./certsFiles/ && openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt
RUN touch ./certsFiles/selfsigned.key
RUN touch ./certsFiles/selfsigned.crt 
COPY package*.json ./
USER node
RUN npm install
VOLUME [ "/home/mossad" ]

COPY . .

ENTRYPOINT [ "npm", "start" ]
