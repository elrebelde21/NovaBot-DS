import fetch from "node-fetch";
import fg from "api-dylux";
import moment from "moment-timezone";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder, 
  ButtonStyle
} from "discord.js";

let handler = async (message, { args, prefix, command }) => {
  try {
    const username = args[0];
    if (!username)return message.reply(`⚠️ **Ingresa un usuario de TikTok.**\nEj: \`${prefix + command} skyultrapluss\``);

    const loading = await message.reply("⏳ Cargando información...");

    let profile = null;
    let stats = null;
    let source = "delirius";

    try {
      const url = `https://api.delirius.store/tools/tiktokstalk?q=${encodeURIComponent(username)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data.result?.users) throw new Error("Sin datos");

      profile = data.result.users;
      stats = data.result.stats;

    } catch (e) {
      source = "dylux";
    }

    if (source === "dylux") {
      try {
        const res = await fg.ttStalk(username);

        profile = {
          username: res.username,
          nickname: res.name,
          avatarLarger: res.profile,
          verified: false,
          signature: res.desc
        };

        stats = {
          followerCount: res.followers,
          followingCount: res.following,
          heartCount: res.likes,
          videoCount: res.videos
        };
      } catch (err) {
        //await loading.delete().catch(() => {});
        return loading.edit("❌ No se pudo obtener información del usuario.");
      }
    }

    const fecha = moment().tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY");

    const embed = new EmbedBuilder()
      .setColor("#FE2C55")
      .setTitle(`👤 Perfil de TikTok`)
      .setImage(profile.avatarLarger)
      .setDescription(`
**👤 Usuario:** ${profile.username}
**📛 Nickname:** ${profile.nickname}

**✔ Verificado:** ${profile.verified ? "Sí" : "No"}

**👥 Seguidores:** ${Number(stats.followerCount).toLocaleString()}
**🔄 Siguiendo:** ${Number(stats.followingCount).toLocaleString()}
**❤️ Likes totales:** ${Number(stats.heartCount).toLocaleString()}
**🎬 Videos:** ${Number(stats.videoCount).toLocaleString()}

**📝 Biografía:**  
${profile.signature || "Sin descripción"}

🔗 **[URL del perfil](https://tiktok.com/@${profile.username})**
        `
      )
      .setFooter({
        text: `Tiktokstalk • Solicitado por ${message.author.username} | ${fecha}`,
        iconURL: message.author.displayAvatarURL({ size: 256 })
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("🔗 Abrir TikTok")
        .setURL(`https://tiktok.com/@${profile.username}`)
    );

   // await loading.delete().catch(() => {});

    return loading.edit({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.log("Error TikTok:", err);
    return message.reply("\n❌ Error al procesar la solicitud.");
  }
};

handler.help = ["tiktokstalk"];
handler.desc = ["Obtiene información del perfil de TikTok"];
handler.tags = ["buscadores"];
handler.slash = {
  name: "tiktokstalk",
  description: "Obtiene información del perfil de TikTok",
  options: [
    {
      name: "texto",
      description: "Qué deseas buscar?",
      type: 3,
      required: false
    }
  ]
};
handler.command = /^tiktokstalk|ttstalk$/i;

export default handler;
