import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

let handler = async (message, { args, db, prefix, command }) => {
const subcmd = args[0]?.toLowerCase() || "";
const guildId = message.guild.id;

if (subcmd === "list" && args[1] === "rol") {
const roles = message.guild.roles.cache
.sort((a, b) => b.position - a.position)
.map(r => `• <@&${r.id}> — \`${r.id}\``)
.join("\n");

const rolesEmbed = new EmbedBuilder()
.setColor('#5865F2')
.setTitle('🧩 Roles del Servidor')
.setDescription(`Aquí tienes la lista de roles:\n\n${roles}`)
.setThumbnail(message.guild.iconURL({ dynamic: true }))
.setFooter({ text: `Total de roles: ${message.guild.roles.cache.size}` });

return message.reply({ embeds: [rolesEmbed] });
}

if (subcmd === "delete" && args[1] === "rol") {
if (!db.data.settings[guildId].welcomeRoleId) return message.reply("⚠️ No hay rol configurado.");
delete db.data.settings[guildId].welcomeRoleId;
await db.write();

return message.reply("🗑️ **Rol automático eliminado correctamente.**");
}

if (subcmd === "rol") {
const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
if (!role) return message.reply(`⚠️ Menciona un rol válido.\nEj: \`${prefix + command} rol @Miembro\``);
db.data.settings[guildId].welcomeRoleId = role.id;
await db.write();

return message.reply(`🎯 **Rol configurado:** <@&${role.id}>`);
}

const channelMention = message.mentions.channels.first();

if (!channelMention) {
const helpEmbed = new EmbedBuilder()
.setColor('#FF69B4')
.setTitle('⚠️ Acción incorrecta')
.setDescription(`Debes mencionar un **canal válido** para configurar la bienvenida.

### 📌 **Uso básico**
\`${prefix + command} #canal\`

---

### 🎨 **Variables disponibles**
- **#user** → Nombre del usuario  
- **#tag** → Mención del usuario  
- **#guild** → Nombre del servidor  
- **#members** → Total de miembros  
- **#date** → Fecha actual  
- **#time** → Hora actual  
- **#joined** → Fecha de creación de la cuenta  
- **#id** → ID del usuario  
- **#serverid** → ID del servidor  
- **#position** → Número del usuario en el servidor  

---

### 📝 **Ejemplo mensaje personalizado**
\`${prefix + command} #canal Bienvenido #user | Estamos felices de verte #tag | Miembro #position | https://url.com/icon.png | Hola #tag, disfruta el server\`

---

## 🧩 **Gestión de roles automáticos**

### 🟢 Asignar rol automático
\`${prefix + command} rol @Miembro\`

### 📋 Listar roles
\`${prefix + command} list rol\`

### 🗑️ Eliminar rol automático
\`${prefix + command} delete rol\`

---

⚠️ **Importante:**  
El bot debe tener **MANAGE_ROLES** y su rol debe estar **por encima** del rol asignado`)
.setImage("https://cdn.skyultraplus.com/uploads/u4/560eceb6f615dab3.jpg");
return message.reply({ embeds: [helpEmbed] });
}

const options = args.slice(1).join(" ");
const [title, description, footer, footerIcon, welcomeMessage] = (options.includes("|") ? options.split("|") : options.split(",")).map(s => s?.trim());

const embedOptions = {
title: title || null,
description: description || null,
footerText: footer || null,
footerIcon: footerIcon || null,
};

db.data.settings[guildId] = {
...db.data.settings[guildId],
welcomeChannelId: channelMention.id,
welcomeEmbed: embedOptions,
welcomeMessage: welcomeMessage || null,
};
await db.write();

const confirm = new EmbedBuilder()
.setColor("#43B581")
.setTitle("✅ Configuración actualizada")
.addFields({ name: "📢 Canal", value: `<#${channelMention.id}>` },
{ name: "🖋️ Título", value: `\`${embedOptions.title || "Predeterminado"}\`` },
{ name: "📖 Descripción", value: `\`${embedOptions.description || "Predeterminado"}\`` },
{ name: "📝 Footer", value: `\`${embedOptions.footerText || "Predeterminado"}\`` },
{ name: "🔗 Icono", value: embedOptions.footerIcon || "Predeterminado" },
{ name: "📜 Mensaje personalizado", value: `\`${welcomeMessage || "Predeterminado"}\`` },
)

const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
.setCustomId("previewWelcome")
.setLabel("👀 Ver bienvenida")
.setStyle(ButtonStyle.Primary)
);

const msg = await message.reply({ embeds: [confirm], components: [row] });
const collector = msg.createMessageComponentCollector({ time: 60_000 });

collector.on("collect", async (i) => {
if (i.user.id !== message.author.id) return i.reply({ content: "❌ Solo quien configuró puede ver la preview.", ephemeral: true });

if (i.customId === "previewWelcome") {
const member = message.member;
const avatar = member.user.displayAvatarURL({ dynamic: true });

function replaceVars(t) {
if (!t) return t;
const now = new Date();

return t
.replace(/#user/g, member.user.username)
.replace(/#tag/g, `<@${member.user.id}>`)
.replace(/#guild/g, message.guild.name)
.replace(/#members/g, message.guild.memberCount.toString())
.replace(/#date/g, now.toLocaleDateString("es-AR"))
.replace(/#time/g, now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
.replace(/#joined/g, new Date(member.user.createdAt).toLocaleDateString("es-AR"))
.replace(/#id/g, member.user.id)
.replace(/#serverid/g, message.guild.id)
.replace(/#position/g, message.guild.memberCount.toString());
}

const previewMsg = replaceVars(db.data.settings[guildId].welcomeMessage || "🎉 Bienvenido #tag!");

const embedPrev = new EmbedBuilder()
.setColor("#FF69B4")
.setTitle(replaceVars(embedOptions.title || "🎉 ¡Gracias por unirte!"))
.setDescription(replaceVars(embedOptions.description || "Hola #user, disfruta"))
.setThumbnail(avatar)
.setFooter({text: replaceVars(embedOptions.footerText || "Miembro #members"),
iconURL: embedOptions.footerIcon || avatar
});

return i.reply({content: "👀 **Vista previa de la bienvenida:**\n" + previewMsg, embeds: [embedPrev], ephemeral: true });
}
});
};
handler.help = ['setwelcome'];
handler.tags = ['group'];
handler.command = /^setwelcome$/i;
handler.admin = true;
handler.botAdmin = true;

export default handler;
