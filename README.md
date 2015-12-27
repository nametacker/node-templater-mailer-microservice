# node-templater-mailer-microservice

A microservice for sending template based emails via an SMTP server written in JavaScript

## Setup

    npm install
    
## Configuration

Copy `config.json` to `config.local.json` and adapt to your needs

## Run

    node main.js | ./node_modules/bunyan/bin/bunyan
    
## Init configuration

Create the template `foo`:

    curl -v -X PUT http://127.0.0.1:3000/templates/foo \
    -H 'Content-Type: application/vnd.node-templater-mailer-microservice.v1+json; charset=utf-8' \
    --data '{"subject":"Mail for <%= name %>","html":"Hello <%= name %>"}'

Create the SMTP transport `bar`:

    curl -v -X PUT http://127.0.0.1:3000/smtp_credentials/bar \
    -H 'Content-Type: application/vnd.node-templater-mailer-microservice.v1+json; charset=utf-8' \
    --data '{"dsn":"smtp://john:doe@example.com:25","email":"info@example.com","name":"Example Inc."}'

Send an email using the transport `bar` and the template `foo`:
    
    curl -v -X POST http://127.0.0.1:3000/send/bar/foo \
    -H 'Content-Type: application/vnd.node-templater-mailer-microservice.v1+json; charset=utf-8' \
    --data '{"to":"john.doe@example.com","name":"John Doe"}'

The `subject` and the `html` part of the template will be parsed through [lodash's template function](https://lodash.com/docs#template)
with the data provided in the `body` of this request.
