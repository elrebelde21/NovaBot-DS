const handler = async (message, args, { db }) => {
  const farewellChannelMention = message.mentions.channels.first();
 if (!farewellChannelMention) {
    return message.channel.send(`❌ ACCIÓN MAL USADA\n\nElige un canal válido para configurar la despedida\n• Ejemplo: #setbye #canal (selecciona el canal)`);
  }

  db.run(
    `INSERT OR REPLACE INTO settings (guildId, farewellChannelId) VALUES (?, ?)`,
    [message.guild.id, farewellChannelMention.id],
    (err) => {
      if (err) {
        console.error('❌ Error:', err.message);
        return message.channel.send('❌ Hubo un error al guardar el canal de despedida.');
      }
      message.channel.send(`🔱 Canal de despedida establecido en: ${farewellChannelMention}.`);
    }
  );
};
handler.help = ['setbye'];
handler.tags = ['config'];
handler.command = /^setbye$/i;

export default handler;
