let handler = async (message, { args, db, prefix, command }) => {
    const nsfwChannelMention = message.mentions.channels.first();
    if (!nsfwChannelMention) {
        return message.reply(`❌ ACCIÓN MAL USADA\n\nElegir un canal válido para configurar el canal NSFW\n• Ejemplo: ${prefix + command} #canal`);
    }

    db.data.settings[message.guild.id] = {
        ...db.data.settings[message.guild.id],
        nsfwChannelId: nsfwChannelMention.id
    };
    await db.write(); 
    message.reply(`🔞 Canal NSFW establecido en: ${nsfwChannelMention}.`);
};
handler.help = ['setnsfw'];
handler.tags = ['group'];
handler.command = /^setnsfw$/i; 
handler.rowner = false
handler.admin = true
handler.botAdmin = true
export default handler;
