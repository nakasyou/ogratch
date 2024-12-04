import { Hono } from 'hono'
import { html } from 'hono/html'

const app = new Hono({ strict: false })

app.get('/', (c) =>
  c.html(
    html`<!DOCTYPE HTML>${(
      <html lang='ja'>
        <head>
          <meta charset='UTF-8' />
          <title>Ogratch</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta name='description' content='' />
          <script src='https://cdn.tailwindcss.com'></script>
        </head>
        <body>
          <div class='mx-10'>
            <div class='text-2xl my-2'>Ogratch</div>
            <div>
              使い方は、
              <a
                href='https://github.com/nakasyou/ogratch/'
                class='underline hover:no-underline'
              >
                GitHub
              </a>
              を参照してください。
            </div>
          </div>
        </body>
      </html>
    )}`,
  )
)

app.get('/thumbnail/p/:thumbnailId', async (c) => {
  const projectId = c.req.param('thumbnailId')
  return await fetch(
    `https://uploads.scratch.mit.edu/get_image/project/${projectId}_480x360.png`,
  )
})

app.get('/echo-json/:json', (c) => c.json(JSON.parse(c.req.param('json'))))

// ----- Scratch compatible routes -----
const scratchRoute = new Hono<{
  Variables: {
    link: string
  }
}>()

scratchRoute.use('*', async (c, next) => {
  c.set('link', `https://scratch.mit.edu${c.req.path}`)

  const userAgent = (c.req.header('User-Agent') || '').toLowerCase()
  console.log(userAgent)

  const isNotBot = !(
    userAgent.includes('twitter') ||
    userAgent.includes('discord') ||
    userAgent.includes('facebook') ||
    userAgent.includes('slackbot')
  )

  if (isNotBot) {
    console.log('nonbot')
    return c.redirect(c.var.link, 302)
  }
  await next()
})

scratchRoute.get('/projects/:projectId', async (c) => {
  const projectId = c.req.param('projectId')

  let data = await fetch(
    `https://trampoline.turbowarp.org/api/projects/${projectId}`,
  ).then((res) => res.json())

  if (data.error) {
    data = {
      title: 'unknown',
      description: 'unknown',
    }
  }
  const desc = data.description
  const embed = {
    author_name:
      `👁️${data.stats.views} ❤️${data.stats.loves} ⭐${data.stats.favorites} 🌀${data.stats.remixes} | ${data.author.username}`,
    author_url: `https://scratch.mit.edu/users/${data.author.username}`,
    author_icon: data.author.profile.images['90x90'],
    provider_name: 'ogratch',
    provider_url: 'https://github.com/nakasyou/ogratch',
    title: 'Scratch',
    type: 'link',
    version: '1.0',
  }
  return c.html(
    html`<!DOCTYPE HTML>${(
      <html>
        <head prefix='og: http://ogp.me/ns#'>
          <meta charset='UTF-8' />
          <title>Ogratch</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta name='description' content='' />

          <meta property='og:site_name' content='Scratch' />
          <meta property='og:title' content={data.title} />
          <meta property='og:type' content='article' />
          <meta property='og:url' content={c.var.link} />
          <meta
            property='og:image'
            content={`https://ogratch.deno.dev/thumbnail/p/${projectId}`}
          />
          <meta property='og:description' content={desc} />
          <meta name='twitter:card' content='summary_large_image' />
          <link
            rel='alternate'
            href={`https://ogratch.deno.dev/echo-json/${
              encodeURIComponent(
                JSON.stringify(embed),
              )
            }`}
            type='application/json+oembed'
            title='Scratch'
          />
        </head>
        <body>
          <a href={c.var.link}>Push!</a>
        </body>
      </html>
    )}`,
  )
})

scratchRoute.get('/users/:username', async (c) => {
  const username = c.req.param('username')
  const res = await fetch(
    `https://trampoline.turbowarp.org/proxy/users/${username}`,
  )
  if (!res.ok) {
    return c.notFound()
  }
  const data = await res.json()

  const embed = {
    author_name: data.username,
    author_url: c.var.link,
    author_icon: data.profile.images['90x90'],
    provider_name: 'ogratch',
    provider_url: 'https://github.com/nakasyou/ogratch',
    title: 'Scratch',
    type: 'link',
    version: '1.0',
  }
  return c.html(
    html`<!DOCTYPE HTML>${(
      <html>
        <head prefix='og: http://ogp.me/ns#'>
          <meta charset='UTF-8' />
          <title>Ogratch</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta name='description' content='' />

          <meta property='og:site_name' content='Scratch' />
          <meta property='og:title' content={data.username} />
          <meta property='og:type' content='article' />
          <meta property='og:url' content={c.var.link} />
          <meta property='og:description' content={data.profile.bio} />
          <meta name='twitter:card' content='summary' />
          <link
            rel='alternate'
            href={`https://ogratch.deno.dev/echo-json/${
              encodeURIComponent(
                JSON.stringify(embed),
              )
            }`}
            type='application/json+oembed'
            title='Scratch'
          />
        </head>
        <body>
          <a href={c.var.link}>Push!</a>
        </body>
      </html>
    )}`,
  )
})

app.route('/', scratchRoute)

Deno.serve(app.fetch)
