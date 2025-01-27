module.exports = function(RED) {
  function ZteSmsFilterNode(config) {
    RED.nodes.createNode(this, config);

    this.config = config;
    this.phoneNumberWhiteList = this.config.phoneNumberWhiteList.trim().split(';').map(s => s.trim()).filter(Boolean);

    this.on('input', function (msg, send, done) {
      const output = [[], [], [], [], []];
      const sms = Array.isArray(msg.sms) ? msg.sms : [sms];
      delete msg.sms;
      sms.forEach((s) => {
        if (this.phoneNumberWhiteList.length === 0 || this.phoneNumberWhiteList.includes(s.number)) {
          output[parseInt(s.tag, 10)].push(s);
        }
      });
      output.forEach((o, i) => {
        if (o.length > 0) {
          const m = RED.util.cloneMessage(msg);
          m.sms = o;
          output[i] = m;
        }
      });
      send(output);
      done();
    });
  };

  RED.nodes.registerType('zte-sms-filter', ZteSmsFilterNode);
};
