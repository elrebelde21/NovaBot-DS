import { canLevelUp, xpRange } from '../libs/levelling.js';
import { levelup } from '../libs/canvas.js';
import { promises } from 'fs';
import { join } from 'path';

let handler = async (message, { args, prefix, command, isOwner, isAdmin, __dirname }) => {
  const userId = message.author.id;
  const user = global.db.data.users[userId];
  
  if (!user) {
    return message.reply('✳️ El usuario no se encuentra en la base de datos.');
  }

  const { exp, level, role } = user;
  const { min, xp, max } = xpRange(level, global.multiplier);
  
  let d = new Date();
  let locale = 'es';
  let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5];
  let week = d.toLocaleDateString(locale, { weekday: 'long' });
  let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });

  let totalreg = Object.keys(global.db.data.users).length;
  let rtotalreg = Object.values(global.db.data.users).filter(u => u.registered == true).length;

  let replace = {
    '%': '%',
    p: prefix,
    uptime: '', // Add uptime calculation if necessary
    me: conn.user.username,
    exp: exp - min,
    maxexp: xp,
    totalexp: exp,
    xp4levelup: max - exp,
    level,
    weton,
    week,
    date,
    dateIslamic,
    time,
    totalreg,
    rtotalreg,
    role,
    readmore: ''
  };

  let text = `╭━━━[ *𝙉𝙄𝙑𝙀𝙇 | 𝙇𝙀𝙑𝙀𝙇* ]━━━━⬣
┃ *NIVEL:* ${level}
┃ *RANGO:* ${role}
┃ *XP:* ${exp - min}/${xp}
╰━━━⬣ Te falta ${max - exp} de XP para subir de nivel.`;

  if (!canLevelUp(level, exp, global.multiplier)) {
    return message.reply(text);
  }

  let before = level;
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;

  if (before !== user.level) {
    const newLevel = user.level;
    const str = `╭━━━[ *𝙉𝙄𝙑𝙀𝙇 | 𝙇𝙀𝙑𝙀𝙇* ]━━━━⬣
┃ *NIVEL ANTERIOR:* ${before}
┃ *NIVEL ACTUAL:* ${newLevel}
┃ *RANGO:* ${role}
┃ *FECHA:* ${new Date().toLocaleString()}
╰━━━━⬣ ¡Felicidades ${message.author.username}, ahora eres nivel ${newLevel}!`;

    try {
      const img = await levelup(message.author.username, newLevel);
      await message.channel.send({ content: str, files: [{ attachment: img, name: 'levelup.jpg' }] });
    } catch (error) {
      message.reply(str);
    }
  }
};

handler.help = ['levelup'];
handler.tags = ['xp'];
handler.command = ['nivel', 'lvl', 'levelup', 'level'];
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
