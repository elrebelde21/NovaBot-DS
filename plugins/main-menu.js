import moment from 'moment-timezone';
import { EmbedBuilder } from 'discord.js';

const fecha = moment.tz('America/Bogota').format('DD/MM/YYYY');

let tags = {
    'main': 'ℹ️ INFOBOT',
    'econ': '📊 NIVEL & ECONOMÍA',
    'downloader': '🚀 DESCARGAS',
    'tools': '🛠 HERRAMIENTAS',
    'rg': '🟢 REGISTRO',
    'group': '⚙️ GRUPO',
    'nsfw': '🔥 NSFW',
    'owner': '👑 OWNER', 
};

let handler = async (message, { db, client, prefix }) => {
    try {
        const userId = message.author.id;
        const name = message.author.username || 'Usuario';                
        const hora = moment.tz('America/Argentina/Buenos_Aires').format('LT');
        let totalreg = Object.keys(db.data.users).length;
        let rtotalreg = Object.values(db.data.users).filter(user => user.registered == true).length;

        let _uptime = process.uptime() * 1000; 
        let muptime = clockString(_uptime);

let menu = `╔══════ ≪ •❈• ≫ ══════╗
║◤━━━━━ ☆. ∆ .☆ ━━━━━◥
║ Hola, **${name}** 👋
║◤━━━━━ ☆. ∆ .☆ ━━━━━◥
║☃️ **Fecha:** ${fecha}
║☃️ **Prefijo:** ${prefix}
║☃️ **Uptime:** ${muptime}
║
║☃️ **Usuarios registrados:** ${rtotalreg} de ${totalreg}
║◤━━━━━ ☆. ∆ .☆ ━━━━━◥
╚══════ ≪ •❈• ≫ ══════╝

**☃️ Bot en fase beta, con pocos comandó ☃️**`

let help = client.commands.map(command => ({
help: Array.isArray(command.help) ? command.help : [command.help],
tags: Array.isArray(command.tags) ? command.tags : [command.tags],
limit: command.limit,
premium: command.premium,
}));

let embed = new EmbedBuilder()
.setColor(0x2B2D31) // Color del embed (oscuro, ajustable)
.setTitle('🌟 MENÚ PRINCIPAL 🌟')
.setDescription(menu)
.setThumbnail('https://qu.ax/Zgqq.jpg') 
.setFooter({ text: 'Bot en fase beta ⚙️' });

Object.keys(tags).forEach(tag => {
let commands = help
.filter(cmd => cmd.tags.includes(tag)).map(cmd => 
cmd.help.map(h => `┃❏ \`${prefix}${h}\` ${cmd.limit ? 'ⓓ' : ''} ${cmd.premium ? 'Ⓟ' : ''}`)
.join('\n')).join('\n');

if (commands) {
let formattedCommands = `┏• ${tags[tag]}\n${commands}\n┗━━━━━━━━━━━━━━•`;

embed.addFields([{ name: '\u200b',
value: formattedCommands, inline: false 
}]);
}
});

await message.channel.send({ embeds: [embed] });
} catch (error) {
await message.channel.send('❌ **Error al generar el menú.**');
console.error('Error al generar el menú:', error);        
}};
handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help|allmenu)$/i; 
export default handler;

function clockString(ms) {
    let d = Math.floor(ms / 86400000);
    let h = Math.floor(ms / 3600000) % 24;
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
}

/*
import moment from 'moment-timezone';
const fecha = moment.tz('America/Bogota').format('DD/MM/YYYY');

let tags = {
    'main': 'ℹ️ INFOBOT',
    'econ': 'NIVEL & ECONOMIA',
    'downloader': '🚀 DESCARGAS',
    'tools': '🛠 HERRAMIENTAS',
    'rg': '🟢 REGISTRO',
    'group': '⚙️ GRUPO',
    'nsfw': '🔥 NSFW',
    'owner': '👑 OWNER', 
};

const defaultMenu = {
    before: `╔══════ ≪ •❈• ≫ ══════╗
║◤━━━━━ ☆. ∆ .☆ ━━━━━◥
║ Hola 👋🏻 *%name 
║◤━━━━━ ☆. ∆ .☆ ━━━━━◥
║☃️ Fecha: ${fecha}
║☃️ Prefijo: %prefix
║☃️ Uptime: %muptime
║
║☃️ Usuarios registrados: %rtotalreg de %totalreg
║◤━━━━━ ☆. ∆ .☆ ━━━━━◥
╚══════ ≪ •❈• ≫ ══════╝

**☃️ Bot en fase beta, con pocos comandó ☃️**\n`,

    header: '**╭─╮─᤻─᳒─᤻᳒᯽⃟ᰳᰬᰶ┈** **%category**️⃟ᬽ፝֟━*',
    body: '├❥ᰰຼ❏ %prefix%cmd %islimit %isPremium',
    footer: '\n╰┄̸࣭࣭࣭࣭࣭ٜ۫┄࣭࣭࣭۫┄̸࣭۫┄̸࣭࣭࣭࣭࣭ٜ۫┄࣭࣭࣭۫┄̸࣭۫┄̸࣭࣭࣭࣭࣭ٜ۫┄̸࣭࣭࣭࣭࣭ٜ۫┄۫',
    after: `
`,
};

let handler = async (message, { db, client, prefix }) => {
    try {
        const userId = message.author.id;
        const name = message.author.username || 'Usuario';                
        const hora = moment.tz('America/Argentina/Buenos_Aires').format('LT');
        let totalreg = Object.keys(db.data.users).length;
        let rtotalreg = Object.values(db.data.users).filter(user => user.registered == true).length;

        let _uptime = process.uptime() * 1000; 
        let muptime = clockString(_uptime);

        let help = client.commands.map(command => ({
            help: Array.isArray(command.help) ? command.help : [command.help],
            tags: Array.isArray(command.tags) ? command.tags : [command.tags],
            limit: command.limit,
            premium: command.premium,
        }));

        let text = [defaultMenu.before
            .replace('%name', name)
            .replace('%muptime', muptime)
            .replace('%prefix', prefix)
            .replace('%totalreg', totalreg) 
            .replace('%rtotalreg', rtotalreg) 
            .replace('%readmore', readMore)
        ]
        .concat(Object.keys(tags).map(tag => {
            return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' +
                help.filter(menu => menu.tags.includes(tag)).map(menu => {
                    return menu.help.map(help => {
                        return defaultMenu.body.replace(/%cmd/g, help)
                            .replace(/%prefix/g, prefix)
                            .replace(/%islimit/g, menu.limit ? '(ⓓ)' : '')
                            .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '')
                            .trim();
                    }).join('\n');
                }).join('\n') +
                defaultMenu.footer;
        }))
        .join('\n');
let pp = "https://qu.ax/Zgqq.jpg"

     await message.channel.send({content: text.trim(), embeds: [{image: { url: pp }}] });
//  await message.channel.send(text.trim());
  
    } catch (error) {
        console.error('Error al generar el menú:', error);
        await message.channel.send('Hubo un error al generar el menú.\n\n' + error);
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help|allmenu)$/i; 
handler.register = true;
handler.rowner = false
handler.admin = false
handler.botAdmin = false
export default handler;

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [d, 'd ', h, 'h ', m, 'm '].map(v => v.toString().padStart(2, 0)).join('');
}
*/