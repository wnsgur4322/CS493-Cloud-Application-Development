const sizeOf = require('image-size');

const { connectToDB } = require('./lib/mongo');
const { connectToRabbitMQ, getChannel } = require('./lib/rabbitmq');
const { getDownloadStreamById } = require('./models/image');

connectToDB(async () => {
        await connectToRabbitMQ(images);
        const channel = getChannel();
        channel.consume('images', msg => {
                const id = msg.content.toString();
                const imageChunks = [];
                getDownloadStreamById(id)
                        .on('data', chunk => {
                                imageChunks.push(chunk);
                        });
        })
});