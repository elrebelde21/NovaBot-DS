import fetch from 'node-fetch';

let handler = async (message) => {

    const nsfwChannelIdBoobs = global.db.data.settings[message.guild.id]?.nsfwChannelId;
    if (!nsfwChannelIdBoobs || message.channel.id !== nsfwChannelIdBoobs) return message.reply(`⚠️ Este comando solo se puede usar en el canal NSFW configurado: <#${nsfwChannelIdBoobs}>.`);

    const boobsImageUrl = "https://deliriussapi-oficial.vercel.app/nsfw/boobs";
    try {
        const boobsImageResponse = await fetch(boobsImageUrl);
        if (boobsImageResponse.ok) {
            const buffer = await boobsImageResponse.buffer();
            await message.channel.send({ content: "", files: [{ attachment: buffer, name: 'boobs.png' }] });
        } else {
            return message.reply("⚠️ No se pudo obtener la imagen de boobs.");
        }
    } catch (error) {
        await message.reply("Ocurrió un error al procesar tu solicitud: " + error);
    }
};
handler.help = ['boobs'];
handler.tags = ['nsfw'];
handler.command = /^(boobs)$/i;
handler.register = true
handler.rowner = false
handler.admin = false
handler.botAdmin = false
handler.limit = 1
export default handler;
