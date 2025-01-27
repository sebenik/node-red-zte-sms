module.exports = function (RED) {
  function ZteSmsMarkkNode(config) {
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
        if (Array.isArray(msg?.sms) && msg.sms.length > 0) {
          const unreadReceivedSmsIds = msg.sms.reduce(function (filtered, sms) {
            sms.tag === '1' && filtered.push(sms.id);
            return filtered;
          }, []);
          if (unreadReceivedSmsIds.length > 0) {
            await node.modem.markSmsAsRead(node, unreadReceivedSmsIds);;
          }
        }
        send(msg);
        done();
      } catch (error) {
        this.isError = true;
        node.status({ fill: 'red', shape: 'dot', text: error?.message });
        node.warn(error?.message);
        console.error(error);
        done(error);
      }
    });
  };

  RED.nodes.registerType('zte-sms-mark', ZteSmsMarkkNode);
}
