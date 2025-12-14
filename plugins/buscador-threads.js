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
    if (!username) return message.reply(`⚠️ **Ingresa un usuario de Threads.**\nEj: \`${prefix + command} SkyUltraPlus\``);

    const loading = await message.reply("⏳ Cargando información...");

    const apiUrl = `https://api.delirius.store/tools/threadsststalk?username=${encodeURIComponent(username)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.status || !data.data) {
      //await loading.delete().catch(() => {});
      return loading.edit("❌ No se encontró información para ese usuario.");
    }

    const user = data.data;

    const fecha = moment().tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY");
    const profileURL = `https://www.threads.net/@${user.username}`;

    const embed = new EmbedBuilder()
      .setColor("#FF5A8F")
      .setTitle(`👤 Perfil de Threads 👤`)
      .setImage(user.profile_picture)
      .setDescription(`
**👤 Nombre:** ${user.name}
**🧷 Usuario:** @${user.username}

**✔ Verificado:** ${user.is_verified ? "Sí" : "No"}
**👥 Seguidores:** ${user.followers?.toLocaleString() ?? 0}

📝 **Biografía:**  
${user.bio || "Sin descripción"}

🔗 **Links:**  
${user.links?.length ? user.links.join("\n") : "Sin enlaces"}

🌐 **[Perfil de Threads](${profileURL})**
`)
      .setFooter({
        text: `Threads • Solicitado por ${message.author.username} | ${fecha}`,
        iconURL: message.author.displayAvatarURL({ size: 256 })
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("🔗 Abrir Threads")
        .setURL(profileURL)
    );

  //  await loading.delete().catch(() => {});

    return loading.edit({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.error("❌ Error en ThreadsStalk:", err);
    return message.reply("❌ Error al procesar la solicitud.");
  }
};

handler.help = ["threadsstalk"];
handler.desc = ["Obtiene info de un usuario de Threads"];
handler.tags = ["buscadores"];
handler.slash = {
  name: "threadsstalk",
  description: "Obtiene info de un usuario de Threads",
  options: [
    {
      name: "texto",
      description: "Qué deseas buscar?",
      type: 3,
      required: false
    }
  ]
};
handler.command = /^threadsstalk|tstalk$/i;

export default handler;
