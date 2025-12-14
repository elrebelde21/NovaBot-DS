import fetch from "node-fetch";
import moment from "moment-timezone";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

let handler = async (message, { args, prefix, command }) => {
  try {
    const username = args.join(" ");
    if (!username) return message.reply(`⚠️ **Ingresa un usuario de Roblox.**\nEj: \`${prefix + command} elrebelde21\``);

    const loading = await message.reply("⏳ Cargando información...");

    const url = `https://api.delirius.store/tools/robloxstalk?username=${encodeURIComponent(username)}&type=name`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json?.status || !json.data) {
      await loading.delete().catch(() => {});
      return message.reply("❌ No se encontró información para ese usuario.");
    }

    const user = json.data;
    let groupsTxt = "No se encontraron grupos.";
    if (user.groups?.length) {
      groupsTxt = user.groups
        .slice(0, 5)
        .map(
          (g, i) =>
            `**${i + 1}. ${g.groupName}**\n• Rol: ${g.role}\n• 👥 ${g.memberCount} miembros`
        )
        .join("\n\n");
    }

    let gameTxt = "No tiene juegos creados.";
    if (user.gamesCreated?.length) {
      const g = user.gamesCreated[0];
      gameTxt = `**${g.name}**\n🎮 Jugando: ${g.playing}\n📅 Creado: ${g.created}`;
    }

    const fecha = moment().tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY");

    const embed = new EmbedBuilder()
      .setColor("#00A2FF")
      .setTitle(`🎮 Perfil de Roblox 🎮`)
      .setImage(user.profile_image)
      .setDescription(`
**👤 Nombre:** ${user.name}
**🧩 Usuario:** ${user.username}
**🆔 ID:** ${user.id}

**✔ Verificado:** ${user.hasVerified ? "Sí" : "No"}
**🚫 Suspendido:** ${user.isBanned ? "Sí" : "No"}
**🌍 País:** ${user.extraInfo?.country || "Desconocido"}
**📀 Estado de cuenta:** ${user.extraInfo?.accountStatus || "Desconocido"}

**👥 Amigos:** ${user.friends?.toLocaleString()}
**➡️ Siguiendo:** ${user.followings?.toLocaleString()}
**👤 Seguidores:** ${user.followers?.toLocaleString()}

**📅 Cuenta creada:** ${user.created}
**📝 Descripción:**  
${user.description || "Sin descripción"}

---

### 🏷️ Grupos recientes
${groupsTxt}

---

### 🕹️ Juego creado
${gameTxt}

🔗 **[Perfil de Roblox](${user.url})**
`)
      .setFooter({
        text: `Roblox • Solicitado por ${message.author.username} | ${fecha}`,
        iconURL: message.author.displayAvatarURL({ size: 256 })
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("🔗 Abrir perfil")
        .setURL(user.url)
    );

    await loading.delete().catch(() => {});

    return message.reply({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.log("Error Roblox:", err);
    return message.reply("❌ Error al procesar la solicitud.");
  }
};

handler.help = ["roblox"];
handler.desc = ["Busca información de un usuario de Roblox"];
handler.tags = ["buscadores"];
handler.slash = {
  name: "roblox",
  description: "Busca información de un usuario de Roblox",
  options: [
    {
      name: "texto",
      description: "Qué deseas buscar?",
      type: 3,
      required: false
    }
  ]
};
handler.command = /^robloxstalk|rbstalk|roblox$/i;

export default handler;
