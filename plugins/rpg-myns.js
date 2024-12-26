import { createHash } from 'crypto';

let handler = async (message) => {
    let sn = createHash('md5').update(message.author.id).digest('hex');
await message.reply(`⬇️ **ESE ES SU NUMERO DE SERIE** ⬇️`);
await message.reply(sn) 
};
handler.help = ['myns'];
handler.tags = ['rg'];
handler.command = /^myns$/i;
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
