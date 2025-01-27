module.exports = function (RED) {
  function ZteSmsCheckNode(config) {
    RED.nodes.createNode(this, config);

    this.modem = RED.nodes.getNode(config.modem);
    this.config = config;
    const node = this;

    node.on('input', async function (msg, send, done) {
      this.isError = false;
      if (!node.modem) {
        this.isError = true;
        const errMsg = 'Missing modem configuration.';
        node.status({ fill: 'red', shape: 'dot', text: errMsg });
        send(msg);
        done(new Error(errMsg));
        return;
      }

      try {
        msg.sms = await node.modem.getAllSms(node);
        const smsCapacity = node.modem.modemCapacity;
        send([msg, { payload: smsCapacity }]);
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

  RED.nodes.registerType('zte-sms-check', ZteSmsCheckNode);
}
