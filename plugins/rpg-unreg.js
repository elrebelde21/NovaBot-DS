import { createHash } from 'crypto';

let handler = async (message, { args, prefix, command }) => {
    if (!args[0]) {
        return message.reply(`*✳️ Ingrese número de serie, verifique su número de serie con el comando:* ${prefix + command}`);
    }

    const user = db.data.users[message.author.id];
    const sn = createHash('md5').update(message.author.id).digest('hex');

    if (args[0] !== sn) {
        return message.reply('**⚠️ 𝙽𝚄𝙼𝙴𝚁𝙾 𝙳𝙴 𝚂𝙴𝚁𝙸𝙴 𝙸𝙽𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾, 𝚄𝚂𝙰𝚁:** !myns\n\n**⚠️ 𝚆𝚁𝙾𝙽𝙶 𝚂𝙴𝚁𝙸𝙰𝙻 𝙽𝚄𝙼𝙱𝙴𝚁, 𝚄𝚂𝙴:** !myns');
    }

    user.registered = false;
    user.limit -= 8;
    user.exp -= 1000;
    user.money -= 1000;

    await message.reply('**✅ 𝚄𝚂𝚃𝙴𝙳 𝚈𝙰 𝙽𝙾 𝙴𝚂𝚃𝙰𝚂 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙰𝙳𝙾 :(**\n\n**𝚈𝙾𝚄 𝙰𝚁𝙴 𝙽𝙾 𝙻𝙾𝙽𝙶𝙴𝚁 𝚁𝙴𝙶𝙸𝚂𝚃𝙴𝚁𝙴 :(**');
};
handler.help = ['unreg'];
handler.tags = ['rg'];
handler.command = /^unreg$/i;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
