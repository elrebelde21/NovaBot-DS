const linkRegex = /https?:\/\/(?:www\.)?discord\.(?:com|gg)\/[^\s]+/gi;

let handler = async (message, { db, isAdmin, isBotAdmin }) => {
if (message.author.bot || !message.guild) return;
const chat = db.data.chats[message.channel.id] || {};

if (chat.antiLink) {        
const links = message.content.match(linkRegex);

if (links) {
if (!isBotAdmin) return await message.reply(`**⚠️ *El bot necesita ser admin para eliminar al intruso...**`);
if (isAdmin) return await message.reply(`**Te salvaste, gil, eres admin.**`);
                
await message.delete();
const user = db.data.users[message.author.id] || {};
user.warn = (user.warn || 0) + 1;
db.data.users[message.author.id] = user;
await db.write();
await message.reply(`⚠️ **Advertencia ${user.warn}/2** No está permitido enviar enlaces de Discord, <@${message.author.id}>.`);
if (user.warn >= 2) {
await message.member.kick('⚠️ Envío de enlaces no permitido');
await message.reply(`**『 ＡＮＴＩＬＩＮＫ 』**\n\nEl usuario <@${message.author.id}> acaba de mandan un enlace, esta prohibido enviar links de otros servidores de Discord...`);
            }
        }
    }
};

export default handler;