const moment = require('moment-timezone');
const fecha = moment.tz('America/Bogota').format('DD/MM/YYYY');

let tags = {
    'main': 'ℹ️ INFOBOT',
    'econ': 'NIVEL & ECONOMIA',
    'downloader': '🚀 DESCARGAS',
    'tools': '🛠 HERRAMIENTAS',
    'rg': '🟢 REGISTRO',
    'group': '⚙️ GRUPO',
    'nsfw': '🔥 NSFW',
};

const defaultMenu = {
    before: `Hola 👋🏻 *%name*\n
*• Fecha:* ${fecha}
*• Prefijo:* %prefix
*• Uptime:* %muptime
*• Usuarios:* %totalreg
`,
    header: '┌─⊷ *%category*',
    body: '❥ %prefix%cmd %islimit %isPremium',
    footer: '\n└───────────',
    after: `
`,
};

let handler = async (message, { db, client, prefix }) => {
    try {
        const userId = message.author.id;
        const name = message.author.username || 'Usuario';                
        const hora = moment.tz('America/Argentina/Buenos_Aires').format('LT');
        const totalreg = Object.keys(db.data.users).length;

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
        ]
        .concat(Object.keys(tags).map(tag => {
            return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' +
                help.filter(menu => menu.tags.includes(tag)).map(menu => {
                    return menu.help.map(help => {
                        return defaultMenu.body.replace(/%cmd/g, help)
                            .replace(/%prefix/g, prefix) // 
                            .replace(/%islimit/g, menu.limit ? '(ⓓ)' : '')
                            .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '')
                            .trim();
                    }).join('\n');
                }).join('\n') +
                defaultMenu.footer;
        }))
        .join('\n');

        await message.channel.send(text.trim());
    } catch (error) {
        console.error('Error al generar el menú:', error);
        await message.channel.send('Hubo un error al generar el menú.\n\n' + error);
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help|allmenu)$/i; 
handler.register = true;

module.exports = handler;

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [d, 'd ', h, 'h ', m, 'm '].map(v => v.toString().padStart(2, 0)).join('');
}
