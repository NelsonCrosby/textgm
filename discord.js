'use strict'

const log = require('debug')('textgm:discord')
const Discord = require('discord.js')

const client = new Discord.Client()

client.on('ready', () => {
  log('Ready!')
})

client.on('message', (msg) => {
  log(msg)
})

client.login(process.env.TGM_TOKEN)
