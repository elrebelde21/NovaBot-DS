import { isUrl } from '../libs/fuctions.js';
import { Tiktok } from '../libs/tiktok.js';

let handler = async (message, { args, prefix, command }) => {
if (!args[0]) {
return message.reply(`Ejemplo:\n${prefix + command} https://vm.tiktok.com/ZMjdrFCtg/`);
}
if (!isUrl(args[0]) && !args[0].includes('tiktok')) {
return message.reply(`Link inválido!!`)
}

await message.reply(`${message.author}, espere...`);
    try {
        const data = await Tiktok(args);
        if (data.nowm && data.audio) {
            await message.channel.send({
                content: '✨ Aquí tienes el video de TikTok',
                files: [{ attachment: data.nowm, name: `${data.title}.mp4` }]
            });
            await message.channel.send({
                content: 'Aquí tienes el audio del video ✅',
                files: [{ attachment: data.audio, name: `${data.title}.mp3` }]
            });
       handler.limit = 1     
        } else {
            message.reply('❌ No se encontró video o audio en el enlace proporcionado.');
        }
    } catch (error) {
        console.error(error);
        message.reply('❌ Error al obtener el video de TikTok\n' + error);
    }
};
handler.help = ['tiktok'];
handler.tags = ['downloader'];
handler.command = /^(tiktok)$/i; 
handler.register = true
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
