# ZTE SMS

ZTE SMS is a custom Node-Red node to send SMS message using ZTM LTE modem.
Tested on model `MF79U`.

![node-red-zte-sms](https://github.com/sebenik/node-red-zte-sms/blob/master/docs/images/zte-sms.png?raw=true)

## Install

Search for: `@zigasebenik/node-red-zte-sms`

Or install manually: `npm install @zigasebenik/node-red-zte-sms`

## Properties
![Node properties](https://github.com/sebenik/node-red-zte-sms/blob/master/docs/images/zte-sms-properties.png?raw=true)

- **Name**: Name fo the node
- **Modem**: add modem configuration
- **SMS message:** select to either send whole or part of the incoming node message as SMS
- **Phone number:** phone number of the SMS recipient 

## Modem properties
![Modem properties](https://github.com/sebenik/node-red-zte-sms/blob/master/docs/images/zte-sms-properties.png?raw=true)

- **Name**: Name of the modem
- **Modem IP:** ZTE modem IP
- **Modem password:** password for the ZTE modem
