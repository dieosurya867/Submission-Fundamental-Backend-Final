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
        console.log('[ExportService] Preparing to send message:', message);

        if (!this._channel) {
            console.log('[ExportService] No channel, connecting...');
            await this.connect();
        }

        const buffered = Buffer.from(JSON.stringify(message));
        this._channel.sendToQueue(this._queue, buffered);

        console.log('[ExportService] Message sent to queue:', this._queue);
    }
}

module.exports = ExportService;
