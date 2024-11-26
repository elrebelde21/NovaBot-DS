const handler = async (message, { args, prefix }) => {
    const userId = message.author.id;
    const user = global.db.data.users[userId];

if (!user) {
        return message.reply('✳️ El usuario no se encuentra en mi base de datos.');
    }

    const command = args[0]
    let who; 
    
    if (message.mentions.users.size > 0) {
        who = message.mentions.users.first().id; 
    } else {
        who = message.author.id; 
    }
    
    if (!(who in global.db.data.users)) {
        return message.reply('⚠️ El usuario mencionado no está registrado en la base de datos.');
    }
    
    const limit2 = global.db.data.users[who].limit;
    message.reply(`*${limit2} Límite restante (⁠≧⁠▽⁠≦⁠)*`);
};

handler.help = ['limit [@user]'];
handler.tags = ['econ'];
handler.command = /^(limit)$/i;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
