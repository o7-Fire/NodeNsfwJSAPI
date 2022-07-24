## NSFW API Detection with nodejs

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/o7-Fire/NodeNsfwJSAPI)


### Self Signed SSL
- mkdir certsFiles && cd certsFiles
- sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt

or just use certbot (if you selfhost it)

- sudo apt install -y certbot
- certbot certonly --standalone -d yourdomain.com #need to have port 80 open and run as sudo if not root already
- add CERTBOT=true on .env

### TODO
- Process external gif
- Use preview gif for slow machine
- imgur, giphy, etc
- Documentation
- Proper API

### Preview
- Not 100% perfect
<table align="center">
  <tbody>
    <tr>
      <td align="center">
        <a
          href="https://cdn.discordapp.com/attachments/840041811384860709/872868193511825428/unknown.png">
          <image
            src="https://cdn.discordapp.com/attachments/840041811384860709/872868193511825428/unknown.png" />
        </a>
      </td>
      <td align="center">
        <a
          href="https://cdn.discordapp.com/attachments/840041811384860708/872865181213032518/unknown.png">
          <image
            src="https://cdn.discordapp.com/attachments/840041811384860708/872865181213032518/unknown.png" />
        </a>
      </td>
      <td align="center">
        <a
          href="https://cdn.discordapp.com/attachments/840041811384860708/872867517125771355/unknown.png">
          <image
            src="https://cdn.discordapp.com/attachments/840041811384860708/872867517125771355/unknown.png"/>
        </a>
      </td>
            <td align="center">
        <a
          href="https://cdn.discordapp.com/attachments/840041811384860709/872868265372831785/unknown.png">
          <image
            src="https://cdn.discordapp.com/attachments/840041811384860709/872868265372831785/unknown.png"/>
        </a>
      </td>
    </tr>
  </tbody>
</table>
<br />

- response
- ![](https://cdn.discordapp.com/attachments/840041811384860708/872872718897385582/unknown.png)
- after processing and some cahce (pi 4 B)
- ![](https://cdn.discordapp.com/attachments/997385080047673415/1000561451938881566/unknown.png)

### Misc

Adopted from:
https://github.com/SashiDo/content-moderation-image-api, https://github.com/infinitered/nsfwjs

Preview: 
https://api.yeet.ml
