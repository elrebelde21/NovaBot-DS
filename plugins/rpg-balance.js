const handler = async (message, { args, prefix }) => {
    const userMention = message.mentions.users.first() || message.author;
    const userId = userMention.id;
    const user = global.db.data.users[userId];
    
    if (!user) {
        return message.reply('✳️ El usuario no se encuentra en mi base de datos.');
    }
    
    const textoo = `╭━〔 🔖 *BALANCE* 〕━⬣
┃ *USUARIO(A) | USER*
┃ <@${userId}>
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ *${user.limit} Diamantes* 💎
┃ *${user.exp} Exp ⬆️*
┃ *${user.money} Coins 🪙*
╰━━━━〔 *𓃠 ${vs}* 〕━━━⬣\n
*COMPRAR DIAMANTES CON EXP*
${prefix}buy *cantidad*
${prefix}buyall *cantidad*`;

    message.reply({ content: textoo, allowedMentions: { users: [userId] } });
};

handler.help = ['balance'];
handler.tags = ['econ'];
handler.command = /^(bal|diamantes|diamond|balance)$/i;
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
