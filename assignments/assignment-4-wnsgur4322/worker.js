const sizeOf = require('image-size');
const Jimp = require('jimp');
var path = require('path');
const { Readable } = require('stream');
const crypto = require('crypto');

const { connectToDB, getDBReference } = require('./lib/mongo');
const { connectToRabbitMQ, getChannel } = require('./lib/rabbitmq');
const { ObjectId, GridFSBucket } = require('mongodb');
const { 
        updateImageDimensionsById, 
        saveImageFile,
        getDownloadStreamById,
        remove_UploadedFile, 
        updateImageSizeById, 
        getImageInfoById} = require('./models/photo');

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

async function resizing(id, dimensions, size, image) {
        Jimp.read(image)
            .then(async (image) => {
                if (dimensions.width >= size) {
                        image.resize(size, Jimp.AUTO)
                        .quality(60);

                        image.getBuffer(Jimp.MIME_JPEG, async (err, buffer) => {
                                if (err) {
                                        console.log(err);
                                        throw err;
                                } else {
                                
                                const db = getDBReference();
                                const bucket = new GridFSBucket(db, { bucketName: 'photos' });
        
                                if (dimensions.width == size) {
                                        size = "orig";
                                }
                                
                                let filename = crypto.pseudoRandomBytes(16).toString('hex') + ".jpg";
                                const original = await getImageInfoById(id);
                                let metadata = {
                                        contentType: "image/jpeg",
                                        size: size.toString(),
                                        businessid: original.metadata.businessid,
                                        caption: "",
                                        photoid: id
                                };
                                
                                const uploadStream = bucket.openUploadStream(
                                        filename,
                                        { metadata: metadata }
                                );
        
                                const readable = new Readable();
                                readable._read = () => {};
                                readable.push(buffer);
                                readable.push(null);
        
                                readable.pipe(uploadStream)
                                        .on('finish', async (result) => {
                                        console.log("id:" + result._id + " filename: " + filename, result.metadata.businessid);
                                        updateImageSizeById(id, size, filename);
                                        
                                        });
                                }
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
    
connectToDB(async () => {
        await connectToRabbitMQ('photos');

        console.log("Worker is waiting for consume ...");
        const channel = getChannel();
        channel.consume('photos', msg => {
            const id = msg.content.toString();
            const imageChunks = [];
    
            getDownloadStreamById(id)
                .on('data', chunk => {
                    imageChunks.push(chunk);
                })
                .on('end', async () => {
                        const dimensions = sizeOf(Buffer.concat(imageChunks));
                        console.log("  -- computed original dimensions:", dimensions);
                        const result = await updateImageDimensionsById(id, dimensions);
                        console.log("  -- update result:", result);
    
                        resizing(id, dimensions, 1024, Buffer.concat(imageChunks));
                        resizing(id, dimensions, 640, Buffer.concat(imageChunks));
                        resizing(id, dimensions, 256, Buffer.concat(imageChunks));
                        resizing(id, dimensions, 128, Buffer.concat(imageChunks));
                        resizing(id, dimensions, dimensions.width, Buffer.concat(imageChunks));
                });

                console.log("== Worker has finished job");
                channel.ack(msg);
        });
});