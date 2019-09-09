# Responsively Server
## Dev Deployment
To deploy the app, edit the AWS credentials in the `setCreds.sh` file and run the following commands:
```
source ./setCreds.sh
yarn run deploy
```

## Rest APIs
### Activate trial
Description: To activate a trial user
Request: GET
Endpoint: `/activate-trial`
QueryParams: 
```
{
  email: <email-id>
}
```
Response:
```
{
  status: <true|false>,
  errorType: <error-code>
}
```

Sample: `/activate-trial?email=suresh@gmail.com`

### Buy License
Will have to figure out how to send the request after making a payment.

## Websocket Messages
### Validate License
Message body:
```
{
  action: "VALIDATE",
  body: {
    licenseKey: "abcdefghijklmopqr",
  }
}
```
Reply body:
```
{
  valid: <true|false>
}
```
