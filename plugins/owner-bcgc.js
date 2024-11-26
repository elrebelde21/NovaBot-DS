const handler = async (message, { args, prefix, command }) => {
    // Verificar si el canal fue mencionado
    const channelMention = message.mentions.channels.first();
    if (!channelMention) {
        return message.reply(`❌ ACCIÓN MAL USADA\n\nDebes mencionar un canal válido para enviar el comunicado\n• Ejemplo: ${prefix + command} #canal [mensaje opcional]`);
    }

    // Verificar si se ha proporcionado algún mensaje después del canal
    const comunicadoText = args.slice(1).join(' ').trim(); // Toma todo lo que sigue después del canal

    // Si no hay texto y tampoco hay archivos adjuntos, pedir que se proporcione contenido
    const files = message.attachments.map(attachment => attachment.url);
    if (!comunicadoText && files.length === 0) {
        return message.reply('⚠️ Debes proporcionar un mensaje para el comunicado o adjuntar un archivo.');
    }

    // Verificar si el texto contiene menciones como @everyone o @here
    const includeEveryone = comunicadoText.includes('@everyone') || comunicadoText.includes('@here');

    // Enviar el comunicado al canal
    try {
        await channelMention.send({
            content: includeEveryone ? comunicadoText : comunicadoText.replace(/@everyone|@here/gi, ''),
            files: files // Enviar los archivos adjuntos si existen
        });
        message.reply('✅ Comunicado enviado exitosamente.');
    } catch (error) {
        console.error('Error al enviar el comunicado:', error);
        message.reply('❌ Hubo un error al intentar enviar el comunicado.');
    }
};

handler.help = ['comunicado'];
handler.tags = ['owner'];
handler.command = /^(comunicado)$/i; 
handler.rowner = true; 

export default handler;
