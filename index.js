require('./settings.js'); 
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec).bind(cp);
const yts = require("youtube-yts");
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildPresences
    ]
});

//base de datos
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
}});

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
                
welcomeChannel.send({content: textt,
files: [avatarUrl || imgWel1]});
} else {
console.log('❌ El canal de bienvenida no existe.');
}} else {
console.log('❌ no haz configurando ningún canal de bienvenida');
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
console.log('❌ No haz configurado ningun canal de despedida.');
}});
});

client.on('guildUpdate', (oldGuild, newGuild) => {
if (oldGuild.name !== newGuild.name) {
message.reply(`El nombre del servidor ha cambiado de "${oldGuild.name}" a "${newGuild.name}".`);
}});

client.on('guildMemberUpdate', (oldMember, newMember) => {
const oldPermissions = oldMember.permissions;
const newPermissions = newMember.permissions;

if (!oldPermissions.has('ADMINISTRATOR') && newPermissions.has('ADMINISTRATOR')) {
message.reply(`[ PROMOTE ]\n${newMember.user.tag} ha sido asignado como nuevo administrador.`);
}

if (oldPermissions.has('ADMINISTRATOR') && !newPermissions.has('ADMINISTRATOR')) {
message.reply(`[ DEMOTE ]\m${newMember.user.tag} ha sido removido como administrador.`);
}});

client.on('guildRoleCreate', (role) => {
message.reply(`Se ha creado un nuevo rol: ${role.name}`);
});

client.on('guildRoleDelete', (role) => {
message.reply(`Se ha eliminado el rol: ${role.name}`);
});

client.on('guildBanAdd', (guild, user) => {
message.reply(`El usuario ${user.tag} ha sido baneado del servidor.`);
});

client.on('messageCreate', async message => {
if (message.author.bot) return; 
console.log('┏┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•');
console.log(`┋[📩] Mensaje : ${message.content}`);
console.log(`┋[👤] De: ${message.author.tag} en el canal: ${message.channel.name} (${message.channel.id})`);
console.log(`┋[⚡] Servidor: ${message.guild ? message.guild.name : 'DM'}`);
console.log('┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•');

//const isOwner = global.owner.map(([id]) => id).includes(message.author.id);
const isOwner = global.owner.map(ownerArray => ownerArray[0]);
const prefixRegex = /^[°•π÷×¶∆£¢*€¥®™+✓_=|~!?@#$%^&.©^]/gi;
const body = message.content;
const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '';
const commandBody = body.slice(prefix.length).trim();
const args = commandBody.split(' ');
const command = args.shift().toLowerCase();

//AntiLink Discord
const antiDiscord = "https://discord.gg";
    
if (message.content.includes(antiDiscord)) {
try {
await message.delete();
await message.channel.send(`*『 ＡＮＴＩＬＩＮＫ 』*\n\nEl usuario <@${message.author.id}> acana de mandan un enlace, esta prohibido enviar links de otros servidores de Discord.`);
} catch (err) {
console.error('Error', err);
}
return;
}
    
switch (command) {
case 'setwelcome':
const channelMention = message.mentions.channels.first();
if (!channelMention) {
return message.channel.send(`❌ ACCIÓN MAL USADA\n\nEligir un canal válido para configurar bienvenida\n• Ejemplo: ${prefix + command} #canal (selecciona el canal)`);
}

db.run(`INSERT OR REPLACE INTO settings (guildId, welcomeChannelId) VALUES (?, ?)`, [message.guild.id, channelMention.id], (err) => {
if (err) {
console.error('❌ Error:', err.message);
return message.channel.send('❌ Hubo un error al guardar el canal de bienvenida.');
}
message.channel.send(`🔱 Canal de bienvenida establecido en: ${channelMention}.`);
});
break;
            
case 'setbye':
const farewellChannelMention = message.mentions.channels.first();
if (!farewellChannelMention) {
return message.channel.send(`❌ ACCIÓN MAL USADA\n\nEligir un canal válido para configurar la despedida\n• Ejemplo: ${prefix + command} #canal (selecciona el canal)`);
}

db.run(`INSERT OR REPLACE INTO settings (guildId, farewellChannelId) VALUES (?, ?)`, [message.guild.id, farewellChannelMention.id], (err) => {
if (err) {
console.error('❌ Error:', err.message);
return message.channel.send('❌ Hubo un error al guardar el canal de despedida.');
}
message.channel.send(`🔱 Canal de despedida establecido en: ${farewellChannelMention}.`);
});
break;
                
case 'id': {
if (!isOwner.includes(message.author.id)) {
return message.channel.send('❌ Este comando solo es para los propietarios del bot.');
}
const userMention = message.mentions.users.first(); 
if (userMention) {
message.channel.send(`${userMention.id}`);
} else {
message.channel.send('⚠️ Por favor menciona a un usuario para obtener su ID.');
}}
break;
                            
case 'menu': {
const embed = new EmbedBuilder()
.setColor(0x0099ff)
.setTitle('Menú')
.setDescription('Bot Nuevo básico, pocos comandos, por ahora solo:\n\n#setwelcome\n#setbye\n#play\n#speed')
.setImage('https://qu.ax/wXciz.jpg')
.setTimestamp()
.setFooter({ text: wm });

const rowMenu = new ActionRowBuilder()
.addComponents(new ButtonBuilder()
.setCustomId('opcion1')
.setLabel('Reglas')
.setStyle(ButtonStyle.Primary),
new ButtonBuilder()
.setCustomId('opcion2')
.setLabel('Opción 2')
.setStyle(ButtonStyle.Secondary),
new ButtonBuilder()
.setCustomId('opcion3')
.setLabel('Opción 3')
.setStyle(ButtonStyle.Success)
);

const msgMenu = await message.channel.send({ embeds: [embed], components: [rowMenu] });

const filterMenu = i => i.user.id === message.author.id;
const collectorMenu = msgMenu.createMessageComponentCollector({ filter: filterMenu, time: 15000 });

collectorMenu.on('collect', async interaction => {
await interaction.deferReply({ ephemeral: true });
        
if (interaction.customId === 'opcion1') {
await interaction.followUp(reglas);
} else if (interaction.customId === 'opcion2') {
await interaction.followUp('Has seleccionado la opción 2.');
} else if (interaction.customId === 'opcion3') {
await interaction.followUp('Has seleccionado la opción 3.');
}});

collectorMenu.on('end', collected => {
if (collected.size === 0) {
message.channel.send('⚠️ No seleccionaste nada.');
}})}
break;

case 'play':
const searchText = args.join(' ');
if (!searchText) {
return message.channel.send('🚩 Ejemplo de uso: #play maluma');
}

const videoSearch = await yts(searchText);
if (!videoSearch.all.length) {
return message.react("❌").then(() => message.channel.send("❌ No se encontraron resultados."));
}

const vid = videoSearch.all[0];
const videoUrl = vid.url;

const rowPlay = new ActionRowBuilder()
.addComponents(new ButtonBuilder()
.setCustomId('audio')
.setLabel('Audio')
.setStyle(ButtonStyle.Primary),
new ButtonBuilder()
.setCustomId('video')
.setLabel('Video')
.setStyle(ButtonStyle.Secondary));

const msgPlay = await message.channel.send({
content: `💖 Seleciones los que quieres hacer con **${vid.title}**?`,
components: [rowPlay]});

const filterPlay = i => i.user.id === message.author.id;
const collectorPlay = msgPlay.createMessageComponentCollector({ filter: filterPlay, time: 15000 });

collectorPlay.on('collect', async interaction => {
if (interaction.customId === 'audio') {
const apiUrl = `https://deliriussapi-oficial.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
const apiResponse = await fetch(apiUrl);
const delius = await apiResponse.json();

if (!delius.status) {
return interaction.reply("⚠️ Error al descargar el audio.");
}

const downloadUrl = delius.data.download.url;
interaction.reply({files: [{
attachment: downloadUrl,
name: `${vid.title}.mp3`
}]}).then(() => message.react("✅"));
}

if (interaction.customId === 'video') {
const apiUrl = `https://deliriussapi-oficial.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
const apiResponse = await fetch(apiUrl);
const delius = await apiResponse.json();

if (!delius.status) {
return interaction.reply("⚠️ Error al descargar el video.");
}

const downloadUrl = delius.data.download.url;

interaction.reply({files: [{attachment: downloadUrl,
name: `${vid.title}.mp4`
}]}).then(() => message.react("✅"));
}});

collectorPlay.on('end', collected => {
if (collected.size === 0) {
message.channel.send("⚠️ Tardante el seleccionar la opción, intentarlo de nuevo por favor.");
}});
break;

case 'speedtest': case 'speed': {
await message.channel.send('🚀 **Iniciando prueba de velocidad...**');
try {
const o = await exec('python3 speed.py --secure --share');
const { stdout, stderr } = o;

if (stdout.trim()) {
const match = stdout.match(/http[^"]+\.png/);
const urlImagen = match ? match[0] : null;
                    
const embed = new EmbedBuilder()
.setColor(0x0099ff)
.setTitle('🚀 Resultados de la prueba de velocidad')
.setDescription(stdout.trim())
.setTimestamp();
                    
if (urlImagen) {
embed.setImage(urlImagen);
}

await message.channel.send({ embeds: [embed] });
}

if (stderr.trim()) {
const match2 = stderr.match(/http[^"]+\.png/);
const urlImagen2 = match2 ? match2[0] : null;
const embed = new EmbedBuilder()
.setColor(0xff0000)
.setTitle('⚠️ Error')
.setDescription(stderr.trim())
.setTimestamp();

if (urlImagen2) {
embed.setImage(urlImagen2);
}

await message.channel.send({ embeds: [embed] });
}} catch (e) {
console.error(e);
await message.channel.send(`⚠️ Error: ${e.message}`);
}}
break;

default:
break;
}});

client.login('MTI5NDM3NDU0ODQwOTQyMTg4NQ.GWaH0-.4M2cQfg0bvkaDQ1bCUEoo334k4g3WSEHOuFPEI');
