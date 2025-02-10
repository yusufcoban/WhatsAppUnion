const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

// Directory setup
const directories = ['logs', 'qrcodes', 'images', 'videos', 'memos'];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const groupIds = {
    welzheim: '4915758362018-1583496033@g.us', // bliter welzheim
    eigene: '120363294702560643@g.us', // eigene gruppe
    remsMurr: '4915140440209-1547593893@g.us', // blitzer rems murr kreis 2
};

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
    "stutt", "welz", "weiler", "breite", "laser", "Welzheim",
    "Gmünd", "dorf", "berg", "bach", "Plüderhausen", "Murrhardt",
    "Backnang", "Remshalden", "Winterbach", "Mutlangen", "Gschwend", "Althütte", "Winnenden",
    "Waiblingen", "Breitenfürst", "Ebnisee", "Haubersbronn", "Steinenberg", "Weissach", "Kronhütte",
    "Heubach", "Pfahlbronn", "Hohenacker", "Endersbach", "Hohenstadt", "Wäschenbeuren", "Neuweiler",
    "Fornsbach", "Steinbach", "mühle", "hütte", "stein", "feld", "tunnel", "gesperrt", "30", "70", "80", "100", "120", "bus"
];

venom.create({
    session: 'session-name',
    catchQR: (base64Qrimg, asciiQR, attempts) => {
        console.log('QR Code attempts:', attempts);
        console.log('QR Code:', asciiQR);
        const qrCodeFilePath = path.join('qrcodes', 'qr-code.png');
        fs.writeFileSync(qrCodeFilePath, base64Qrimg.replace(/^data:image\/png;base64,/, ''), 'base64');
        console.log('QR Code saved at:', qrCodeFilePath);
    },
    debug: false,
    logQR: true,
}).then(client => start(client)).catch(console.error);

function start(client) {
    client.onMessage(async (message) => {
        if (message.isGroupMsg && Object.values(groupIds).includes(message.from)) {
            let targetGroup = groupIds.eigene;
            if (message.from === groupIds.eigene) {
                targetGroup = groupIds.welzheim;
            }
            if (checkIfPass(message.body)) {
                await client.sendText(targetGroup, message.body);
            } else if (['image', 'video', 'audio', 'ptt', 'document', 'sticker'].includes(message.type)) {
                const mediaData = await client.decryptFile(message);
                const filename = message.filename || generateRandomFilename(message.type);
                const filePath = path.join(getMediaDirectory(message.type), filename);
                fs.writeFileSync(filePath, mediaData, 'base64');

                await client.sendFile(targetGroup, filePath, filename, message.caption || '');
                fs.unlinkSync(filePath);
            }
        }
    });
    process.stdin.resume();
}

function checkIfPass(message) {
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
}

function generateRandomFilename(type) {
    const extensions = { 'image': '.jpg', 'video': '.mp4', 'audio': '.opus', 'ptt': '.opus' };
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extensions[type] || ''}`;
}

function getMediaDirectory(type) {
    const directories = { 'image': 'images', 'video': 'videos', 'audio': 'memos', 'ptt': 'memos' };
    return directories[type] || 'logs';
}
