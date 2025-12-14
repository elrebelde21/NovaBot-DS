import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} from "discord.js";

const KO_COOLDOWN = 15 * 60 * 1000; // 15 min
const FAIL_CHANCE = 0.2;           // 20% fallo base
const DROP_CHANCE = 0.15;          // 15% drop raro

// 🎁 DROPS RAROS
const DROPS = [
  { id: "gema_brillante", name: "💠 Gema Brillante", chance: 40 },
  { id: "reliquia_antigua", name: "🏺 Reliquia Antigua", chance: 25 },
  { id: "nucleo_energetico", name: "⚡ Núcleo Energético", chance: 20 },
  { id: "fragmento_divino", name: "🌠 Fragmento Divino", chance: 15 }
];

const handler = async (message) => {
  const userId = message.author.id;
  const user = global.db.data.users[userId];

  if (!user) return message.reply("✳️ Usuario no registrado.");

  // ===== INIT =====
  const rpg = global.rpg;
  user.pickaxe ||= "wood";
  user.inventory ||= [];
  user.lastKnockout ||= 0;

  const pickaxe = rpg[user.pickaxe] || rpg.wood;

  // ===== KNOCKOUT CHECK =====
  if (user.health <= 0) {
    const t = user.lastKnockout + KO_COOLDOWN;
    if (Date.now() < t) {
      return message.reply(
        `💀 Estás desmayado.\n⏳ Espera *${msToTime(t - Date.now())}* para recuperarte.`
      );
    } else {
      user.health = 30;
    }
  }

  // ===== COOLDOWN =====
  const cooldown = 400000;
  if (Date.now() - user.lastmiming < cooldown) {
    return message.reply(
      `⏳ Espera *${msToTime(user.lastmiming + cooldown - Date.now())}* para volver a minar`
    );
  }

  // ===== MINAS =====
  const minas = [
    { id: "penumbra", nombre: "⛏️ Penumbra", recom: [300,700],  req:{level:0,money:0,health:0},  cost:{money:0,health:5}},
    { id: "mistica",  nombre: "🪨 Caverna Mística", recom:[700,1500], req:{level:3,money:0,health:10}, cost:{money:0,health:10}},
    { id: "abismo",   nombre: "⚡ Abismo", recom:[900,2000], req:{level:5,money:10,health:20}, cost:{money:10,health:18}},
    { id: "zona",     nombre: "❓ Zona Desconocida", recom:[1200,2600], req:{level:8,money:50,health:30}, cost:{money:50,health:25}},
    { id: "infernal", nombre: "🔥 Mina Infernal", recom:[4000,7500], req:{level:15,money:1000,health:60}, cost:{money:100,health:40}},
    { id: "divina",   nombre: "🌠 Mina Divina", recom:[12000,18000], req:{level:25,money:3000,health:90}, cost:{money:100,health:60}}
  ];

  // ===== MENU =====
  const select = new StringSelectMenuBuilder()
    .setCustomId("minar_select")
    .setPlaceholder("⛏️ Elige una mina…")
    .addOptions(minas.map(m => {
      const ok =
        user.level >= m.req.level &&
        user.money >= m.req.money &&
        user.health >= m.req.health;

      const dmg = Math.max(1, m.cost.health - pickaxe.reduce);

      return {
        label: m.nombre,
        value: m.id,
        description: ok
          ? `XP ${m.recom[0]}-${m.recom[1]} | 💸-${m.cost.money} ❤-${dmg}`
          : `🔒 Req: Lv ${m.req.level}, $${m.req.money}, ❤ ${m.req.health}`
      };
    }));

  const msg = await message.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("#6A00FF")
        .setTitle("⛏️ Sistema de Minería • NovaBot-DS")
        .setDescription(`
👤 **Minero:** <@${userId}>

📊 **Tus stats**
• Nivel: ${user.level}
• Dinero: $${user.money}
• Salud: ❤ ${user.health}

⛏️ **Pico equipado:** ${pickaxe.name}
🛡️ **Reducción de daño:** ${pickaxe.reduce}

🌌 Selecciona una mina para comenzar la excavación.
⚠️ Cada zona tiene riesgos y recompensas distintas.
        `)
    ],
    components: [new ActionRowBuilder().addComponents(select)]
  });

  const collector = msg.createMessageComponentCollector({
    filter: i => i.user.id === userId,
    time: 60_000,
    max: 1
  });

  collector.on("collect", async i => {
    const mina = minas.find(m => m.id === i.values[0]);
    if (!mina) return;

    // ===== VALIDAR =====
    if (
      user.level < mina.req.level ||
      user.money < mina.req.money ||
      user.health < mina.req.health
    ) {
      return i.reply({
        content: "❌ No cumples los requisitos.",
        ephemeral: true
      });
    }

    user.lastmiming = Date.now();

    // ===== FALLO =====
    const failed = Math.random() < FAIL_CHANCE;
    const damage = Math.max(1, mina.cost.health - pickaxe.reduce);

    user.money -= mina.cost.money;
    user.health -= damage;
    if (user.health <= 0) {
      user.health = 0;
      user.lastKnockout = Date.now();
    }

    let baseXP = 0;
    let dropText = "—";

    if (!failed) {
      baseXP =
        Math.floor(Math.random() * (mina.recom[1] - mina.recom[0])) +
        mina.recom[0];

      if (Math.random() < 0.15) baseXP *= 2;
      user.exp += baseXP;

      // 🎁 DROP RARO
      if (Math.random() < DROP_CHANCE) {
        const roll = Math.random() * 100;
        let acc = 0;
        const drop = DROPS.find(d => (acc += d.chance) >= roll);
        if (drop) {
          user.inventory.push(drop.id);
          dropText = drop.name;
        }
      }
    }

    const embed = new EmbedBuilder()
      .setColor(failed ? "#E74C3C" : "#00E5FF")
      .setTitle(failed ? "💥 ¡FALLO DE MINERÍA!" : "⛏️ ¡MINERÍA COMPLETADA!")
      .setDescription(`
${failed ? "❌ No lograste extraer nada." : `✨ Ganaste **${baseXP} XP**`}

🧭 **Zona:** ${mina.nombre}
🩸 **Daño:** ${damage}
🎁 **Drop:** ${dropText}

💸 Dinero: $${user.money}
❤ Salud: ${user.health}
      `)
      .setTimestamp();

    await i.update({ embeds: [embed], components: [] });
  });
};

handler.help = ["minar"];
handler.tags = ["econ"];
handler.command = /^(minar|mine|miming)$/i;
handler.register = true;

handler.slash = {
  name: "minar",
  description: "⛏️ Minar y obtener recompensas épicas"
};

export default handler;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function msToTime(ms) {
  let s = Math.floor((ms / 1000) % 60);
  let m = Math.floor((ms / 1000 / 60) % 60);
  return `${m}m ${s}s`;
}
