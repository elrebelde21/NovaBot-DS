import moment from 'moment-timezone';
import { createHash } from 'crypto';
import { EmbedBuilder } from 'discord.js';

let handler = async (message, { args, prefix, command }) => {
    const date = moment.tz('America/Bogota').format('DD/MM/YYYY');
    const time = moment.tz('America/Bogota').format('HH:mm:ss');
    let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;
    let user = db.data.users[message.author.id];

  if (user && user.registered === true) return message.reply('*¡YA ESTÁS REGISTRADO(A)!*');
   if (!Reg.test(args.join(' '))) {
        return message.reply(`*INGRESE SU NOMBRE Y EDAD PARA ESTAR REGISTRADO*\n*EJEMPLO*\n\n${prefix + command} GataBot.18`);
    }

   let [_, name, splitter, age] = args.join(' ').match(Reg);
    if (!name) return message.reply('INGRESE SU NOMBRE');
    if (!age) return message.reply('INGRESE SU EDAD');
    age = parseInt(age);
    if (age > 100) return message.reply('USTED ES MUY MAYOR');
    if (age < 5) return message.reply('USTED ES MUY MENOR');
    if (name.length >= 30) return message.reply('ESCRIBA UN NOMBRE MÁS CORTO');
    
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
