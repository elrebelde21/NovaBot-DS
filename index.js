require('./settings.js'); 
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { isUrl, runtime, sendButton } = require('./libs/fuctions');
const fs = require('fs');
const yargs = require('yargs/yargs');
const chalk = require('chalk');
const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec).bind(cp);
const _ = require('lodash');
const sqlite3 = require('sqlite3').verbose();
const hispamemes = require('hispamemes');
const moment = require('moment-timezone');
const cfonts = require('cfonts');
const path = require('path');
const { join } = require('path')
const {say} = cfonts;
const antiLink = require('./plugins/_antilink');
const antiLink2 = require('./plugins/_antilink2');

const credsPath = path.join(__dirname, 'session', 'creds.json');

function loadTokenFromSettings() {
    return global.botToken || null;
}

function loadTokenFromCreds() {
    if (fs.existsSync(credsPath)) {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
        return creds.token || null;
    }
    return null;
}

async function promptForToken() {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;

        stdout.write(chalk.white.bgBlue('🟢 Por favor, ingresa el token del bot: '));
        stdin.once('data', (data) => {
            const token = data.toString().trim();
            fs.mkdirSync(path.dirname(credsPath), { recursive: true }); 
            fs.writeFileSync(credsPath, JSON.stringify({ token }), 'utf-8');
            resolve(token);
        });
    });
}

// Base de datos
let low;
try {
    low = require('lowdb');
} catch (e) {
    low = require('./libs/database/lowdb');
}

const { Low, JSONFile } = low;
const mongoDB = require('./libs/database/mongoDB');

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.db = new Low(
    /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
    new mongoDB(opts['db']) :
    new JSONFile(`./database.json`)
);
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000));
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read();
    global.db.READ = false;
    global.db.data = {
        users: {},
        chats: {},
        game: {},
        database: {},
        settings: {},  
        setting: {},
        others: {},
        sticker: {},
        ...(global.db.data || {})
    };
    global.db.chain = _.chain(global.db.data);
};

loadDatabase();

if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write();
}, 30000);

// Inicializar el cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel], 
});

//carga los comando.
client.commands = [];
const commandFiles = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./plugins/${file}`);
    client.commands.push(command);
}

//----
client.once('ready', () => {
console.log('✅ Iniciando...')
say('NovaBot-DS', {
  font: 'chrome',
  align: 'center',
  gradient: ['red', 'magenta']});
say(`Bot Conectado: ${client.user.tag} con exitos`, {
  font: 'console',
  align: 'center',
  gradient: ['cyan', 'magenta']})

//------
setInterval(async () => {
        try {
            const memeUrl = await hispamemes.meme();
            const guilds = await client.guilds.fetch();
            guilds.forEach(async (guild) => {
                const memeChannelId = db.data.settings[guild.id]?.memeChannelId;
                if (memeChannelId) {
                    const channel = client.channels.cache.get(memeChannelId);
                    if (channel) {
                        await channel.send({ content: "", files: [memeUrl] });
                    } else {
                        console.error('❌ El canal de memes no se encuentra.');
                    }
                } else {
                    console.log('❌ No se ha configurado un canal de memes para el servidor:', guild.name);
                }
            });
        } catch (error) {
            console.error('Error al obtener el meme:', error);
        }
    }, 60 * 60 * 1000);
});

//Welcome
client.on('guildMemberAdd', member => {
    const guildId = member.guild.id;
    const chat = db.data.settings[guildId] || {};
    if (chat.welcome) {
        const welcomeChannelId = chat.welcomeChannelId;
        if (welcomeChannelId) {
            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            if (welcomeChannel) {
                const avatarUrl = member.user.displayAvatarURL({ dynamic: true, size: 1024 });
                const imgWel1 = 'https://qu.ax/yqlE.jpg'; 
                const totalMembers = member.guild.memberCount;
                const textt = `*╭┈⊰* ${member.guild.name} *⊰┈ ✦*\n┃✨ BIENVENIDO(A)!!\n┃💖 <@${member.user.id}>\n┃👥 Total de usuarios: ${totalMembers}\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ✦`;

                welcomeChannel.send({ content: textt, files: [avatarUrl || imgWel1] });
            } else {
                console.log('❌ El canal de bienvenida no existe.');
            }
        } else {
            console.log('❌ No se ha configurado ningún canal de bienvenida');
        }
    }
});

//-----
client.on('guildMemberRemove', member => {
    const guildId = member.guild.id;
    const chat = db.data.settings[guildId] || {};
    
    if (chat.welcome) {
        const farewellChannelId = chat.farewellChannelId;
        if (farewellChannelId) {
            const farewellChannel = member.guild.channels.cache.get(farewellChannelId);
            if (farewellChannel) {
                const totalMembers = member.guild.memberCount;
                const avatarUrl = member.user.displayAvatarURL({ dynamic: true, size: 1024 });
                const imgBye = 'https://qu.ax/yqlE.jpg';
                const farewellMessage = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊰*\n┃ <@${member.user.id}>\n┃ *NO LE SABE AL GRUPO, CHAO!!* 😎\n*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊰*`;

                farewellChannel.send({ content: farewellMessage, files: [avatarUrl || imgBye] })
                    .then(() => console.log(`Mensaje de despedida enviado a ${farewellChannel.name}`))
                    .catch(error => console.error('Error al enviar el mensaje de despedida:', error));
            } else {
                console.log('❌ El canal de despedida no existe o no se pudo encontrar.');
            }
        } else {
            console.log('❌ No se ha configurado ningún canal de despedida.');
        }
    }
});

//-----
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

function registrarte(message) {
    let user = db.data.users[message.author.id];
    if (!user || !user.registered) {
        message.reply(info.registra);
        return false;
    }
    return true;
}

//-----
client.on('messageCreate', async message => {
if (message.author.bot) return;
let user = db.data.users[message.author.id];
    if (!user) {
        user = db.data.users[message.author.id] = {
            id: message.author.id,
            tag: message.author.tag,
            joinedAt: new Date().toISOString(), 
            registered: false,
            premium: false,
            mensaje: 0,
            age: -1,
            regTime: -1,
            afkTime: -1,
            joincount: 1,
            afkReason: '',
            banned: false,
            limit: 20,
            banco: 0,
            premiumTime: 0,
            warn: 0,
            money: 100,
            health: 100,
            exp: 100,
            role: '🙊 NOVATO(A) :v',
            autolevelup: true,
            level: 0,
        };
        await db.write();
        console.log(`Nuevo usuario registrado: ${message.author.tag}`);
    } else {
        if (!('registered' in user)) user.registered = false;
        if (!('premium' in user)) user.premium = false;
        if (!('mensaje' in user)) user.mensaje = 0;
        if (!isNumber(user.age)) user.age = -1;
        if (!isNumber(user.regTime)) user.regTime = -1;
        if (!isNumber(user.afkTime)) user.afkTime = -1;
        if (!isNumber(user.joincount)) user.joincount = 1;
        if (!('afkReason' in user)) user.afkReason = '';
        if (!('banned' in user)) user.banned = false;
        if (!isNumber(user.limit)) user.limit = 20;
        if (!isNumber(user.banco)) user.banco = 0;
        if (!isNumber(user.warn)) user.warn = 0;
        if (!isNumber(user.money)) user.money = 100;
        if (!isNumber(user.health)) user.health = 100;
        if (!isNumber(user.exp)) user.exp = 100;
        if (!('role' in user)) user.role = '🙊 NOVATO(A) :v';
        if (!('autolevelup' in user)) user.autolevelup = true;
        if (!isNumber(user.level)) user.level = 0;
    }

    let chat = db.data.chats[message.channel.id];
    if (!chat) {
        db.data.chats[message.channel.id] = {
            antiLink: false,
            welcome: true,
            rules: '',
        };
        await db.write();
        console.log(`Nuevo chat registrado: ${message.channel.name}`);
    }

    let settings = db.data.settings[message.guild.id];
    if (!settings) {
        db.data.settings[message.guild.id] = {
            welcomeChannelId: null,
            farewellChannelId: null,
            memeChannelId: null, 
            welcome: true, 
        };
        await db.write();
    }

//-----
const isDM = message.channel.type === 'DM';
console.log(chalk.bold.cyan('┏┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•'));
console.log(`${chalk.bold('┋[📩] Mensaje :')} ${chalk.white(message.content)}`);
console.log(`${chalk.bold('┋[👤] De:')} ${chalk.yellow(message.author.tag)} ${chalk.white('en el canal:')} ${isDM ? chalk.red('DM') : chalk.blue(message.channel.name)} (${chalk.gray(message.channel.id)})`);
console.log(`${chalk.bold('┋[⚡] Servidor:')} ${isDM ? chalk.red('DM') : message.guild ? chalk.green(message.guild.name) : chalk.gray('N/A')}`);
console.log(chalk.bold.cyan('┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•'));

const isOwner = global.owner.map(ownerArray => ownerArray[0]);
const isROwner = message.guild.ownerId === message.author.id;
const isAdmin = message.member.permissions.has('ADMINISTRATOR');
const isBotAdmin = message.guild.members.cache.get(message.client.user.id).permissions.has("ADMINISTRATOR");

await antiLink(message, { db, isAdmin, isBotAdmin });
await antiLink2(message, { db, isAdmin, isBotAdmin })

    const prefixRegex = /^[°•π÷×¶∆£¢*€¥®™+✓_=|~!?@#$%^&.©^]/gi;
    const body = message.content;
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '';
    const commandBody = body.slice(prefix.length).trim(); 
    const args = commandBody.split(' ');
    const text = args.join(' ');
const commandName = args.shift().toLowerCase();
const command = client.commands.find(cmd => cmd.command && cmd.command.test(commandName));
    
if (command) {
if (command.rowner && !isOwner) {
return message.reply(info.owner);
}
if (command.admin && !isAdmin) {
return message.reply(info.admin);
}
if (command.botAdmin && !isBotAdmin) {
return message.reply(info.botAdmin);
}
if (command.register && !registrarte(message)) {
return;
}
if (command.limit) {
if (user.limit >= command.limit) {
user.limit -= command.limit;
await db.write();
message.reply(`Haz gastado ${command.limit} diamond 💎`)              
} else {
message.reply(info.limit);
return;
}}
if (command.level && user.level < command.level) {
return message.reply(`❌ Necesitas al menos nivel ${command.level} para usar este comando. Tu nivel actual es ${user.level}.`);
}

let xp = command.exp ? parseInt(command.exp) : 10; //Ganar XP por comando. 

if (xp > 200) {
return message.reply('chirrido -_-');
}

const userId = message.author.id;
let user = global.db.data.users[userId];

if (!user) {
return 
}

user.exp += xp;
    
try {
await command(message, { args, prefix, command: commandName, db, client });
        } catch (error) {
            console.error('Error en el comando:', error);
            message.reply('Hubo un error al ejecutar ese comando, reportarlo a mi creador con el comando: #report\n\n' + error);
        }
    }
});

//iniciar el bot
let botToken = loadTokenFromSettings() || loadTokenFromCreds();

if (!botToken) {
    (async () => {
        botToken = await promptForToken();
        client.login(botToken).catch(err => {
            console.error('Error al iniciar sesión con el token:', err);
        });
    })();
} else {
    client.login(botToken).catch(err => {
        console.error('Error al iniciar sesión con el token:', err);
    });
}

//•━━━≪ UPDATE DEL ARCHIVO ≫━━━━•  
   
let file = require.resolve(__filename) // Obtener la ruta completa del archivo 
fs.watchFile(file, () => { // Observar cambios en el archivo
fs.unwatchFile(file)
const fileName = path.basename(file) // Nombre del archivo 
console.log(chalk.redBright(`Update '${fileName}'.`)) // Imprimir mensaje en consola
delete require.cache[file] // Eliminar la caché para permitir la actualización de cambios
require(file) // Volvemos a cargar el archivo con los nuevos cambios
})