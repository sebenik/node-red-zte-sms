const Modem = require('@zigasebenik/zte-sms');

class Q {
  constructor() { this._items = []; }
  enqueue(item) { this._items.push(item); }
  dequeue() { return this._items.shift(); }
  get size() { return this._items.length; }
}

class Queue extends Q {
  constructor() {
    super();
    this._pendingPromise = false;
  }

  enqueue(action) {
    return new Promise((resolve, reject) => {
      super.enqueue({ action, resolve, reject });
      this.dequeue();
    });
  }

  async dequeue() {
    if (this._pendingPromise) { return false };
    let item = super.dequeue();
    if (!item) { return false };

    try {
      this._pendingPromise = true;
      let payload = await item.action(this);
      this._pendingPromise = false;
      item.resolve(payload);
    } catch (error) {
      this._pendingPromise = false;
      item.reject(error);
    } finally {
      this.dequeue();
    }
    return true;
  }
}

module.exports = function(RED) {

  function ZteModemNode(config) {
    RED.nodes.createNode(this, config);
    this.config = config;
    this.modemCapacity = null;
    this.observedNodes = new Set([]);
    this.queue = new Queue();
    const modem = new Modem({
      modemIP: config.modemIP,
      modemPassword: this.credentials.modemPassword
    });
    const node = this;

    const getCapacityInfo = async function () {
      try {
        node.modemCapacity = await modem.getSmsCapacityInfo();
        setNodeSuccessStatus();
        return node.modemCapacity;
      } catch (error) {
        node.observedNodes.forEach((n) => {
          n.status({ fill: 'red', shape: 'dot', text: `Can't get modem capacity` });
        });
      }
    }

    const setNodeSuccessStatus = function () {
      const used = Number.parseInt(node.modemCapacity.sms_nvused_total, 10);
      const total = Number.parseInt(node.modemCapacity.sms_nv_total, 10);
      node.observedNodes.forEach((n) => {
        if (!n.isError) {
          n.status({ fill: 'green', shape: 'dot', text: `Modem capacity: ${used}/${total}` });
        }
      });
    }

    this.getAllSms = function (n) {
      return node.queue.enqueue(async () => {
        n.status({ fill: 'blue', shape: 'dot', text: 'Checking ...' });
        await getCapacityInfo();
        return await modem.getAllSms();
      })
    }

    this.sendSms = function (n, phoneNumber, smsMessage) {
      return node.queue.enqueue(async () => {
        n.status({ fill: 'blue', shape: 'dot', text: 'Sending ...' });
        const sms = await modem.sendSms(phoneNumber, smsMessage)
        await getCapacityInfo();
        return sms;
      });
    }

    this.deleteSms = function (n, smsId) {
      return node.queue.enqueue(async () => {
        n.status({ fill: 'blue', shape: 'dot', text: 'Deleting ...' });
        await modem.deleteSms(smsId)
        await getCapacityInfo();
      });
    }

    this.markSmsAsRead = function (n, smsId) {
      return node.queue.enqueue(async () => {
        n.status({ fill: 'blue', shape: 'dot', text: 'Marking as read ...' });
        await modem.setSmsAsRead(smsId)
        await getCapacityInfo();
      });
    }

    setImmediate(() => {
      node.config._users?.forEach((uId) => {
        const node = RED.nodes.getNode(uId);
        node && this.observedNodes.add(node);
      });
      getCapacityInfo();
    });
  }

  RED.nodes.registerType("zte-modem", ZteModemNode, {
    credentials: {
      modemPassword: { type: "password" },
    }
  });
}
