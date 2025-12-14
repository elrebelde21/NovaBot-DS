import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

/* ===============================
   MINAS
================================ */
const minas = [
  { nombre: "⛏️ Penumbra [#1]", value: "penumbra" },
  { nombre: "⛏️ Caverna Mística [#2]", value: "caverna" },
  { nombre: "⛏️ Abismo [#3]", value: "abismo" },
  { nombre: "⛏️ Desconocido [#4]", value: "desconocido" },
  { nombre: "🔥 Inferno [#5]", value: "inferno" },
  { nombre: "❄️ Caverna de Hielo [#6]", value: "hielo" },
  { nombre: "🗻 Scala [#7]", value: "scala" },
  { nombre: "🧱 Mura [#8]", value: "mura" },
  { nombre: "💠 Mina Prisma [#9]", value: "prisma" },
  { nombre: "🌌 Mina Estelar [#10]", value: "estelar" }
];

/* ===============================
   SLASH /mine
================================ */
const handler = async (interaction) => {

  // SOLO slash command (type 2)
  if (interaction.type !== 2) return;

  const menu = new StringSelectMenuBuilder()
    .setCustomId("menu_mina")
    .setPlaceholder("⛏️ Selecciona una mina")
    .addOptions(
      minas.map(m => ({
        label: m.nombre,
        value: m.value
      }))
    );

  const row = new ActionRowBuilder().addComponents(menu);

  const embed = new EmbedBuilder()
    .setColor("#7C3AED")
    .setTitle("⛏️ Sistema de Minería")
    .setDescription("Elige una mina del menú para comenzar a minar.");

  await interaction.reply({
    embeds: [embed],
    components: [row]
  });
};

/* ===============================
   SLASH DATA
================================ */
handler.slash = {
  name: "mine",
  description: "Abrir menú de minería"
};

/* ===============================
   MENU HANDLER
================================ */
export const menuHandler = async (interaction) => {

  // SOLO select menu (type 3)
  if (interaction.type !== 3) return;
  if (interaction.customId !== "menu_mina") return;

  const userId = interaction.user.id;
  const user = global.db.data.users[userId];

  if (!user) {
    return interaction.reply({
      content: "✳️ El usuario no se encuentra en mi base de datos.",
      ephemeral: true
    });
  }

  // cooldown
  const cooldown = 400000;
  const timeLeft = user.lastmiming + cooldown - Date.now();

  if (timeLeft > 0) {
    return interaction.reply({
      content: `⏳ Espera *${msToTime(timeLeft)}* para volver a minar`,
      ephemeral: true
    });
  }

  const zona = minas.find(m => m.value === interaction.values[0]);
  const hasil = Math.floor(Math.random() * 6000);

  const minar = pickRandom([
    'Que pro 😎 has minado',
    '🌟✨ Genial!! Obtienes',
    'WOW!! eres un(a) gran Minero(a) ⛏️ Obtienes',
    'Has Minado!!',
    '😲 Lograste Minar la cantidad de',
    'Tus Ingresos subiran gracias a que minaste',
    '⛏️⛏️⛏️ Minando',
    '🤩 SII!!! AHORA TIENES',
    'La minería está de tu lado, por ello obtienes',
    '😻 La suerte de Minar',
    '♻️ Tu misión se ha cumplido, lograste minar',
    '⛏️ La minería te ha beneficiado con',
    '👾 Gracias a que has minado tus ingresos suman',
    'Felicidades!! Ahora tienes',
    '⛏️⛏️⛏️ Obtienes'
  ]);

  user.exp += hasil;
  user.lastmiming = Date.now();

  const embed = new EmbedBuilder()
    .setColor("#7C3AED")
    .setTitle("⛏️ Sistema de Minería")
    .setDescription(`
${minar} **${hasil} XP**

> 🧭 Mina: **${zona.nombre}**
> 👤 Minero: <@${userId}>
    `)
    .setFooter({ text: "Sistema de Minería" })
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: []
  });
};

export default handler;

/* ===============================
   UTILS
================================ */
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function msToTime(ms) {
  let s = Math.floor((ms / 1000) % 60);
  let m = Math.floor((ms / 60000) % 60);
  return `${m} minuto(s) ${s} segundo(s)`;
}
