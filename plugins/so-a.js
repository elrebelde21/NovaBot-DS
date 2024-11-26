import fs from 'fs';
import path from 'path';

const handler = async (message) => {
  let vn = './media/a.mp3';
  message.channel.send({
    files: [vn],
    message: 'Audio',
    ptt: true
  });
};
handler.help = ['a'];
handler.tags = ['audio'];
handler.customPrefix = /ª|a|A/
handler.command = /^(a|ª|A?$)/
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;