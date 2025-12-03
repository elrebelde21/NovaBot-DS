const linkRegex = /https?:\/\/(?:www\.)?discord\.(?:gg|com|io|me|gift)\/[^\s]+|discord\.gg\/[^\s]+/gi;

export const before = async (message, { db, isAdmin, isBotAdmin }) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content) return;

  if (!db?.data) return;
  if (!db.data.chats) db.data.chats = {};
  if (!db.data.users) db.data.users = {};

  const chat = db.data.chats[message.channel.id];
  if (!chat?.antiLink) return;

  const links = message.content.match(linkRegex);
  if (!links) return;

  if (!isBotAdmin) return await message.reply('⚠️ Necesito ser admin para eliminar enlaces.');
  if (isAdmin) return await message.reply('Te salvaste por ser admin 😏');

  try {
    await message.delete();
  } catch (e) {
    console.log('No pude borrar el mensaje (falta permiso)');
  }

  const user = db.data.users[message.author.id] || {};
  user.warn = (user.warn || 0) + 1;
  db.data.users[message.author.id] = user;
  await db.write();

  await message.channel.send(`⚠️ **Advertencia ${user.warn}/2**\nNo envíes enlaces de Discord, <@${message.author.id}>!`);

  if (user.warn >= 2) {
    try {
      await message.member.kick('Envío de enlaces prohibidos (antilink)');
      await message.channel.send(`**『 ＡＮＴＩＬＩＮＫ 』**\nEl usuario <@${message.author.id}> fue expulsado por enviar enlaces prohibidos.`);
    } catch (e) {
      await message.channel.send(`No pude expulsar a <@${message.author.id}> (falta permiso o rol más alto)`);
    }
    
    user.warn = 0;
    await db.write();
  }
};