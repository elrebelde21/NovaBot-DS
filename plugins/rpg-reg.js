import moment from 'moment-timezone';
import { createHash } from 'crypto';
import { EmbedBuilder } from 'discord.js';

let handler = async (message, { args, prefix, command }) => {
    const date = moment.tz('America/Bogota').format('DD/MM/YYYY');
    const time = moment.tz('America/Bogota').format('HH:mm:ss');
    let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;
   let user = db.data.users[message.author.id];
   let name2 = message.author.username

  if (user && user.registered === true) return message.reply(`*✳️ Ya estás registrado*\n\n¿Quiere volver a registrarse?\n\n 📌 Use este comando para eliminar su registro \n*${prefix}unreg* <Número de serie>`);
 if (!Reg.test(args.join(' '))) return message.reply(`⚠️ Formato incorrecto\n\n ✳️ Uso del comamdo: *${prefix + command} nombre.edad*\n📌Ejemplo : *${prefix + command}* ${name2}.15`);

   let [_, name, splitter, age] = args.join(' ').match(Reg);
    if (!name) return message.reply('✳️ El nombre no puede estar vacío');
    if (!age) return message.reply('✳️ La edad no puede estar vacía');
    age = parseInt(age);
    if (age > 100) return message.reply('👴🏻 Wow el abuelo quiere jugar al bot');
    if (age < 5) return message.reply('🚼  hay un abuelo bebé jsjsj');
    if (name.length >= 30) return message.reply('✳️ El nombre es demasiado largo');
    
    let sn = createHash('md5').update(message.author.id).digest('hex');
    
    if (!db.data.users[message.author.id]) {
        db.data.users[message.author.id] = {};
    }
    
    user = db.data.users[message.author.id]; 
    user.name = name.trim();
    user.age = age;
    user.regTime = +new Date();
    user.registered = true;
    user.limit = 8;
    user.exp = 1000;
    user.money = 1000;

let textt = `**• NOMBRE**: ${name}
**• EDAD**: ${age}
**• FECHA**: ${date}
**• USUARIO**: <@${message.author.id}>
**• NÚMERO DE SERIE**: ${sn}

**🎁 RECOMPENSA:**
⤷ 8 diamantes 💎
⤷ 1000 Coins 🪙
⤷ 1000 exp

*◉ Para ver los comandos del bot usar:*\n${prefix}menu`
const embed = new EmbedBuilder()
.setColor(0x00FF00)
.setTitle('✅ V E R I F I C A C I Ó N ✅')
.setDescription(textt)
.setTimestamp(new Date())
.setFooter({ text: 'Gracias por registrarte en ' + wm });
return message.channel.send({ embeds: [embed] }); 
message.reply(sn)    
};
handler.help = ['reg', 'verificar', 'datfar'];
handler.tags = ['rg'];
handler.command = /^(reg|verificar|datfar)$/i; 
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;
