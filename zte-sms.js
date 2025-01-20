const Modem = require('@zigasebenik/zte-sms');

module.exports = function (RED) {
  function ZteSmsSendNode(config) {
    RED.nodes.createNode(this, config);

    this.modem = RED.nodes.getNode(config.modem);
    this.config = config;
    const node = this;
    const modem = new Modem({
      modemIP: this.modem.config.modemIP,
      modemPassword: this.modem.credentials.modemPassword
    });

    node.on('input', function (msg, send, done) {
      const phoneNumber = msg.recipientNumber || config.phoneNumber;

      if (!phoneNumber || !modem) {
        const errMsg = `Missing ${!modem ? 'modem' : 'phone number'} configuration.`;
        node.status({ fill: 'red', shape: 'ring', text: errMsg });
        send(msg);
        done(new Error(errMsg));
        return;
      }

      node.status({ fill: 'yellow', shape: 'ring' });

      const smsMessage = RED.util.ensureString(
        node.config.targetType === 'full' ? msg : RED.util.getMessageProperty(msg, node.config.complete)
      );

      modem.sendSms(phoneNumber, smsMessage)
        .then((success) => {
          node.status({ fill: success ? 'green' : 'red', shape: 'ring' });
          send(msg);
          success ? done() : done(new Error('SMS not sent.'));
        })
        .catch((err) => {
          node.status({ fill: 'red', shape: 'ring' });
          node.warn(err);
          send(msg);
          done(err);
        })
    });
  };

  RED.nodes.registerType('zte-sms-send', ZteSmsSendNode);
};
