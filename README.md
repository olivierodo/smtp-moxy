# SMTP-MOXY

> A light SMTP proxy to support your End to End automation test

## Description

### What is the problem we try to solve ?

Test automation is the key component of quality software, we all love it. 
However one of the remaining challenge is the email testing because in test environment, we want to:

* Receive the actual emails while we are running manual test to visual the email in our mailbox
* Mock the email inbox while we are running test automation.

# How does it works ? 

**SMTP MOXY** act as a proxy for your smtp server. Then each time an email will be receive by moxy, it will decide to mock  the email or forward it to the expected mail box.
Example:

1. **SMTP MOXY** is configured to mock all the email for the recipient on the `restqa.io` domain.
2. While running a manual test with the email `foo.bar@gmail.com`, the email will forwarded to the recipient.
3. While running an automated test using the email `test-123456@restqa.io`
  * The email *won't* be forwarded to the reciepent
  * The email detail will be stored on **SMTP MOXY** memory cache ad be accessible through the url `GET http://smtp-moxy.url/to/test-123456@restqa.io`


# Getting started

## Installation

## Environment variables

| *Variable*                   | *Description*                                            | *Default*             |
|:-----------------------------|:---------------------------------------------------------|:----------------------|
| `LOG_LEVEL`                  | Logging level                                            | `DEBUG`               |
| `HTTP_PORT   `               | The port exposing the http server                        | `8080`                |
| `SMTP_PORT`                  | The port exposing the smtp server                        | `465`                 |     
| `MOCK_DOMAINE_NAME`          | The domain name email that need to be stubbed            | `restqa.io`           |
| `FORWARD_SMTP_SERVER_HOST`   | The SMTP server host to forward the email                |                       |
| `FORWARD_SMTP_SERVER_PORT`   | The SMTP server port to forward the email                | `465`                 |
| `FORWARD_SMTP_SERVER_SECURE` | The SMTP server security to forward the email            | `false`               |
| `CACHE_TTL`                  | The time to live cache to store the stubbed email detail | `6000` (milliseconds) |


## Usage

### Docker Way

1 - Fetch the image

```sh
docker pull restqa/smtp-moxy
```


2 - Run the container (mock the email using the domain test-sample.io)

```sh
docker run --rm \
  --net=host \
  -p 465:465 \
  -p 8080:8080 \
  -e MOCK_DOMAINE_NAME=test-sample.io \
  -e FORWARD_SMTP_SERVER_HOST=smtp.gmail.com \
  -e FORWARD_SMTP_SERVER_PORT=587 \
  --name smtp-moxy \
  restqa/smtp-moxy
```

3 - Send an email to using smtp-moxy to : supafly@test-sample.io

```sh
docker run -i --net=host \
   --rm corentinaltepe/heirloom-mailx sh \
   -c 'echo "Backup executado com sucesso" | mailx -s "smtp-moxy test" -S smtp-use-starttls -S ssl-verify=ignore -S smtp=smtp://localhost:465 -S smtp-auth=login -S smtp-auth-user=your-smtp-username -S smtp-auth-password=your-smtp-password -S from="Restqa Labs <team@restqa.io>" -v supafly@test-sample.io'
```



4 - Check The mock detail for supafly@test-sample.io

```sh
docker run --net=host -it --rm --name jq endeveit/docker-jq curl localhost:8080/to/supafly@test-sample.io | jq
```

The result

```json
[
  {
    "attachments": [],
    "headers": {
      "date": "2020-04-12T08:52:35.000Z",
      "from": {
        "value": [
          {
            "address": "team@restqa.io",
            "name": "Restqa Labs"
          }
        ],
        ...
      },
      "to": {
        "value": [
          {
            "address": "supafly@test-sample.io",
            "name": ""
          }
        ],
        "html": "<span class=\"mp_address_group\"><a href=\"mailto:supafly@test-sample.io\" class=\"mp_address_email\">supafly@test-sample.io</a></span>",
        "text": "supafly@test-sample.io"
      },
      "subject": "smtp-moxy test",
    },
    "text": "Backup executado com sucesso\n",
    "textAsHtml": "<p>Backup executado com sucesso</p>",
    "subject": "smtp-moxy test",
    "date": "2020-04-12T08:52:35.000Z",
    "to": {
      "value": [
        {
          "address": "supafly@test-sample.io",
          "name": ""
        }
      ],
      "text": "supafly@test-sample.io"
    },
    "from": {
      "value": [
        {
          "address": "team@restqa.io",
          "name": "Restqa Labs"
        }
      ]
    },
    "html": false
  }
]
```


### Kubernetes Way


Let say you want to deploy moxy in the tests namespace you will just need to run :

```sh
kubectl apply -f https://raw.githubusercontent.com/restqa/smtp-moxy/master/kubernetes-manifest.yml -n tests
```

The definition file includes :

* config map
* deployment ( 1 replicas)
* service
*
You can still get insipire from our example definition file : [kubernetes-manifest.yml](./kubernetes-manifest.yml)

## License

[MIT](./LICENSE) License

