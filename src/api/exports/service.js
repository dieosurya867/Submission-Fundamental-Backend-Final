const amqp = require('amqplib');

class ExportService {
    constructor() {
        this._channel = null;
    }

    async connect() {
        const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
        this._channel = await connection.createChannel();
    }

    async sendMessage(queue, message) {
        if (!this._channel) await this.connect();
        await this._channel.assertQueue(queue, { durable: true });
        this._channel.sendToQueue(queue, Buffer.from(message));
    }
}

module.exports = ExportService;
