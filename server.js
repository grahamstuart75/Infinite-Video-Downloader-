const express = require('express');
const axios = require('axios');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Endpoint to download video from a URL
app.post('/download-video', async (req, res) => {
    const videoUrl = req.body.url;
    const outputFilePath = path.join(__dirname, 'downloaded_video.mp4');

    try {
        const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(outputFilePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            res.json({ message: 'Video downloaded successfully', path: outputFilePath });
        });

        writer.on('error', () => {
            res.status(500).json({ message: 'Error downloading the video' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch video', error });
    }
});

// Endpoint to convert the video format
app.post('/convert-video', (req, res) => {
    const inputFilePath = req.body.inputPath;
    const outputFilePath = path.join(__dirname, 'converted_video.mp4');

    ffmpeg(inputFilePath)
        .output(outputFilePath)
        .on('end', () => {
            res.json({ message: 'Video converted successfully', path: outputFilePath });
        })
        .on('error', (error) => {
            res.status(500).json({ message: 'Error converting the video', error });
        })
        .run();
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

