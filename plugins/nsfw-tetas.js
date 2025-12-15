import fetch from 'node-fetch';

let handler = async (message) => {

    const nsfwChannelIdBoobs = global.db.data.settings[message.guild.id]?.nsfwChannelId;
    if (!nsfwChannelIdBoobs || message.channel.id !== nsfwChannelIdBoobs) return message.reply(`⚠️ Este comando solo se puede usar en el canal NSFW configurado: <#${nsfwChannelIdBoobs}>.`);

    const boobsImageUrl = "https://api.dorratz.com/nsfw/tetas";
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
handler.help = ['tetas'];
handler.desc = ['Enviar una rika tetas🥵'];
handler.tags = ['nsfw'];
handler.command = /^(tetas|teta|pechos)$/i;
handler.slash = { name: "boobs", description: "para ver unas rika tetas 🥵" };
handler.register = true
handler.limit = 1
export default handler;
