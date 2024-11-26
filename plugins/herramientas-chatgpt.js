let handler = async (message, { prefix, command, text}) => {
if (!text) return message.reply(`*INGRESE EL TEXTO DE LO QUE QUIERE BUSCAR?*\n\n${prefix + command} que es un bot?`);
await message.channel.sendTyping(); 
try {
let gpt = await fetch(`https://deliriussapi-oficial.vercel.app/ia/chatgpt?q=${encodeURIComponent(text)}`);
        let res = await gpt.json();
        if (res.data) {
            await message.reply(res.data);
        } else {
            await message.reply('❌ No se obtuvo respuesta de la API.');
        }
    } catch (error) {
        console.error(error);
        message.reply('❌ Error al comunicarse con la API\n.' + error);
    }
};
handler.help = ['chatgpt'];
handler.tags = ['tools'];
handler.command = /^(ia|chatgpt)$/i;
handler.register = true
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
