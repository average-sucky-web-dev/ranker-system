const express = require('express')
require('dotenv').config({'path': __dirname + '/Secrets.env'})
const axios = require('axios')
const app = express()
const cookie = process.env.cookie
app.use(express.json())
app.get('/groupdata', async (req, res) => {
    const table = {}
    const response = await axios.get('https://groups.roblox.com/v1/groups/12102956/roles')
    for (const value of list) {
        if (value.name === "Guest") continue
        table[value.name] = value.id
    }
    return res.send(table)
})
app.post('/rank', async (req, res) => {
    const data = req.data
    if (!data || data.secret !== process.env.SECRET) return res.sendStatus(403)
    const response = await axios.patch('https://groups.roblox.com/v1/groups/12102956/users/' + req.data.ranked,
        {
            'roleId': req.data.role
        },
        {
          headers: {
            'Cookie': ".ROBLOSECURITY=" + cookie
          }
        }
    )
    if (response.status !== 403) res.sendStatus(500)
    const response2 = await axios.patch('https://groups.roblox.com/v1/groups/12102956/users/' + req.data.ranked,
        {
            'roleId': req.data.role
        },
        {
          headers: {
            'Cookie': ".ROBLOSECURITY=" + cookie,
            'x-csrf-token': response.headers['x-csrf-token']
          }
        }
    )
    if (response.status !== 200) res.sendStatus(500)
    res.sendStatus(200)
    await axios.post(process.env.WEBHOOKURL, {
        content: `User **${data.ranker}** ranked **${data.rankedname}** from **${data.oldrank}** to **${data.newrank}**`
    })
})