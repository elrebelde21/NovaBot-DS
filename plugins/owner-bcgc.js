const handler = async (message, { args, prefix, command }) => {
    const channelMention = message.mentions.channels.first();
    if (!channelMention) {
        return message.reply(`❌ ACCIÓN MAL USADA\n\nDebes mencionar un canal válido para enviar el comunicado\n• Ejemplo: ${prefix + command} #canal (mensaje)`);
    }

    const comunicadoText = args.slice(1).join(' ').trim(); 
    const files = message.attachments.map(attachment => attachment.url);
 if (!comunicadoText && files.length === 0) return message.reply('⚠️ Debes proporcionar un mensaje para el comunicado o adjuntar un archivo.');
  
    const includeEveryone = comunicadoText.includes('@everyone') || comunicadoText.includes('@here');

    try {
        await channelMention.send({
            content: includeEveryone ? comunicadoText : comunicadoText.replace(/@everyone|@here/gi, ''),
            files: files });
        message.reply('✅ Comunicado enviado exitosamente.');
    } catch (error) {
    message.reply('❌ Hubo un error al intentar enviar el comunicado.');
     console.error('Error al enviar el comunicado:', error);           
    }
};

handler.help = ['comunicado'];
handler.tags = ['owner'];
handler.command = /^(comunicado)$/i; 
handler.rowner = true; 

export default handler;
