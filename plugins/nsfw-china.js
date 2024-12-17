import fetch from 'node-fetch';

let handler = async (message) => {
const nsfwChannelIdChina = global.db.data.settings[message.guild.id]?.nsfwChannelId;
    if (!nsfwChannelIdChina || message.channel.id !== nsfwChannelIdChina) return message.reply(`⚠️ Este comando solo se puede usar en el canal NSFW configurado: <#${nsfwChannelIdChina}>.`);

    const chinaImageUrl = "https://deliriussapi-oficial.vercel.app/nsfw/corean";
    try {
        const chinaImageResponse = await fetch(chinaImageUrl);
        if (chinaImageResponse.ok) {
            const buffer = await chinaImageResponse.buffer();
            await message.channel.send({ content: "", files: [{ attachment: buffer, name: 'china.png' }] });
        } else {
            return message.reply("⚠️ No se pudo obtener la imagen de China.");
        }
    } catch (error) {
        await message.reply("Ocurrió un error al procesar tu solicitud: " + error);
    }
};
handler.help = ['china'];
handler.tags = ['nsfw'];
handler.command = /^(china)$/i;
handler.register = true
handler.rowner = false
handler.admin = false
handler.botAdmin = false
handler.limit = 1
export default handler;
