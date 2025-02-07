const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

// Directory setup
const directories = ['logs', 'qrcodes', 'images', 'videos', 'memos'];
directories.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const groupCategories = {
    "blitzer_rems_murr": [
        '4915140440209-1547593893@g.us',
        '4917695594803-1539094468@g.us',
        '491622651794-1616419022@g.us',
        '4915140440209-1565020604@g.us',
        '4915140440209-1589031006@g.us'
    ],
    "goeppingen": [
        '4917610758670-1496266654@g.us',
        '4915224759700-1500215874@g.us',
        '4915207149404-1528531975@g.us',
        '4915224759700-1540468424@g.us',
        '4915224759700-1541342346@g.us',
        '4915224759700-1520799152@g.us',
        '4915224759700-1510511994@g.us'
    ],
    "esslingen": [
        '4917610758670-1492209414@g.us',
        '4915207149404-1498196358@g.us',
        '4915207149404-1511851066@g.us',
        '4915224759700-1507059954@g.us',
        '4915224759700-1500329085@g.us',
        '4915224759700-1515601183@g.us',
        '4915207149404-1519339843@g.us',
        '4917610758670-1488803942@g.us'
    ]
};

const keywords2 = ["blitzer", "tempo", "radar", "polizei", "poko", "anhänger", "foto",
    "geschwindig", "kontrolle", "verkehrskontrolle", "zivil", "bilder", "pk", "container", "läster", "bitzer",
    "laser", "kasten", "box", "30", "70", "80", "100", "120", "bus", "schritt", "b29", "b14"
];
const keywords3 = ["löschen", "beobachtet","löschen"];


let lastMessages = {};

venom.create({
    session: 'session-name',
    catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log('Number of attempts to read the QR code: ', attempts);
        console.log('Terminal QR code: ', asciiQR);
        const qrCodeFilePath = path.join('qrcodes', `qr-code.png`);
        fs.writeFileSync(qrCodeFilePath, base64Qrimg.replace(/^data:image\/png;base64,/, ''), 'base64');
        console.log('QR Code saved at: ', qrCodeFilePath);
    },
    debug: false,
    logQR: true,
}).then(client => {
    start(client);
}).catch(error => {
    console.log(error);
});

function start(client) {
    client.onMessage(async (message) => {
        try {
            for (const category in groupCategories) {
                if (groupCategories[category].includes(message.from)) {
                    if (!lastMessages[category]) {
                        lastMessages[category] = [];
                    }

                    if (message.type === 'chat' && containsKeyword(message.body, keywords2) && !containsKeyword(message.body, keywords3) && !isDuplicateMessage(category, message.body)) {
                        updateLastMessages(category, message.body); // Add message before forwarding
                        console.log('----------------START MESSAGE-------(' + category + ')---------------------');
                        console.log('Current lastMessages:', lastMessages[category]);

                        const targetGroupIds = groupCategories[category].filter(id => id !== message.from);
                        await Promise.all(targetGroupIds.map(async groupId => {
                            if (checkIfPass(groupId, message.body, message.from, message.author)) {
                                await client.sendText(groupId, message.body);
                                console.log(`Text message forwarded to ${groupId}:`, message.body);
                            }
                        }));
                        console.log('----------------END MESSAGE----------------------------');
                    }
                }
            }
        } catch (e) {
            console.error('Error handling message:', message.body);
        }
    });
    process.stdin.resume();
}

function normalizeMessage(message) {
    return message.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 25);
}

function isDuplicateMessage(category, message) {
    const normalizedMessageCurrent = normalizeMessage(message);
    return lastMessages[category]?.some(msg => msg === normalizedMessageCurrent);
}

function updateLastMessages(category, newMessage) {
    const normalizedMessage = normalizeMessage(newMessage);
    lastMessages[category].push(normalizedMessage);
    if (lastMessages[category].length > 30) {
        lastMessages[category].shift();
    }
}

function checkIfPass(empfaenger, message, sender, author) {
    return author !== "491717560044@c.us"; // Rolli schickt alle selbst ab!
}

function containsKeyword(text, keywords) {
    const cleanedText = text.replace(/\s+/g, '').toLowerCase();
    return keywords.some(keyword => cleanedText.includes(keyword.toLowerCase()));
}
