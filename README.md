Here is a description of the project and installation instructions for GitHub:

### Project Description

This project uses Venom-Bot to automate forwarding messages between WhatsApp groups. It monitors specified source groups for messages containing certain keywords and forwards these messages to other specified groups. The bot also handles different types of media messages, including text, images, videos, audio, documents, and stickers.

Text messages are filtered by a list of keywords which can be found in app.js. The list is not the best snd has some critical redunance. BUT GIVE A FUCK. It works and i hope it helps out. Misuse for personal purposes are also possible with this. 
(save oneview pictures and prevent from deleting,...)

### Features

- Monitors specified WhatsApp groups for messages containing specific keywords.
- Forwards messages containing keywords to other specified groups.
- Handles different types of media messages (text, image, video, audio, document, sticker).
- Logs all messages to JSON files for auditing and debugging purposes.
- Deletes temporary media files after forwarding.

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Instructions

1. **Clone the Repository**

   ```sh
   git clone [https://github.com/yourusername/whatsapp-group-forwarder.git](https://github.com/yusufcoban/WhatsAppUnion.git)****
   cd whatsapp-group-forwarder
   ```

2. **Install Dependencies**

   Run the following command to install the necessary npm packages:

   ```sh
   npm install
   ```

3. **Run the Bot**

   Start the bot using the following command:

   ```sh
   node index.js
   ```

4. **Scan the QR Code**

   When you run the bot for the first time, you will need to scan a QR code to authenticate the session with your WhatsApp account. The QR code will be saved as an image file in the `qrcodes` directory.

### Directory Structure

- `logs/`: Directory where message logs are stored as JSON files.
- `qrcodes/`: Directory where QR code images are saved for authentication.
- `images/`: Directory for storing temporary image files.
- `videos/`: Directory for storing temporary video files.
- `memos/`: Directory for storing temporary audio and PTT files.

### Usage

The bot listens for messages in specified WhatsApp groups and forwards messages containing any of the predefined keywords to other groups. It also logs all received messages to the `logs` directory.

### Contribution

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
 
