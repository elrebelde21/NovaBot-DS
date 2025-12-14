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
    if (!username) return message.reply(`⚠️ **Ingresa un usuario de X (Twitter).**\nEj: \`${prefix + command} SkyUltraPlus\``);

    const loading = await message.reply("⏳ Cargando información...");

    const url = `https://api.delirius.store/tools/xstalk?username=${encodeURIComponent(username)}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json?.status || !json.data) {
    //  await loading.delete().catch(() => {});
      return loading.edit("❌ No se encontró información para ese usuario.");
    }

    const user = json.data;

    const fecha = moment()
      .tz("America/Argentina/Buenos_Aires")
      .format("DD/MM/YYYY");
    const img = user.banner || user.avatar;

    const embed = new EmbedBuilder()
      .setColor("#1DA1F2")
      .setTitle(`🐦 Perfil de X (Twitter) 🐦`)
      .setImage(img)
      .setDescription(`
**👤 Nombre:** ${user.name}
**🧷 Usuario:** @${user.username}

**✔ Verificado:** ${user.verified ? "Sí" : "No"}
**👥 Seguidores:** ${user.followers_count?.toLocaleString() || 0}
**➡️ Siguiendo:** ${user.following_count?.toLocaleString() || 0}

**💬 Tweets:** ${user.statuses_count || 0}
**❤️ Likes:** ${user.favourites_count || 0}
**🔒 Privado:** ${user.is_private ? "Sí" : "No"}

**📅 Creación:** ${user.created || "Desconocida"}

📝 **Biografía:**  
${user.description || "Sin descripción"}

🔗 **[Perfil de X](${user.url})**
`)
      .setFooter({
        text: `X • Solicitado por ${message.author.username} | ${fecha}`,
        iconURL: message.author.displayAvatarURL({ size: 256 })
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("🔗 Abrir perfil")
        .setURL(user.url)
    );

  //  await loading.delete().catch(() => {});

    return loading.edit({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.log("❌ Error XStalk:", err);
    return message.reply("❌ Error al procesar la solicitud.");
  }
};

handler.help = ["xstalk"];
handler.desc = ["Obtiene info del perfil de X (Twitter)"];
handler.tags = ["buscadores"];
handler.slash = {
  name: "xstalk",
  description: "Obtiene info del perfil de X (Twitter)",
  options: [
    {
      name: "texto",
      description: "Qué deseas buscar?",
      type: 3,
      required: false
    }
  ]
};
handler.command = /^xstalk|twitterstalk|xuser$/i;

export default handler;
