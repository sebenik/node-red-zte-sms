module.exports = function(RED) {
  function ZteSmsSendNode(config) {
    RED.nodes.createNode(this, config);

    this.modem = RED.nodes.getNode(config.modem);
    this.config = config;
    const node = this;

    node.on('input', async function(msg, send, done) {
      this.isError = false;
      const phoneNumber = msg.recipientNumber || config.phoneNumber;

      if (!phoneNumber || !node.modem) {
        this.isError = true;
        const errMsg = `Missing ${!node.modem ? 'modem' : 'phone number'} configuration.`;
        node.status({ fill: 'red', shape: 'ring', text: errMsg });
        send(msg);
        done(new Error(errMsg));
        return;
      }

      const smsMessage = RED.util.ensureString(
        node.config.targetType === 'full'
          ? msg
          : RED.util.getMessageProperty(msg, node.config.complete)
      );

      try {
        msg.sms = await node.modem.sendSms(node, phoneNumber, smsMessage);
        send(msg);
        done();
      } catch (error) {
        this.isError = true;
        node.status({ fill: 'red', shape: 'dot', text: error?.message });
        node.warn(error?.message);
        console.error(error);
        send(msg);
        done(error);
      }
    });
  };

  RED.nodes.registerType('zte-sms-send', ZteSmsSendNode);
};
