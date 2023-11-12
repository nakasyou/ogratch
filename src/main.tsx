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
app.get('/p/:projectId', async c => {
  const projectId = c.req.param('projectId')
  return c.html(html`<!DOCTYPE HTML>${
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>Ogratch</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="" /><


      </head>
      <body>
        <a href={`https://scratch.mit.edu/projects/${projectId}`}>Push!</a>
      </body>
    </html>
  }`)
})
