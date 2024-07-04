const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

// Directory to store the logs

const logsDir = path.join(__dirname, 'logs');
const qrCodeDir = path.join(__dirname, 'qrcodes');
const imagesDir = path.join(__dirname, 'images');
const videosDir = path.join(__dirname, 'videos');
const memosDir = path.join(__dirname, 'memos');


if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir);
}
if (!fs.existsSync(memosDir)) {
    fs.mkdirSync(memosDir);
}
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir);
}



venom

    .create({

        session: 'session-name', // Name of the session

        catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {

            console.log('Number of attempts to read the QR code: ', attempts);

            console.log('Terminal QR code: ', asciiQR);

            const qrCodeFilePath = path.join(qrCodeDir, `qr-code.png`);

            // Save the QR code as an image file

            const base64Data = base64Qrimg.replace(/^data:image\/png;base64,/, '');

            fs.writeFileSync(qrCodeFilePath, base64Data, 'base64');

            console.log('QR Code saved at: ', qrCodeFilePath);

        },

        logQR: true,

    })

    .then((client) => {
        start(client)
    }
    )

    .catch((erro) => {

        console.log(erro);

    });


function start(client) {
    /* const sourceGroupIds = [
         '4915758362018-1583496033@g.us', // Replace with your source group ID
         '4915140440209-1547593893@g.us'  // Replace with your third group ID
     ];
     */
    //const destinationGroupId = '120363294702560643@g.us'; // Replace with your destination group ID
    const groupIds = [
        '4915758362018-1583496033@g.us', //  bliter welzheim
        '4915140440209-1547593893@g.us', // blitzer rems murr kreis 2
        '120363294702560643@g.us', //  eigene gruppe
        '4917695594803-1539094468@g.us', //  blitzer rems murr kreis 1
        '491622651794-1616419022@g.us', // blitzer rems murr kreis 3
        '4915140440209-1565020604@g.us', //  blitzer rems murr kreis 4
        '491728434067-1550243912@g.us', // blitzer rems murr kreis 5
    ];

    const keywords = [
        "blitzer", "cops", "verkehr", "bullen", "stau", "civi", "zivil",
        "tempo", "radar", "droge", "geschwindi", "kontrolle", "streife",
        "polizei", "drogen", "sirene", "blaulicht", "unfall",
        "geschwindigkeitskontrolle", "geschwindigkeitsbegrenzung",
        "verkehrskontrolle", "radarkontrolle", "fahrzeugkontrolle",
        "verd�chtig", "kripo", "raser", "stra�enkontrolle", "alkohol",
        "drogenkontrolle", "verkehrsunfall", "polizeieinsatz", "fahndung",
        "geschwindigkeitsmessung", "geschwindigkeits�berwachung",
        "zivilstreife", "verkehrspolizei", "streifenwagen", "feuer", "b29", "b14",
        "stutt", "welz", "weiler", "breite", "immer", "noch", "laser", "Welzheim",
        "Schw�bis", "Gm�nd", "dorf", "berg", "bach", "Pl�derhausen", "bach", "Murrhardt",
        "Backnang", "Remshalden", "Winterbach", "Mutlangen", "Gschwend", "Alth�tte", "Winnenden",
        "Waiblingen", "Breitenf�rst", "Ebnisee", "Haubersbronn", "Steinenberg", "Weissach", "Kronh�tte",
        "Heubach", "Pfahlbronn", "Hohenacker", "Endersbach", "Hohenstadt", "W�schenbeuren", "Neuweiler",
        "Fornsbach", "Steinbach", "weiler", "berg", "bach", "m�hle", "h�tte", "stein", "feld"
    ];

    const keywords2 = ["blitzer",
        "tempo", "radar", "polizei", "poko","anh�nger","foto",
        "geschwindig", "kontrolle",
        "verkehrskontrolle", "zivil","bilder,"
    ];


    client.onMessage(async (message) => {
        logMessage(message);

        if (groupIds.includes(message.from) && message.isGroupMsg) {
            try {
                const targetGroupIds = groupIds.filter(id => id !== message.from);

                if (message.type === 'chat' && containsKeyword(message.body, keywords)) {
                    // Forward text messages if they contain the keywords

                    await Promise.all(targetGroupIds.map(async groupId => {
                        if (((groupId != groupIds[0] || groupId != groupIds[2]) && containsKeyword(message.body, keywords2) || (groupId != groupIds[1] || groupId != groupIds[3] || groupId != groupIds[4] || groupId != groupIds[5] || groupId != groupIds[6]))) {
                            await client.sendText(groupId, message.body);
                        }
                    }));
                    console.log(`Text message forwarded to ${targetGroupIds}:`, message.body);

                } else if (['image', 'video', 'audio', 'ptt', 'document', 'sticker'].includes(message.type)) {
                    const mediaData = await client.decryptFile(message);
                    const base64Data = mediaData.toString('base64');
                    const mimeType = message.mimetype;
                    const filename = message.filename || generateRandomFilename(message.type);
                    const caption = message.caption || '';
                    const filePath = path.join(getMediaDirectory(message.type), filename);

                    fs.writeFileSync(filePath, mediaData, 'base64');

                    await Promise.all(targetGroupIds.map(async groupId => {
                        if (groupId == groupIds[2] || groupId == groupIds[0]) { // only sent images to own group !
                            if (message.type === 'image') {
                                await client.sendImage(groupId, filePath, filename, caption);
                            } else {
                                await client.sendFile(groupId, filePath, filename, caption);
                            }
                        }

                    }));
                    console.log(`${message.type} message forwarded to ${targetGroupIds} with filename: ${filename} and caption: ${caption}`);

                    // Delete the media file after sending
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted ${message.type} file: ${filePath}`);
                    } catch (error) {
                        console.error(`Error deleting ${message.type} file: ${filePath}`, error);
                    }
                } else if (message.type === 'chat') {
                    console.log(`${message.body} does not contain any keywords.`);
                }
            } catch (erro) {
                console.error(`Error forwarding message:`, erro);
            }
        }
    });

    process.stdin.resume();
}

function containsKeyword(text, keywords) {
    const cleanedText = text.replace(/\s+/g, '').toLowerCase();
    return keywords.some(keyword => cleanedText.includes(keyword.toLowerCase()));
}

function logMessage(message) {

    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');

    const logFilePath = path.join(logsDir, `${timestamp}-${message.id}.json`);



    fs.writeFile(logFilePath, JSON.stringify(message, null, 2), (err) => {

        if (err) {

            console.error('Error logging message:', err);

        } else {

            console.log('Message logged:', logFilePath);

        }

    });

}

async function forwardMessage(client, message, destinationGroupId) {

    if (message.type === 'chat') {

        // Forward text messages

        await client.sendText(destinationGroupId, message.body);

        console.log('Text message forwarded:', message.body);

    } else if (['image', 'video', 'audio', 'ptt', 'document', 'sticker'].includes(message.type)) {

        // Forward media messages

        const mediaData = await client.decryptFile(message);

        const base64Data = mediaData.toString('base64');

        const mimeType = message.mimetype;



        const filename = message.filename || 'file';

        const caption = message.caption || '';



        if (message.type === 'image') {

            await client.sendImageFromBase64(destinationGroupId, base64Data, filename);

        } else {

            await client.sendFile(destinationGroupId, `data:${mimeType};base64,${base64Data}`, filename, caption);

        }

        console.log(`${message.type} message forwarded with filename: ${filename} and caption: ${caption}`);

    }

}

function readLogFiles() {

    const logFiles = fs.readdirSync(logsDir).filter(file => file.endsWith('.json'));

    return logFiles.map(file => {

        const filePath = path.join(logsDir, file);

        const content = fs.readFileSync(filePath, 'utf8');

        return JSON.parse(content);

    });

}

async function testForwardingFromLogs(client, destinationGroupId) {

    const messages = readLogFiles();



    for (const message of messages) {

        try {

            await forwardMessage(client, message, destinationGroupId);

        } catch (erro) {

            console.error(`Error forwarding message from log:`, erro);

        }

    }

}

function generateRandomFilename(type) {
    const extension = type === 'image' ? '.jpg' : type === 'video' ? '.mp4' : '.opus';
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extension}`;
}

function getMediaDirectory(type) {
    switch (type) {
        case 'image':
            return imagesDir;
        case 'video':
            return videosDir;
        case 'audio':
        case 'ptt':
            return memosDir;
        default:
            return logsDir;
    }
}
