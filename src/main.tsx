/** @jsx jsx */
/** @jsxFrag Fragment */
import { Hono } from 'hono'
import { jsx, Fragment } from 'hono/middleware'
import { html } from 'hono/helper'

const app = new Hono()

app.get('/', async c => {
  return c.html(html`<!DOCTYPE HTML>${
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>Ogratch</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="mx-10">
          <div class="text-2xl my-2">Ogratch</div>
          <div>使い方は、
            <a href="https://github.com/nakasyou/ogratch/" class="underline hover:no-underline">GitHub</a>
            を参照してください。
          </div>
        </div>
      </body>
    </html>
  }`)
})
app.get('/thumbnail/p/:thumbnailId', async c => {
  const projectId = c.req.param('thumbnailId')
  return await fetch(`https://uploads.scratch.mit.edu/get_image/project/${projectId}_480x360.png`)
})
app.get('/p/:projectId', async c => {
  const projectId = c.req.param('projectId')
  const link = `https://scratch.mit.edu/projects/${projectId}`
  
  const userAgent = (c.req.header('User-Agent') || '').toLowerCase()
  console.log(userAgent)
  if (!
    (
      userAgent.includes('twitter') ||
      userAgent.includes('discord') ||
      userAgent.includes('facebook') ||
      userAgent.includes('slackbot')
    )
  ){
    console.log('nonbot')
    return c.redirect(link, 302)
  }
  let data = await fetch(`https://scratchdb.lefty.one/v3/project/info/${projectId}`).then(res => res.json())

  if (data.error) {
    data = {
      title: 'unknown', description: 'unknown',

    }
  }
  return c.html(html`<!DOCTYPE HTML>${
    <html lang="ja">
      <head prefix="og: http://ogp.me/ns#">
        <meta charset="UTF-8" />
        <title>Ogratch</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="" />
        
        <meta property="og:site_name" content="Scratch" />
        <meta property="og:title" content={data.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={link} />
        <meta property="og:image" content={`https://ogratch.deno.dev/thumbnail/p/${projectId}`} />
        <meta property="og:description" content={data.description} />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body>
        <a href={link}>Push!</a>
      </body>
    </html>
  }`)
})

Deno.serve(app.fetch)
