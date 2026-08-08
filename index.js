const { Telegraf, Markup } = require("telegraf")
const config = require("./config")
const path = require("path")

if (!config.BOT_TOKEN || config.BOT_TOKEN === "YOUR_BOT_TOKEN") {
  throw new Error("BOT_TOKEN belum diisi di config.js")
}

const bot = new Telegraf(config.BOT_TOKEN)
const startTime = Date.now()

function getUptime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${days}d ${hours}h ${minutes}m ${secs}s`
}

async function isJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(
      config.CHANNEL_USERNAME,
      ctx.from.id
    )

    return ["creator", "administrator", "member"].includes(member.status)
  } catch (error) {
    console.error("Force Join Error:", error.message)
    return false
  }
}

function lockedKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.url(
        "📢 JOIN CHANNEL",
        config.CHANNEL_URL
      )
    ],
    [
      Markup.button.callback(
        "✅ CEK JOIN",
        "check_join"
      )
    ]
  ])
}

function mainKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "🚀 DEPLOY",
        "deploy"
      )
    ],
    [
      Markup.button.callback(
        "📋 MENU",
        "menu"
      ),
      Markup.button.callback(
        "👤 PROFILE",
        "profile"
      )
    ],
    [
      Markup.button.callback(
        "ℹ️ ABOUT",
        "about"
      )
    ]
  ])
}

function lockedText() {
  return `🔒 *AKSES DIKUNCI*

Silahkan join channel terlebih dahulu untuk menggunakan bot *${config.BOT_NAME}*.

Setelah join, tekan tombol *✅ CEK JOIN*.`
}

function getStartCaption(ctx) {
  return `🤖 *${config.BOT_NAME}*

👋 Halo, ${ctx.from.first_name || "User"}!

📌 Bot Name : ${config.BOT_NAME}
⚡ Version  : ${config.BOT_VERSION}
🟢 Runtime  : ${process.version}
⏱️ Uptime   : ${getUptime()}

🚀 Selamat datang di *${config.BOT_NAME}*!`
}

async function sendStartMenu(ctx) {
  const joined = await isJoined(ctx)

  if (!joined) {
    return ctx.reply(
      lockedText(),
      {
        parse_mode: "Markdown",
        ...lockedKeyboard()
      }
    )
  }

  const imagePath = path.join(
    __dirname,
    "image",
    "menu.png"
  )

  return ctx.replyWithPhoto(
    { source: imagePath },
    {
      caption: getStartCaption(ctx),
      parse_mode: "Markdown",
      ...mainKeyboard()
    }
  )
}

bot.start(async ctx => {
  try {
    await sendStartMenu(ctx)
  } catch (error) {
    console.error("START ERROR:", error)
    await ctx.reply("❌ Terjadi kesalahan saat membuka menu.")
  }
})

bot.command("menu", async ctx => {
  try {
    const joined = await isJoined(ctx)

    if (!joined) {
      return ctx.reply(
        lockedText(),
        {
          parse_mode: "Markdown",
          ...lockedKeyboard()
        }
      )
    }

    await ctx.reply(
      `📋 *${config.BOT_NAME} MENU*

🚀 Deploy
📦 ZIP / HTML
🧠 Auto Framework Detection
⚙️ Auto Vercel Preset
🌐 Custom Domain`,
      {
        parse_mode: "Markdown",
        ...mainKeyboard()
      }
    )
  } catch (error) {
    console.error("MENU ERROR:", error)
  }
})

bot.command("profile", async ctx => {
  try {
    const joined = await isJoined(ctx)

    if (!joined) {
      return ctx.reply(
        lockedText(),
        {
          parse_mode: "Markdown",
          ...lockedKeyboard()
        }
      )
    }

    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : "Tidak tersedia"

    await ctx.reply(
      `👤 *PROFILE*

🆔 ID : \`${ctx.from.id}\`
👤 Name : ${ctx.from.first_name || "-"}
🔗 Username : ${username}
🌐 Language : ${ctx.from.language_code || "-"}`,
      {
        parse_mode: "Markdown",
        ...mainKeyboard()
      }
    )
  } catch (error) {
    console.error("PROFILE ERROR:", error)
  }
})

bot.command("about", async ctx => {
  try {
    const joined = await isJoined(ctx)

    if (!joined) {
      return ctx.reply(
        lockedText(),
        {
          parse_mode: "Markdown",
          ...lockedKeyboard()
        }
      )
    }

    await ctx.reply(
      `ℹ️ *ABOUT*

🤖 Bot : ${config.BOT_NAME}
⚡ Version : ${config.BOT_VERSION}
🟢 Runtime : ${process.version}
📦 Framework : Telegraf

🚀 ReyCloud Deploy`,
      {
        parse_mode: "Markdown",
        ...mainKeyboard()
      }
    )
  } catch (error) {
    console.error("ABOUT ERROR:", error)
  }
})

bot.action("check_join", async ctx => {
  try {
    await ctx.answerCbQuery("🔎 Mengecek status join...")

    const joined = await isJoined(ctx)

    if (!joined) {
      return ctx.editMessageText(
        lockedText(),
        {
          parse_mode: "Markdown",
          ...lockedKeyboard()
        }
      )
    }

    const imagePath = path.join(
      __dirname,
      "image",
      "menu.png"
    )

    try {
      await ctx.deleteMessage()
    } catch {}

    await ctx.replyWithPhoto(
      { source: imagePath },
      {
        caption: getStartCaption(ctx),
        parse_mode: "Markdown",
        ...mainKeyboard()
      }
    )
  } catch (error) {
    console.error("CHECK JOIN ERROR:", error)
    await ctx.answerCbQuery(
      "❌ Gagal mengecek status.",
      { show_alert: true }
    )
  }
})

bot.action("deploy", async ctx => {
  try {
    await ctx.answerCbQuery()

    const joined = await isJoined(ctx)

    if (!joined) {
      return ctx.editMessageText(
        lockedText(),
        {
          parse_mode: "Markdown",
          ...lockedKeyboard()
        }
      )
    }

    await ctx.editMessageText(
      `🚀 *REYCLOUD DEPLOY*

📦 Kirim file ZIP atau HTML untuk memulai deployment.

Gunakan:

\`/deploy nama-project\`

Contoh:

\`/deploy reyshop\`

📦 Supported:
• ZIP
• HTML
• HTM

🧠 Framework akan dideteksi otomatis.
⚙️ Vercel preset akan disesuaikan dengan project.`,
      {
        parse_mode: "Markdown",
        ...mainKeyboard()
      }
    )
  } catch (error) {
    console.error("DEPLOY BUTTON ERROR:", error)
  }
})

bot.action("menu", async ctx => {
  try {
    await ctx.answerCbQuery()

    const joined = await isJoined(ctx)

    if (!joined) {
      return ctx.editMessageText(
        lockedText(),
        {
          parse_mode: "Markdown",
          ...lockedKeyboard()
        }
      )
    }

    await ctx.editMessageText(
      `📋 *${config.BOT_NAME} MENU*

🚀 Deploy
📦 ZIP / HTML
🧠 Auto Framework Detection
⚙️ Auto Vercel Preset
🌐 Custom Domain`,
      {
        parse_mode: "Markdown",
        ...mainKeyboard()
      }
    )
  } catch (error) {
    console.error("MENU BUTTON ERROR:", error)
  }
})

bot.action("profile", async ctx => {
  try {
    await ctx.answerCbQuery()

    const joined = await isJoined(ctx)

    if (!joined) {
      return ctx.editMessageText(
        lockedText(),
        {
          parse_mode: "Markdown",
          ...lockedKeyboard()
        }
      )
    }

    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : "Tidak tersedia"

    await ctx.editMessageText(
      `👤 *PROFILE*

🆔 ID : \`${ctx.from.id}\`
👤 Name : ${ctx.from.first_name || "-"}
🔗 Username : ${username}
🌐 Language : ${ctx.from.language_code || "-"}`,
      {
        parse_mode: "Markdown",
        ...mainKeyboard()
      }
    )
  } catch (error) {
    console.error("PROFILE BUTTON ERROR:", error)
  }
})

bot.action("about", async ctx => {
  try {
    await ctx.answerCbQuery()

    const joined = await isJoined(ctx)

    if (!joined) {
      return ctx.editMessageText(
        lockedText(),
        {
          parse_mode: "Markdown",
          ...lockedKeyboard()
        }
      )
    }

    await ctx.editMessageText(
      `ℹ️ *ABOUT*

🤖 Bot : ${config.BOT_NAME}
⚡ Version : ${config.BOT_VERSION}
🟢 Runtime : ${process.version}
📦 Framework : Telegraf

🚀 ReyCloud Deploy`,
      {
        parse_mode: "Markdown",
        ...mainKeyboard()
      }
    )
  } catch (error) {
    console.error("ABOUT BUTTON ERROR:", error)
  }
})

bot.catch((error, ctx) => {
  console.error(
    `BOT ERROR [${ctx.updateType}]`,
    error
  )
})

bot.launch()

console.log("================================")
console.log(`${config.BOT_NAME} Telegram Bot`)
console.log(`Version : ${config.BOT_VERSION}`)
console.log(`Runtime : ${process.version}`)
console.log("Status  : ONLINE")
console.log("================================")

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))
