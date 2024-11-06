const moment = require('moment-timezone');
const { createHash } = require('crypto');

let handler = async (message, { args, prefix, command }) => {
    const date = moment.tz('America/Bogota').format('DD/MM/YYYY');
    const time = moment.tz('America/Bogota').format('HH:mm:ss');
    let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;
    let user = db.data.users[message.author.id];

    if (user && user.registered === true) {
        return message.reply('*¡YA ESTÁS REGISTRADO(A)!*');
    }

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
    user.limit = (user.limit || 0) + 8;
    user.exp = (user.exp || 0) + 500;

message.channel.send({content: `✅ *V E R I F I C A C I Ó N* ✅\n\n` +
                 `• NOMBRE: ${name}\n` +
                 `• EDAD: ${age}\n` +
                 `• FECHA: ${date}\n` +
                 `• USUARIO: <@${message.author.id}>\n` +
                 `• NÚMERO DE SERIE: ${sn}`
    });
};
handler.help = ['reg'];
handler.tags = ['rg'];
handler.command = /^(reg|verificar|datfar)$/i; 
module.exports = handler; 
