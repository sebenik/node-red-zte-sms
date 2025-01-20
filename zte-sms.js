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
      if (!config.phoneNumber || !modem) {
        node.status({ fill: 'red', shape: 'ring' });
        send(msg);
        done();
        return;
      }

      node.status({ fill: 'yellow', shape: 'ring' });
      let smsMessage = RED.util.ensureString(
        node.config.targetType === 'full' ? msg : RED.util.getMessageProperty(msg, node.config.complete)
      );
      modem.sendSms(config.phoneNumber, smsMessage)
        .then((success) => {
          node.status({ fill: success ? 'green' : 'red', shape: 'ring' });
          send(msg);
          done();
        })
        .catch((err) => {
          node.status({ fill: 'red', shape: 'ring' });
          node.warn(err);
          send(msg);
          done();
        })
    });
  };

  RED.nodes.registerType('zte-sms-send', ZteSmsSendNode);
};
