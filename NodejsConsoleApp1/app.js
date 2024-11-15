const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

// Directory setup
const directories = ['logs', 'qrcodes', 'images', 'videos', 'memos'];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const groupIds = [
    '4915758362018-1583496033@g.us',
    '4915140440209-1547593893@g.us',
    '120363294702560643@g.us',
    '4917695594803-1539094468@g.us',
    '491622651794-1616419022@g.us',
    '4915140440209-1565020604@g.us',
    '4915140440209-1589031006@g.us'
];

const keywords = [
    "blitzer", "cops", "verkehr", "bullen", "stau", "civi", "zivil",
    "tempo", "radar", "droge", "geschwindi", "kontrolle", "streife",
    "polizei", "drogen", "sirene", "blaulicht", "unfall",
    "geschwindigkeitskontrolle", "geschwindigkeitsbegrenzung",
    "verkehrskontrolle", "radarkontrolle", "fahrzeugkontrolle",
    "verdächtig", "kripo", "raser", "straßenkontrolle", "alkohol",
    "drogenkontrolle", "verkehrsunfall", "polizeieinsatz", "fahndung",
    "geschwindigkeitsmessung", "geschwindigkeitsüberwachung",
    "zivilstreife", "verkehrspolizei", "streifenwagen", "feuer", "b29", "b14",
    "stutt", "welz", "weiler", "breite", "immer", "noch", "laser", "Welzheim",
    "Schwäbis", "Gmünd", "dorf", "berg", "bach", "Plüderhausen", "bach", "Murrhardt",
    "Backnang", "Remshalden", "Winterbach", "Mutlangen", "Gschwend", "Althütte", "Winnenden",
    "Waiblingen", "Breitenfürst", "Ebnisee", "Haubersbronn", "Steinenberg", "Weissach", "Kronhütte",
    "Heubach", "Pfahlbronn", "Hohenacker", "Endersbach", "Hohenstadt", "Wäschenbeuren", "Neuweiler",
    "Fornsbach", "Steinbach", "weiler", "berg", "bach", "mühle", "hütte", "stein", "feld", "??", "tunnel", "gesperrt", "??", "??", "30", "70", "80", "100", "120", "bus", "b29", "b14","100"
];

const keywords2 = ["blitzer", "tempo", "radar", "polizei", "poko", "anhänger", "foto",
    "geschwindig", "kontrolle", "verkehrskontrolle", "zivil", "bilder", "pk", "container",
    "laser", "kasten", "box", "??", "??", "30", "70", "80", "100", "120", "bus", "schritt", "b29", "b14"
];

let lastMessages = [];
let lastContentMessages = [];

venom.create({
    session: 'session-name',
    catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log('Number of attempts to read the QR code: ', attempts);
        console.log('Terminal QR code: ', asciiQR);

        const qrCodeFilePath = path.join('qrcodes', `qr-code.png`);
        const base64Data = base64Qrimg.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(qrCodeFilePath, base64Data, 'base64');
        console.log('QR Code saved at: ', qrCodeFilePath);
    },
    logQR: true,
}).then(client => {
    start(client);
}).catch(error => {
    console.log(error);
});

function start(client) {
    client.onMessage(async (message) => {
        if (groupIds.includes(message.from) && message.isGroupMsg) {
            const isSenderWelzheim = message.from === groupIds[0] || message.from === groupIds[2];
            try {
                const targetGroupIds = groupIds.filter(id => id !== message.from);

                if (message.type === 'chat' && !isDuplicateMessage(message.body)) {
                    console.log('----------------START MESSAGE----------------------------');
                    console.log('Current lastMessages:', lastMessages);

                    await Promise.all(targetGroupIds.map(async groupId => {
                        if (checkIfPass(groupId, message.body, message.from, message.author) && !isDuplicateMessage(message.body)) {
                            await client.sendText(groupId, message.body);
                            console.log(`Text message forwarded to ${groupId}:`, message.body);
                            updateLastMessages(message.body);
                        }
                    }));

                    console.log('Current lastMessages after update:', lastMessages);
                    console.log('----------------END MESSAGE----------------------------');
                } else if (['image', 'video', 'audio', 'ptt', 'document', 'sticker'].includes(message.type)) {
                    if (!isDuplicateContent(message) && isSenderWelzheim) {
                        const mediaData = await client.decryptFile(message);
                        const filename = message.filename || generateRandomFilename(message.type);
                        const caption = message.caption || '';
                        const filePath = path.join(getMediaDirectory(message.type), filename);

                        fs.writeFileSync(filePath, mediaData, 'base64');

                        await Promise.all(targetGroupIds.map(async groupId => {
                            if (groupId !== message.from && (groupId === groupIds[2] || groupId === groupIds[0])) {
                                if (message.type === 'image') {
                                    await client.sendImage(groupId, filePath, filename, caption);
                                } else {
                                    await client.sendFile(groupId, filePath, filename, caption);
                                }
                                console.log(`${message.type} message forwarded to ${groupId} with filename: ${filename} and caption: ${caption}`);
                            }
                        }));

                        fs.unlinkSync(filePath);
                        console.log(`Deleted ${message.type} file: ${filePath}`);
                        addContentMessageToList(message);
                    }
                } else if (message.type === 'chat') {
                    console.log(`${message.body} does not contain any keywords.`);
                }
            } catch (error) {
                console.error('Error forwarding message:', error);
            }
        }
    });
    process.stdin.resume();
}

function normalizeMessage(message) {
    return message.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 25);
}

function isDuplicateMessage(message) {
    const normalizedMessageCurrent = normalizeMessage(message);
    return lastMessages.some(msg => normalizeMessage(msg) === normalizedMessageCurrent);
}

function isDuplicateContent(message) {
    return lastContentMessages.some(msg => msg.type === message.type && msg.sender === message.author);
}

function addContentMessageToList(message) {
    if (lastContentMessages.length > 6) {
        lastContentMessages.shift();
    }
    lastContentMessages.push({ type: message.type, sender: message.author });
}

function updateLastMessages(newMessage) {
    const normalizedMessage = normalizeMessage(newMessage);
    lastMessages.push(normalizedMessage);
    if (lastMessages.length > 20) {
        lastMessages.shift();
    }
}

function checkIfPass(empfaenger, message, sender, author) {
    const isSenderWelzheim = sender === groupIds[0] || sender === groupIds[2];
    const isEmpfaengerWelzheim = empfaenger === groupIds[0] || empfaenger === groupIds[2];

    if (sender !== empfaenger) {
        if (isSenderWelzheim && isEmpfaengerWelzheim && containsKeyword(message, keywords)) {
            return true;
        } else if (!isSenderWelzheim && empfaenger !== groupIds[0] && !containsKeyword(message, ["lösch", "entfernen", "unnötig"]) && containsKeyword(message, keywords2)) {
            if (author !== "491717560044@c.us" || isEmpfaengerWelzheim) {
                return true;
            } else {
                console.error('Rolli is writing to all groups itself');
                return false;
            }
        }
    }
    return false;
}

function containsKeyword(text, keywords) {
    const cleanedText = text.replace(/\s+/g, '').toLowerCase();
    return keywords.some(keyword => cleanedText.includes(keyword.toLowerCase()));
}

function generateRandomFilename(type) {
    const extensions = { 'image': '.jpg', 'video': '.mp4', 'audio': '.opus', 'ptt': '.opus' };
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extensions[type] || ''}`;
}

function getMediaDirectory(type) {
    const directories = { 'image': 'images', 'video': 'videos', 'audio': 'memos', 'ptt': 'memos' };
    return directories[type] || 'logs';
}
