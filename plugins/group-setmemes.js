let handler = async (message, { args, db, prefix, command }) => {
    const memeChannelMention = message.mentions.channels.first();
 if (!memeChannelMention) {
return message.reply(`❌ ACCIÓN MAL USADA\n\nElige un canal válido para configurar memes\n• Ejemplo: ${prefix + command} #canal (selecciona el canal)`);
    }

    db.data.settings[message.guild.id] = {
        ...db.data.settings[message.guild.id],
        memeChannelId: memeChannelMention.id
    };
    await db.write(); 
    message.reply(`🔱 Canal de memes establecido en: ${memeChannelMention}.`);
};
handler.help = ['setmemes'];
handler.tags = ['group'];
handler.command = /^setmemes$/i; 
handler.rowner = false
handler.admin = true
handler.botAdmin = true
export default handler;
