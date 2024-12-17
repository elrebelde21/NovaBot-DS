import './settings.js';
import { Client, GatewayIntentBits, PermissionsBitField, ActionRowBuilder, EmbedBuilder, Partials } from 'discord.js';
import { isUrl, runtime, sendButton } from './libs/fuctions.js';
import { createRequire } from 'module'
import yargs from 'yargs'
import path, { join } from 'path'
import { watchFile, unwatchFile } from 'fs'
import {fileURLToPath, pathToFileURL} from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import {Low, JSONFile} from 'lowdb'
import { mongoDB, mongoDBV2 } from './libs/mongoDB.js'
import _ from 'lodash';
import fs from 'fs';
import chalk from 'chalk';
import { format } from 'util'
import { promisify } from 'util';
import cp from 'child_process';
const exec = promisify(cp.exec);
import sqlite3 from 'sqlite3';
import hispamemes from 'hispamemes';
import moment from 'moment-timezone';
import cfonts from 'cfonts';
const { say } = cfonts
import antiLink from './plugins/_antilink.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const credsPath = join(__dirname, 'session', 'creds.json');

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '')

// Funciones para cargar y manejar el token del bot
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

console.log(chalk.bold.yellow(`🟢 Por favor, ingresa el token del bot: `))
stdin.once('data', (data) => {
            const token = data.toString().trim();
            fs.mkdirSync(path.dirname(credsPath), { recursive: true }); 
            fs.writeFileSync(credsPath, JSON.stringify({ token }), 'utf-8');
            resolve(token);
        });
    });
}

//Manejo de errores
process.on('uncaughtException', async (err) => {
    console.error('❌ Error no manejado:', err.message);
    for (let ownerID of global.owner) {
        try {
            let owner = await client.users.fetch(ownerID).catch(() => null);
            if (owner) {
await owner.send(`❌ Error no manejado en el bot:\n${err.message}`).catch(e => console.error('Error al enviar mensaje a los propietarios sobre uncaughtException:', e));
            }} catch (e) {
            console.error('Error al enviar mensaje a los propietarios sobre uncaughtException:', e);
        }
    }
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('❌ Rechazo no manejado:', reason);
    for (let ownerID of global.owner) {
        try {
            let owner = await client.users.fetch(ownerID).catch(() => null);
            if (owner) {
await owner.send(`❌ Rechazo no manejado en el bot:\n${reason}`).catch(e => console.error('Error al enviar mensaje a los propietarios sobre unhandledRejection:', e));
            }} catch (e) {
            console.error('Error al enviar mensaje a los propietarios sobre unhandledRejection:', e);
        }
    }
});

// Base de datos
global.opts = yargs(process.argv.slice(2)).exitProcess(false).parse();

const dbAdapter = /https?:\/\//.test(global.opts['db'] || '') 
  ? new cloudDBAdapter(global.opts['db']) 
  : /mongodb/.test(global.opts['db']) 
  ? new mongoDB(global.opts['db']) 
  : new JSONFile(`./database.json`);

global.db = new Low(dbAdapter);
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => 
    setInterval(function () {
      (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null)
    }, 1 * 1000)
  );

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

if (global.db) 
  setInterval(async () => {
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
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

//Logica para carga los comando
async function loadCommands() {
  const commandFiles = await fs.promises.readdir('./plugins');
  const commands = [];

  for (const file of commandFiles) {
    if (file.endsWith('.js')) {
      try {
        const command = await import(`./plugins/${file}`);
        commands.push(command.default);
      } catch (error) {
        console.error(`Error al cargar el comando ${file}:`, error.message);
      }
    }
  }

  client.commands = commands;
}

async function watchPluginsFolder() {
  const pluginsPath = path.resolve('./plugins');

  fs.watch(pluginsPath, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
      if (eventType === 'rename') {
        console.log(chalk.redBright(`Update '${filename}'.`));
      } else if (eventType === 'remove') {
        console.log(chalk.redBright(`Plugin eliminado: ${filename}`));
      }

      try {
        loadCommands();
      } catch (error) {
        console.error(`Error al recargar comandos:`, error.message);
      }
    }
  });
}

//----
client.once('ready', () => {
console.log(chalk.bold.greenBright(`\n𓃠 ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈✦ 🟢 𝘾𝙊𝙉𝙀𝙓𝙄𝙊𝙉 ✦┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 𓃠\n│\n│★ Bot Conectado: ${client.user.tag} con exitos\n│\n𓃠 ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈✦ ✅ ✦┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 𓃠`))
loadCommands();
watchPluginsFolder();

//Envía memes automáticamente cada hora
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
        }} else {
   //console.log('❌ No se ha configurado un canal de memes para el servidor:', guild.name);
   }});
       } catch (error) {
            console.error('Error al obtener el meme:', error);
        }
    }, 60 * 60 * 1000);
});

//Welcome
client.on('guildMemberAdd', (member) => {
    const guildId = member.guild.id;
    const chatSettings = db.data.settings[guildId] || {};

    if (chatSettings.welcome && chatSettings.welcomeChannelId) {
        const welcomeChannel = member.guild.channels.cache.get(chatSettings.welcomeChannelId);

        if (welcomeChannel) {
            const avatarUrl = member.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const totalMembers = member.guild.memberCount;

const welcomeMessageTemplate = chatSettings.welcomeMessage || `╭┈⊰ #guild ⊰┈
┃ **BIENVENIDO(A)** 🎉
┃ #tag
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈`;

            const welcomeMessage = welcomeMessageTemplate
                .replace(/#user/g, member.user.username)
                .replace(/#tag/g, `<@${member.user.id}>`) 
                .replace(/#guild/g, member.guild.name) 
                .replace(/#members/g, totalMembers.toString()); 
                
            const defaultEmbedOptions = {
                title: '🎉 ¡Gracias por unirte! 🎉',
                description: `Hola **#user**, estamos felices de tenerte aquí. ¡Disfruta tu estadía!`,
                footerText: `Eres el miembro número #members 🚀`,
                footerIcon: avatarUrl, 
            };

            const embedOptions = chatSettings.welcomeEmbed || {};
            const embed = new EmbedBuilder()
                .setColor('#FF69B4') // Color fijo
                .setTitle(embedOptions.title || defaultEmbedOptions.title.replace(/#user/g, member.user.username).replace(/#guild/g, member.guild.name)) 
                .setDescription(embedOptions.description || defaultEmbedOptions.description.replace(/#user/g, member.user.username).replace(/#guild/g, member.guild.name)) 
                .setThumbnail(avatarUrl) 
                .setFooter({
                    text: (embedOptions.footerText || defaultEmbedOptions.footerText).replace(/#members/g, totalMembers.toString()),
                    iconURL: embedOptions.footerIcon || defaultEmbedOptions.footerIcon, 
                });

            welcomeChannel.send({ content: welcomeMessage, embeds: [embed] });
        } else {     
        }} else {
      //console.log('⚠️ No se ha configurado ningún canal de bienvenida.');
    }
});

client.on('guildMemberRemove', (member) => {
    const guildId = member.guild.id;
    const chatSettings = db.data.settings[guildId] || {};

    if (chatSettings.farewell && chatSettings.farewellChannelId) {
        const farewellChannel = member.guild.channels.cache.get(chatSettings.farewellChannelId);

        if (farewellChannel) {
            const avatarUrl = member.user.displayAvatarURL({ dynamic: true, size: 128 });
            const totalMembers = member.guild.memberCount;

const farewellMessageTemplate = chatSettings.farewellMessage || `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊰*\n┃ #tag\n┃ **NO LE SABES AL GRUPO, CHAO!!**\n*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊰*`;

            const farewellMessage = farewellMessageTemplate
                .replace(/#user/g, member.user.username)
                .replace(/#tag/g, `<@${member.user.id}>`)
                .replace(/#guild/g, member.guild.name)
                .replace(/#members/g, totalMembers.toString());

            const defaultEmbedOptions = {
                title: '👋 Usuario ha salido',
                description: `¡Nos vas a extrañar, #user! Esperamos verte pronto.`,
                footerText: 'Gracias por haber sido parte de nuestra comunidad.',
                footerIcon: avatarUrl, 
            };

            const embedOptions = chatSettings.farewellEmbed || {};
            const embed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle(embedOptions.title || defaultEmbedOptions.title.replace(/#user/g, member.user.username))
                .setDescription(embedOptions.description || defaultEmbedOptions.description.replace(/#user/g, member.user.username))
                .setThumbnail(avatarUrl) 
                .setFooter({
                    text: embedOptions.footerText || defaultEmbedOptions.footerText,
                    iconURL: embedOptions.footerIcon || defaultEmbedOptions.footerIcon,
                });

            farewellChannel.send({ content: farewellMessage, embeds: [embed] });
        }
    } else {
       // console.log('⚠️ No se ha configurado ningún canal de despedida.');
    }
});

//-----
const isNumber = (value) => !isNaN(value) && typeof value === 'number';

const registrarte = (message) => {
  const user = db.data.users[message.author.id];
  if (!user || !user.registered) {
    message.reply(info.registra);
    return false;
  }
  return true;
};

const checkPremium = (user) => user.premium && user.premiumTime > Date.now();

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
            lastwork: 0,
            joincount: 1,
            afkReason: '',
            banned: false,
            limit: 20,
            banco: 0,
           lastmiming: 0,
            premiumTime: 0,
            lastrob: 0,
            warn: 0,
            money: 100,
            health: 100,
            exp: 100,
            role: '🙊 NOVATO(A) :v',
            autolevelup: true,
            level: 0,
        };
        await db.write();
    } else {
        if (!('registered' in user)) user.registered = false;
        if (!('premium' in user)) user.premium = false;
        if (!isNumber(user.age)) user.age = -1;
        if (!isNumber(user.regTime)) user.regTime = -1;
        if (!isNumber(user.afkTime)) user.afkTime = -1;
        if (!isNumber(user.premiumTime)) user.premiumTime = 0;
        if (!isNumber(user.lastrob)) user.lastrob = 0;
        if (!isNumber(user.joincount)) user.joincount = 1;
        if (!isNumber(user.lastmiming)) user.lastmiming = 0;
        if (!isNumber(user.lastwork)) user.lastwork = 0;
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
        antiLink2: false,
        expired: 0,
        rules: '',
    };
    await db.write();
} else {
    if (!('isBanned' in chat)) chat.isBanned = false;
    if (!('antiLink' in chat)) chat.antiLink = false;
    if (!('antiLink2' in chat)) chat.antiLink2 = false;
    if (!isNumber(chat.expired)) chat.expired = 0;
    if (!('rules' in chat)) chat.rules = '';
}
let settings;
if (message.guild) {
settings = db.data.settings[message.guild.id];
if (!settings) {
   db.data.settings[message.guild.id] = {
     welcomeChannelId: null,
     farewellChannelId: null,
     memeChannelId: null, 
     welcome: true, 
     status: 0,
     welcomeEmbed: {
     title: null,
     description: null,
     image: null,
    footerText: null,
    footerIcon: null,
    },
    farewellEmbed: {
    title: null,
    description: null,
    footerText: null,
    footerIcon: null,
    },
   welcomeMessage: null,    
   farewellMessage: null, 
    };
    await db.write();
    } else {
    if (!('welcomeChannelId' in settings)) settings.welcomeChannelId = null;
    if (!('farewellChannelId' in settings)) settings.farewellChannelId = null;
    if (!('memeChannelId' in settings)) settings.memeChannelId = null;
    if (!('welcomeMessage' in settings)) settings.welcomeMessage = null;   
   if (!('farewellMessage' in settings)) settings.farewellMessage = null;
     if (!('welcome' in settings)) settings.welcome = true;
    if (!('welcomeEmbed' in settings)) {
    settings.welcomeEmbed = { title: null,
     description: null,
     image: null,
     footerText: null,
     footerIcon: null,
     }}
    if (!('farewellEmbed' in settings)) {
    settings.farewellEmbed = { title: null,
     description: null,
     footerText: null,
     footerIcon: null,
     }}
   }} else {
}

//-----
const isDM = message.channel.type === 'DM';
console.log(chalk.bold.cyan('┏┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•'));
console.log(`${chalk.bold('┋[📩] Mensaje :')} ${chalk.white(message.content)} (Tipo: ${message.channel.type})`);
console.log(`${chalk.bold('┋[👤] De:')} ${chalk.yellow(message.author.tag)} ${chalk.white('en el canal:')} ${isDM ? chalk.red('DM') : chalk.blue(message.channel.name)} (${chalk.gray(message.channel.id)}`)
console.log(`${chalk.bold('┋[⚡] Servidor:')} ${isDM ? chalk.red('DM') : message.guild ? chalk.green(message.guild.name) : chalk.gray('N/A')}`);
console.log(chalk.bold.cyan('┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•'));
console.log(message.content) 

const isOwner = global.owner.map(ownerArray => ownerArray[0]);
const isROwner = message.guild ? message.guild.ownerId === message.author.id : false;
const isAdmin = message.guild && message.member 
    ? message.member.permissions.has(PermissionsBitField.Flags.Administrator) 
    : false;
const isBotAdmin = message.guild 
    ? message.guild.members.cache.get(message.client.user.id)?.permissions.has(PermissionsBitField.Flags.Administrator) ?? false 
    : false;

const prefixRegex = /^[°•π÷×¶∆£¢*€¥®™+✓_=|~!?@#$%^&.©^]/gi;
const body = message.content;
const prefix = body.match(prefixRegex) ? body.match(prefixRegex)[0] : ''; 
const commandBody = body.slice(prefix.length).trim(); 
const args = commandBody.split(' ');    
const commandName = args.shift();
    
const command = client.commands.find(cmd => {
const customPrefix = cmd.customPrefix ? new RegExp(cmd.customPrefix) : null;

if (customPrefix && customPrefix.test(commandName)) {
    return true;
  }

  if (cmd.command) {
    if (typeof cmd.command === 'string') {
      return cmd.command.toLowerCase() === commandName.toLowerCase();
    }
    if (cmd.command instanceof RegExp) {
      return cmd.command.test(commandName);
    }
  }

  return false;
});

if (command) { 
if (command.before) {
            try {
await command.before(message, { 
                    args, 
                    prefix, 
                    command: commandName, 
                    db, 
                    client, 
                    text: message.content.slice(prefix.length + commandName.length).trim(),
                    isOwner,
                    isROwner,
                    isAdmin,
                    isBotAdmin,
                    user: message.author,
                    isPrems: message.member.roles.cache.some(role => role.name === 'Premium'),
                });
            } catch (error) {
                console.error('Error en before:', error);
                return message.reply('Hubo un error antes de ejecutar el comando. Por favor, intenta más tarde.');
            }
        }
        
if (command.rowner && !isOwner) return message.reply(info.owner);
if (command.admin && !isAdmin) return message.reply(info.admin);
if (command.botAdmin && !isBotAdmin) return message.reply(info.botAdmin);
if (command.group && isDM) return message.reply(info.group);
if (command.private && !isDM) return message.reply(info.private);
if (command.register && !registrarte(message)) return;
if (command.premium && !checkPremium(user)) return message.reply('❌ Este comando solo está disponible para usuarios premium.');

if (command.limit) {
const userId = message.author.id;
let user = global.db.data.users[userId];
if (!user) return;
if (user.limit >= command.limit && !user.limitVerified) {
user.limit -= command.limit;
user.limitVerified = true;
await db.write();
message.reply(`**ʜᴀᴢ ɢᴀsᴛᴀᴅᴏ ${command.limit} ᴅɪᴀᴍᴏɴᴅ 💎**`);
} else if (user.limit < command.limit) {
message.reply(info.limit);
return;
}}
if (command.level && user.level < command.level) {
return message.reply(`❌ Necesitas al menos nivel ${command.level} para usar este comando. Tu nivel actual es ${user.level}.`);
}

let xp = command.exp ? parseInt(command.exp) : 10; // Ganar XP por comando. 

if (xp > 200) {
return message.reply('chirrido -_-')};
const userId = message.author.id;
let user = global.db.data.users[userId];

if (!user) {
return;
}

user.exp += xp;
try {
await antiLink(message, { db, isAdmin, isBotAdmin });
await command(message, { args, prefix, command: commandName, db, client, text: message.content.slice(prefix.length + commandName.length).trim() });
} catch (error) {
console.error('Error:', error);
message.reply('Hubo un error al ejecutar ese comando, reportarlo a mi creador con el comando: #report\n\n' + error);
}}
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
   
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'index.js'"))
  import(`${file}?update=${Date.now()}`)
})