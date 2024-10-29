const handler = async (message, args, { db }) => {
  const channelMention = message.mentions.channels.first();
  if (!channelMention) {
    return message.channel.send(`❌ ACCIÓN MAL USADA\n\nElige un canal válido para configurar la bienvenida\n• Ejemplo: #setwelcome #canal (selecciona el canal)`);
  }

  db.run(`INSERT OR REPLACE INTO settings (guildId, welcomeChannelId) VALUES (?, ?)`, [message.guild.id, channelMention.id], (err) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return message.channel.send('❌ Hubo un error al guardar el canal de bienvenida.');
    }
    message.channel.send(`🔱 Canal de bienvenida establecido en: ${channelMention}.`);
  });
};

handler.help = ['setwelcome'];
handler.tags = ['grupos'];
handler.command = /^setwelcome$/i;
export default handler;
