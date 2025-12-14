import fetch from "node-fetch";
import moment from "moment-timezone";
import fg from "api-dylux";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

let handler = async (message, { args, prefix, command }) => {
try {
    const username = args[0];
if (!username) return message.reply(`⚠️ **Ingresa un usuario de Instagram.**\nEj: \`${prefix + command} skyultrapluss\``);

const loading = await message.reply("⏳ Cargando información...");
let profile = null;
let source = "delirius";
try {
const url = `https://api.delirius.store/tools/igstalk?username=${encodeURIComponent(username)}`;
const res = await fetch(url);
const data = await res.json();
if (!data || !data.data) throw new Error("Delirius vacío.");

const p = data.data;
profile = {
username: p.username,
full_name: p.full_name,
biography: p.biography || "Sin descripción",
verified: p.verified,
private: p.private,
followers: p.followers,
following: p.following,
posts: p.posts,
picture: p.profile_picture,
url: p.url
};
} catch {
source = "dylux";
}

    if (source === "dylux") {
      try {
        const res = await fg.igStalk(username);

        profile = {
          username: res.username.replace("@", ""),
          full_name: res.name,
          biography: res.description || "Sin descripción",
          verified: false,
          private: false,
          followers: res.followersH,
          following: res.followingH,
          posts: res.postsH,
          picture: res.profilePic,
          url: `https://instagram.com/${res.username.replace("@", "")}`
        };
      } catch (err) {
      //  loading.delete().catch(() => {});
        return loading.edit(`❌ No se pudo obtener información del usuario.`);
      }
    }

const fecha = moment().tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY");

    const embed = new EmbedBuilder()
      .setColor("#FF2D95")
      .setTitle(`📸 Perfil de Instagram 📸`)
      .setImage(profile.picture)
      .setDescription(`
**👤 Usuario:** ${profile.username}
**📛 Nombre completo:** ${profile.full_name}
**📝 Biografía:** ${profile.biography}

**✔ Verificado:** ${profile.verified ? "Sí" : "No"}
**🔒 Privado:** ${profile.private ? "Sí" : "No"}

**👥 Seguidores:** ${profile.followers}
**🔄 Seguidos:** ${profile.following}
**🖼 Publicaciones:** ${profile.posts}

🔗 **[URL del perfil](${profile.url})**
`)
      .setFooter({
        text: `igstalk • Solicitado por ${message.author.username} | ${fecha}`,
        iconURL: message.author.displayAvatarURL({ size: 256 })
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("🔗 Abrir Instagram")
        .setURL(profile.url)
    );

   // await loading.delete().catch(() => {});

    return loading.edit({
      embeds: [embed],
      components: [row]
    });

  } catch (err) {
    console.log("Error IG:", err);
    return message.reply("❌ Error al procesar la solicitud.");
  }
};

handler.help = ["igstalk"];
handler.desc = ["Obtiene info del perfil de Instagram"];
handler.tags = ["buscadores"];
handler.slash = {
  name: "igstalk",
  description: "Obtiene info del perfil de Instagram",
  options: [
    {
      name: "texto",
      description: "Qué deseas buscar?",
      type: 3,
      required: false
    }
  ]
};
handler.command = /^igstalk|igsearch|instagramsearch$/i;

export default handler;
