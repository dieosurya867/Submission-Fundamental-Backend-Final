const amqp = require('amqplib');

class ExportService {
    constructor() {
        this._channel = null;
        this._queue = 'export:playlists';
    }

    async connect() {
        const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
        const channel = await connection.createChannel();
        await channel.assertQueue(this._queue, { durable: true });

        this._channel = channel;
    }

    async sendMessage(message) {
        if (!this._channel) await this.connect();
        this._channel.sendToQueue(this._queue, Buffer.from(JSON.stringify(message)));
    }
}

module.exports = ExportService;
