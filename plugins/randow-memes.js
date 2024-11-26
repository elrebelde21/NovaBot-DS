import hispamemes from 'hispamemes';

let handler = async (message) => {
    try {
        const memeUrl = await hispamemes.meme(); 
        await message.channel.send({ content: "🤣 Memes 🤣", files: [memeUrl] }); 
    } catch (error) {
        console.error('Error al obtener el meme:', error);
        await message.reply('❌ Error:\n\n' + error);
    }
};

handler.command = /^memes$/i; 
handler.register = true
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
