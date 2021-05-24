const sizeOf = require('image-size');

const { connectToDB } = require('./lib/mongo');
const { connectToRabbitMQ, getChannel } = require('./lib/rabbitmq');
const { getDownloadStreamById, updateImageDimensionsById } = require('./models/image');

connectToDB(async () => {
        await connectToRabbitMQ('images');
        const channel = getChannel();
        
        console.log("== dimensionWorker is on");

        channel.consume('images', msg => {
                const id = msg.content.toString();
                console.log("== got message with id:", id);
                const imageChunks = [];
                getDownloadStreamById(id)
                        .on('data', chunk => {
                                imageChunks.push(chunk);
                        })
                        .on('end', async () => {
                                const dimensions = sizeOf(Buffer.concat(imageChunks));
                                console.log("  -- computed dimensions:", dimensions);
                                const result = await updateImageDimensionsById(id, dimensions);
                                console.log("  -- update result:", result);
                        });
                channel.ack(msg);        
        });
});