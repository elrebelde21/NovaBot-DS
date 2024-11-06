let handler = async (message, { args, prefix, command }) => {
    const farewellChannelMention = message.mentions.channels.first();
    if (!farewellChannelMention) {
        return message.reply(`❌ ACCIÓN MAL USADA\n\nElegir un canal válido para configurar la despedida\n• Ejemplo: ${prefix + command} #canal`);
    }
   
    db.data.settings[message.guild.id] = {
        ...db.data.settings[message.guild.id],
        farewellChannelId: farewellChannelMention.id
    };
    await db.write(); 
    message.reply(`🔱 Canal de despedida establecido en: ${farewellChannelMention}.`);
};
handler.help = ['setbye'];
handler.tags = ['group'];
handler.command = /^setbye$/i; 
module.exports = handler; 
