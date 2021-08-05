## NSFW API Detection with nodejs

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/o7-Fire/NodeNsfwJSAPI)

## Self Signed SSL
- sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt

Adopted from:
https://github.com/SashiDo/content-moderation-image-api, https://github.com/infinitered/nsfwjs

Preview: 
https://api.o7fire.ml/

### TODO
- Process external gif
- Use preview gif for slow machine
- imgur, giphy, etc
