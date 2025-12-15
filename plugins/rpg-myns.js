import { createHash } from 'crypto';

let handler = async (message) => {
    let sn = createHash('md5').update(message.author.id).digest('hex');
await message.reply(`⬇️ **ESE ES SU NUMERO DE SERIE** ⬇️`);
await message.reply(sn) 
};
handler.help = ['myns'];
handler.tags = ['rg'];
handler.desc = ['para obtener tu numero de serie'];
handler.command = /^myns$/i;
handler.slash = { name: "myns", description: "para obtener tu numero de serie" };
handler.register = true;
export default handler;
