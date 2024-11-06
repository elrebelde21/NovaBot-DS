const linkRegex = /(https?:\/\/[^\s]+)/g; 

let handler = async (message, { db, isAdmin, isBotAdmin }) => {

 if (message.author.bot || !message.guild) return;

    const chat = db.data.chats[message.channel.id] || {};
    if (chat.antiLink2) {        
        const links = message.content.match(linkRegex);

        if (links) {
            if (!isBotAdmin) return await message.reply('*El bot no es admin, no puedo actuar contra los enlaces si no soy admin.*');
            
            if (isAdmin) return await message.reply('*Eres administrador, se te permite el uso de enlaces.*');
            
            await message.delete();
            const user = db.data.users[message.author.id] || {};
            user.warn = (user.warn || 0) + 1;
            db.data.users[message.author.id] = user;
            await db.write();
            await message.channel.send(`❌ <@${message.author.id}>, no puedes enviar enlaces. Advertencia: ${user.warn}`);
            
            if (user.warn >= 3) {
                await message.member.kick('Envío de enlaces no permitido');
                await message.channel.send(`🚫 <@${message.author.id}> ha sido expulsado por enviar demasiados enlaces.`);
            }
        }
    }
};

module.exports = handler;
