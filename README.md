# sea-you-sea-me.web.app

> Sea Together

## Setup

``` bash
# install dependencies
$ yarn install

# serve with hot reload at http://localhost:3000/
$ yarn dev

# generate static project
$ yarn generate

# build for production and launch server
$ yarn start
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).



## HTTPS Setup
```bash

# making and trusting your own certificates
# ref: https://letsencrypt.org/docs/certificates-for-localhost/#making-and-trusting-your-own-certificates
openssl req -x509 -out localhost/server.crt -keyout localhost/server.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

# serve with hot reload at https://localhost:3000
$ yarn dev

```

