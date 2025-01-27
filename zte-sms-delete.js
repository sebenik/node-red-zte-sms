module.exports = function(RED) {
  function ZteSmsDeleteNode(config) {
    RED.nodes.createNode(this, config);

    this.modem = RED.nodes.getNode(config.modem);
    this.config = config;
    const node = this;

    this.on('input', async function (msg, send, done) {
      if (!Array.isArray(msg.sms)) {
        done(new Error('Received no sms messages to delete.'));
        return;
      }

      try {
        const smsIds = msg.sms.map((sms) => sms.id);
        if (smsIds.length > 0) {
          await node.modem.deleteSms(node, smsIds);
        }
      } catch (error) {
        this.isError = true;
        node.status({ fill: 'red', shape: 'dot', text: error?.message });
        node.warn(error?.message);
        console.error(error);
        done(error);
      }

    });
  };

  RED.nodes.registerType('zte-sms-delete', ZteSmsDeleteNode);
};
