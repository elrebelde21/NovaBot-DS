import google from 'google-it';

let handler = async (message, args, prefix, command, text) => {
  
  if (!text) {
return message.reply(`❌ Uso incorrecto\n\n*Ejemplo:* ${prefix + command} gata`);
    }

    try {
        const res = await google({ query: text });
        let response = `🔍 **Resultados de Google para:** ${text}\n\n`;
        
        for (let g of res) {
            response += `**• Título:** ${g.title}\n`;
            response += `**• Descripción:** ${g.snippet}\n`;
            response += `**• Link:** ${g.link}\n\n━━━━━━━━━━━━━━━━━━━━\n\n`;
        }
        
        message.reply(response);
    } catch (err) {
        console.error('Error al buscar en Google:', err);
        message.reply('❌ Hubo un error al realizar la búsqueda.');
    }
};
handler.help = ['google'];
handler.tags = ['downloader'];
handler.command = /^google$/i; 
handler.register = true
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
