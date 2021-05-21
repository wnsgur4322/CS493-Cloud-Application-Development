const amqp = require('amqplib');

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;
// default port for rabbitMQ = 5672

async function main() {
        try {
                const connection = await amqp.connect(rabbitmqUrl);
                const channel = await connection.createChannel();
                await channel.assertQueue('echo');

                const sentence = "The quick borwn fox jumped over the lazy dog";
                sentence.split(' ').forEach(word => {
                        channel.sendToQueue('echo', Buffer.from(word));
                });

                setTimeout(() => connection.close(), 500);
        } catch (err) {
                console.error(err);
        } 
}

main();