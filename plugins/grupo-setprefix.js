const handler = async (message, { db, prefix, args }) => {
if (!message.guild) return message.reply("Solo funciona en servidores");

if (!args.length) {
const current = db.data.settings[message.guild.id]?.prefix || "Predeterminados (., /, #, !, ×, *, -)";
return message.reply(`Prefijo actual: **${current}**\n\nUso:\n${prefix}setprefix #\n${prefix}setprefix #,/,!\n${prefix}setprefix noprefix`);
}

const settings = db.data.settings[message.guild.id] || {};

if (args.join(" ").toLowerCase() === "noprefix") {  
settings.prefix = null;
db.data.settings[message.guild.id] = settings;
await db.write();
return message.reply("Prefijo desactivado. El bot responderá sin prefijo en este servidor");
}

const newPrefixes = args.join(" ").split(",").map(p => p.trim()).filter(p => p); 
if (newPrefixes.length === 0) return message.reply("Escribe al menos un prefijo válido");
settings.prefix = newPrefixes;
db.data.settings[message.guild.id] = settings;
await db.write();

message.reply(`Prefijos actualizados: **${newPrefixes.join(", ")}**`);
};
handler.help = ["setprefix"];
handler.tags = ["group"];
handler.command = /^setprefix$/i;
handler.admin = true;
export default handler;