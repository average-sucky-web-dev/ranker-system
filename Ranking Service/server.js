const express = require('express')
require('dotenv').config({'path': __dirname + '/Secrets.env'})
const axios = require('axios')
axios.defaults.validateStatus = function() {
    return true
}
const app = express()
const cookie = process.env.COOKIE
app.use(express.json())
app.get('/groupdata', async (req, res) => {
    const table = {}
    const response = await axios.get('https://groups.roblox.com/v1/groups/12102956/roles')
    for (const value of response.data.roles) {
        if (value.name === "Guest") continue
        table[value.name] = value.id
    }
    return res.send(table)
})
app.post('/rank', async (req, res) => {
    const data = req.body
    if (!data || data.secret !== process.env.SECRET) return res.sendStatus(403)
    const response = await axios.patch('https://groups.roblox.com/v1/groups/12102956/users/' + data.ranked,
        {
            'roleId': data.role
        },
        {
          headers: {
            'Cookie': ".ROBLOSECURITY=" + cookie
          }
        }
    )
    if (response.status !== 403) {
        console.log(response.status)
        return res.sendStatus(500)
    }
    const response2 = await axios.patch('https://groups.roblox.com/v1/groups/12102956/users/' + data.ranked,
        {
            'roleId': data.role
        },
        {
          headers: {
            'Cookie': ".ROBLOSECURITY=" + cookie,
            'x-csrf-token': response.headers['x-csrf-token']
          }
        }
    )
    if (response2.status !== 200) {
        console.log('failed at second')
        console.log(response2.status)
        console.log(response2.data)
        return res.sendStatus(500)
    }
    res.sendStatus(200)
    await axios.post(process.env.WEBHOOKURL, {
        content: `User **${data.ranker}** ranked **${data.rankedname}** from **${data.oldrank}** to **${data.newrank}**`
    })
})
app.listen(3000, () => {
    console.log('systems running')
})
