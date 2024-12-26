let handler = async (message, { args, db, prefix, command }) => {
const isEnable = /true|enable|(turn)?on|1/i.test(command);
let settings = db.data.settings[message.guild.id] || {};
    let chat = db.data.chats[message.channel.id] || {};
    const user = db.data.users[message.author.id] || {};

    const type = (args[0] || '').toLowerCase();
    let isAll = false;
    let isUser = false;

    switch (type) {
        case 'welcome':
            if (!message.guild) {
                return message.reply("❌ Solo se puede usar en grupos.");
            }
            settings.welcome = isEnable;
            break;

        case 'antilink': case 'antiDiscord': 
            if (message.guild) {
                chat.antiLink = isEnable;
            }
            break;

case 'antilink2':
            if (message.guild) {
chat.antiLink2 = isEnable;
}
break

        default:
            return message.reply(`
Lista de opciones: welcome | antilink | antilink2

Ejemplo:
${prefix + command} welcome
${prefix + command} welcome
`.trim());
    }

    db.data.settings[message.guild.id] = chat;
    await db.write();

    message.reply(`
*${type}* *${isEnable ? 'activada' : 'desactivada'}* para este chat.
`.trim());
};

handler.help = ['enable', 'disable'].map(v => v + ' <opción>');
handler.tags = ['group'];
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|[01])$/i;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
