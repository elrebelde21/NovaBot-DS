const xpperdiamond = 350

const handler = async (message, { args, prefix }) => {
    const userId = message.author.id;
    const user = global.db.data.users[userId];

    if (!user) {
        return message.reply('✳️ El usuario no se encuentra en mi base de datos.');
    }

    const command = args[0]; //
    let count = command === 'buyall' ? Math.floor(user.exp / xpperdiamond) : parseInt(args[1]) || 1; 

    count = Math.max(1, count);

    if (user.exp >= xpperdiamond * count) {
        user.exp -= xpperdiamond * count; 
        user.limit += count; 
message.reply(`╔═❖ *𝙽𝙾𝚃𝙰 𝙳𝙴 𝙿𝙰𝙶𝙾*\n║‣ 𝙲𝙾𝙼𝙿𝚁𝙰: ${count}💎\n║‣ 𝙶𝙰𝚂𝚃𝙰𝙳𝙾: ${350 * count} 𝚇𝙿\n╚═══════════════`);
    } else {
        message.reply(`No tienes suficiente XP. Necesitas ${350 * count} XP para comprar ${count}💎`);
    }
};

handler.help = ['buy', 'buyall'];
handler.tags = ['econ'];
handler.command = /^(buy|buyall)$/i;
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
