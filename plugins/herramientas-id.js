let handler = async (message, { args, prefix, command }) => {
const userMention = message.mentions.users.first(); 
    if (userMention) {
        message.reply(`${userMention.id}`);
    } else {
        message.reply('⚠️ Por favor menciona a un usuario para obtener su ID.');
    }
};
handler.help = ['id'];
handler.tags = ['tools'];
handler.command = /^id$/i;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
