let handler = async (message, { prefix, command, text}) => {
if (!text) return message.reply(`*INGRESE EL TEXTO DE LO QUE QUIERE BUSCAR?*\n\n${prefix + command} que es un bot?`);
let syst = `Actuaras como un Bot de Discord el cual fue creado por [elrebelde21](https://facebook.com/elrebelde21), tu seras NovaBot.`
await message.channel.sendTyping(); 
try {
let gpt = await fetch(`https://api.delirius.store/ia/gptprompt?text=${text}?&prompt=${syst}`);
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
handler.desc = ['hablar con la IA (ChatGPT)'];
handler.tags = ['buscadores'];
handler.command = /^(ia|chatgpt)$/i;
handler.register = true
export default handler;
