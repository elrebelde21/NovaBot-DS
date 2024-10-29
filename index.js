import './settings.js';
import fs from 'fs'; 
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { promisify } from 'util';
import { exec } from 'child_process';
import yts from 'youtube-yts';
import fetch from 'node-fetch'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import sqlite3 from 'sqlite3'; 
const sqlite = sqlite3.verbose();

const client = new Client({intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildPresences
]});

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'plugins')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
import(`./plugins/${file}`).then((command) => {
commands.push(command.default); 
});
}

//base De Datos
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
if (err) {
console.error(err.message);
} else {
console.log('Conectado a la base de datos de SQLite.');
db.run(`CREATE TABLE IF NOT EXISTS users (
id TEXT PRIMARY KEY,
username TEXT,
server TEXT
)`);
db.run(`CREATE TABLE IF NOT EXISTS settings (
guildId TEXT PRIMARY KEY,
welcomeChannelId TEXT,
farewellChannelId TEXT
)`);
}
});

client.once('ready', () => {
console.log(`Bot iniciado como: ${client.user.tag}`);
});

//Welcome
client.on('guildMemberAdd', member => {
const guildId = member.guild.id;

db.get(`SELECT welcomeChannelId FROM settings WHERE guildId = ?`, [guildId], (err, row) => {
if (err) {
console.error('❌ Error', err.message);
return;
}

const welcomeChannelId = row ? row.welcomeChannelId : null;
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
}} else {
console.log('❌ No has configurado ningún canal de bienvenida');
}});
});

client.on('guildMemberRemove', member => {
const guildId = member.guild.id;

db.get(`SELECT farewellChannelId FROM settings WHERE guildId = ?`, [guildId], (err, row) => {
if (err) {
console.error('[❌] Error:', err.message);
return;
}

const farewellChannelId = row ? row.farewellChannelId : null;
if (farewellChannelId) {
const farewellChannel = member.guild.channels.cache.get(farewellChannelId);
if (farewellChannel) {
const totalMembers = member.guild.memberCount;
const avatarUrl = member.user.displayAvatarURL({ dynamic: true, size: 1024 });
const imgBye = 'https://qu.ax/yqlE.jpg'; 
const farewellImage = avatarUrl || imgBye; 
const textt2 = `╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊰\n┃ <@${member.user.id}>\n┃ *NO LE SABE AL GRUPO, CHAO!!* 😎\n╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⊰`;

farewellChannel.send({ content: textt2, files: [farewellImage] });
} else {
console.log('❌ El canal de despedida no existe.');
}} else {
console.log('❌ No has configurado ningún canal de despedida.');
}});
});

//promote
client.on('guildUpdate', (oldGuild, newGuild) => {
if (oldGuild.name !== newGuild.name) {
console.log(`El nombre del servidor ha cambiado de "${oldGuild.name}" a "${newGuild.name}".`);
}});

client.on('guildMemberUpdate', (oldMember, newMember) => {
const oldPermissions = oldMember.permissions;
const newPermissions = newMember.permissions;
const channel = newMember.guild.channels.cache.find(ch => ch.name === 'general'); 
if (!channel) return;

if (!oldPermissions.has('ADMINISTRATOR') && newPermissions.has('ADMINISTRATOR')) {
channel.send(`[ PROMOTE ]\n${newMember.user.tag} ha sido asignado como nuevo administrador.`);
}

if (oldPermissions.has('ADMINISTRATOR') && !newPermissions.has('ADMINISTRATOR')) {
channel.send(`[ DEMOTE ]\n${newMember.user.tag} ha sido removido como administrador.`);
}});

client.on('guildRoleCreate', (role) => {
const channel = role.guild.channels.cache.find(ch => ch.name === 'general'); 
if (channel) {
channel.send(`Se ha creado un nuevo rol: ${role.name}`);
}});

client.on('guildRoleDelete', (role) => {
const channel = role.guild.channels.cache.find(ch => ch.name === 'general'); 
if (channel) {
channel.send(`Se ha eliminado el rol: ${role.name}`);
}});

client.on('guildBanAdd', (guild, user) => {
const channel = guild.channels.cache.find(ch => ch.name === 'general'); 
if (channel) {
channel.send(`El usuario ${user.tag} ha sido baneado del servidor.`);
}});

//Consola
client.on('messageCreate', async message => {
if (message.author.bot) return; 
console.log('┏┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•');
console.log(`┋[📩] Mensaje : ${message.content}`);
console.log(`┋[👤] De: ${message.author.tag} en el canal: ${message.channel.name} (${message.channel.id})`);
console.log(`┋[⚡] Servidor: ${message.guild ? message.guild.name : 'DM'}`);
console.log('┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•');

const isOwner = global.owner.map(ownerArray => ownerArray[0]);
const prefixRegex = /^[°•π÷×¶∆£¢*€¥®™+✓_=|~!?@#$%^&.©^]/gi;
const body = message.content;
const prefixMatch = body.match(prefixRegex);
const prefix = prefixMatch ? prefixMatch[0] : '';
//if (!prefix) return;
const commandBody = body.slice(prefix.length).trim();
const args = commandBody.split(' ');
const command = args.shift().toLowerCase();

for (const commandHandler of commands) {
if (commandHandler.command.test(command)) {
try {
await commandHandler(message, args, { db, isOwner }); 
} catch (err) {
console.error(err);
message.reply('⚠️ Error\n\n' + err);
}
break;
}}
});

client.login(botToken);