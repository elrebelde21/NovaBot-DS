const handler = async (message, { args, prefix, command }) => {

if (!args.join(' ')) return message.reply(`⚠️ 𝙴𝚂𝙲𝚁𝙸𝙱𝙰 𝙴𝙻 𝙴𝚁𝚁𝙾𝚁/𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙲𝙾𝙽 𝙵𝙰𝙻𝙻𝙰𝚂\n\n**𝙴𝙹𝙴𝙼𝙿𝙻𝙾:** ${prefix + command} los sticker no funka`);
const reportText = args.join(' ');

if (reportText.length < 8) return message.reply('✨ *Mínimo 8 caracteres para hacer el reporte*');
if (reportText.length > 1000) return message.reply('⚠️ *Máximo 1000 caracteres para hacer el reporte*');
  let teks = `┏╼╾╼⧼⧼⧼ ＲＥＰＯＲＴＥ ⧽⧽⧽╼╼╼┓
╏• *ɴᴜᴍᴇʀᴏ:* <@${message.author.id}> (${message.author.id})
╏• *ᴍᴇɴsᴀᴊᴇ:* ${reportText}
┗╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼`;
  await delay(1000);
    message.reply(`⚡ El reporte ha sido enviado a mi creador, tendrá una respuesta pronto. Si es falso, será ignorado.`);

const ownerId = '1008834879858946170'; 
  const owner = await message.client.users.fetch(ownerId);
await owner.send(teks);
};
handler.help = ['reporte', 'request'].map(v => v + ' <teks>');
handler.tags = ['main'];
handler.command = /^(report|request|reporte|bugs|bug|report-owner|reportes|reportar)$/i;
handler.exp = 30;
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));