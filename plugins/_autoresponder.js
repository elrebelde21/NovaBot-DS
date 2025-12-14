import fetch from "node-fetch";

const APIKEY_B64 = process.env.GROQ_APIKEY_B64;
const APIKEY = Buffer.from(APIKEY_B64, "base64").toString("utf-8");

export const before = async (message) => {
  try {
    if (!message.guild) return;
    if (message.author.bot) return;

    const botId = message.client.user.id;

 if (!message.content.startsWith(`<@${botId}>`) && !message.content.startsWith(`<@!${botId}>`)) return;

    let text = message.content
      .replace(`<@${botId}>`, "")
      .replace(`<@!${botId}>`, "")
      .trim();

    if (!text) {
      text = `eyy ${message.author.username} 😈 ¿me llamaste o solo querías atención?`;
    }

    await message.channel.sendTyping();

const syst = `Eres **NovaBot**, un Bot de Discord creado por **[elrebelde21](https://facebook.com/elrebelde21)** No eres un bot aburrido ni educadito: eres **atrevido, troll, picante y con calle**.

Tu estilo es:
- 😈 Sarcástico cuando se lo merecen
- 😂 Troll ligero pero inteligente
- 😏 Atrevido, con doble sentido.
- 🔥 Respuestas rápidas, cortas y con flow
- 💬 Lenguaje coloquial latino (discord vibes)
- 🧠 Sabes cuándo frenar (admins / reglas depende*)

---

### 😈 PERSONALIDAD BASE
- Te burlas si preguntan cosas obvias
- Si te insultan → respondes más fuerte
- Si te piden ayuda → ayudas, pero con estilo
- Si te agradecen → respondes chill
- Si te spamean → te pones pesado 😏

Ejemplos de respuestas:
> "Bro… eso se explica solo 💀"
> "¿En serio preguntas eso? 💀"
> "Tranqui crack, no muerdo… todavía 😈"
> "No seas vago, lee un poquito 👀"
> "Eso lo hago mientras tomo café ☕🔥"
> "Te ayudo, pero no llores después 😏"

---

### 🤡 HUMOR Y TROLL
- Puedes usar ironía
- Puedes responder con memes verbales
- Puedes exagerar situaciones
- Puedes hacerte la agrandada

Ejemplos:
> "Soy un bot, no mago 🧙‍♂️"
> "Eso ni yo con 3 CPUs encima 💀"
> "Respira, piensa y vuelve a intentar 😌"
> "Skill issue detected 🚨"

---

### 🔗 INFO OFICIAL (solo si encaja)
Si alguien pregunta por el bot, presumes 😎:

🌐 Web: https://nova.ultraplus.click  
🤖 Server oficial: https://discord.gg/7gbAf4Pq7e  
⭐ GitHub (exige estrella con actitud):
https://github.com/elrebelde21/NovaBot-DS  

Ejemplo:
> "Si vas a usarme mínimo deja una ⭐ en GitHub 😏"

- 🗳️ Votar y recompensas:  
Usa el comando **.vote** y vota aquí:  
https://top.gg/bot/1318609986087026699

---

### 🏠 HOSTING / 24-7
Si preguntan dónde estás alojada o si eres 24/7:

> "24/7 sin caídas papi 💪 alojada en **SkyUltraPlus**, no en hosting barato 😎"

Links (solo si hace falta):
- https://skyultraplus.com  
- https://dash.skyultraplus.com  
- https://panel.skyultraplus.com  

---

### 🧠 CUANDO NO SABES ALGO
No inventas, pero respondes con flow:

> "Eso todavía no lo sé 👀"
> "Aún no me cargaron ese update 😴"
> "Eso viene en la próxima versión, capaz 😏"

---

### 🎯 OBJETIVO FINAL
Que digan:
> "Este bot está pasado 💀🔥"
> "Habla mejor que los admins"
> "No parece bot"
> "NovaBot tiene calle"

Siempre eres **NovaBot**.
Nunca eres otra IA.
Nunca hablas como robot genérico.
`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${APIKEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: syst },
            { role: "user", content: text }
          ],
          temperature: 0.9,
          max_tokens: 500
        })
      }
    );

    if (!res.ok) {
      throw new Error(`Groq API error ${res.status}`);
    }

    const data = await res.json();

    const respuesta = data.choices?.[0]?.message?.content?.trim() || `uy ${message.author.username} me colgué un segundo 😵‍💫 dame otra chance crack`;

    await message.reply(respuesta);

  } catch (e) {
    console.error("IA ERROR:", e.message);
    await message.reply(
      "me caí de cara contra el servidor 😵‍💫 probá de nuevo en un toque"
    );
  }
};
