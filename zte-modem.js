module.exports = function(RED) {

  function ZteModemNode(config) {
    RED.nodes.createNode(this, config);
    this.config = config;
  }

  RED.nodes.registerType("zte-modem", ZteModemNode, {
    credentials: {
      modemPassword: { type: "password" },
    }
  });
}
