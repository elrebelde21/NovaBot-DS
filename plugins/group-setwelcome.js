let handler = async (message, { args, db, prefix, command }) => {
    const channelMention = message.mentions.channels.first();
    if (!channelMention) {
        return message.reply(`❌ ACCIÓN MAL USADA\n\nElegir un canal válido para configurar bienvenida\n• Ejemplo: ${prefix + command} #canal`);
    }
   
    db.data.settings[message.guild.id] = {
        ...db.data.settings[message.guild.id],
        welcomeChannelId: channelMention.id
    };
    await db.write(); 
    message.reply(`🔱 Canal de bienvenida establecido en: ${channelMention}.`);
};
handler.help = ['setwelcome']; 
handler.tags = ['group'];
handler.command = /^setwelcome$/i;
module.exports = handler; 