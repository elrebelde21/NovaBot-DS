const handler = async (message, args, { db, isOwner }) => {

if (!isOwner || !isOwner.includes(message.author.id)) {
return message.channel.send('❌ Este comando solo es para los propietarios del bot.');
}

const userMention = message.mentions.users.first(); 
if (userMention) {
return message.channel.send(`${userMention.id}`);
} else {       
return message.channel.send('⚠️ Por favor menciona a un usuario para obtener su ID.');
}};
handler.help = ['id'];
handler.tags = ['info'];
handler.command = /^id$/i;

export default handler;
