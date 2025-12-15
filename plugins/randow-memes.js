import hispamemes from 'hispamemes';

let handler = async (message) => {
    try {
        const memeUrl = await hispamemes.meme(); 
        await message.channel.send({ content: "🤣 Memes 🤣", files: [memeUrl] }); 
    } catch (error) {
        await message.reply('❌ Error:\n\n' + error);
        console.log(error) 
    }
};
handler.help = ['memes'];
handler.desc = ['enviar un memes'];
handler.tags = ['randow'];
handler.command = /^memes$/i; 
handler.slash = { name: "memes", description: "enviar un memes" };
handler.register = true
export default handler;
