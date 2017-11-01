const {CronJob} = require('cron')
const {fork, isMaster} = require('cluster')
const jabber = require('./lib/jabber')
const config = require('./config.json')
const {createConnection} = require('mysql')
const numCPUs = require('os').cpus().length
const xmpp = require('simple-xmpp')
const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// CONNECT DATABASE
let conn = createConnection(config.database)
conn.connect()
global.conn = conn
global.xmpp = xmpp
global.io = io

// CONNECT JABBER
jabber.connect()

// CONNECT SOCKET
io.on('connection', (socket) => {
	global.socket = socket
	console.log("User connected")
})

const {startPool} = require('./lib/pool')

new CronJob('* * * * * *', () => {
	startPool(conn)
}, (err) => {
	console.error(err)
}, true, 'Asia/Jakarta')

// RECEIVE CHAT
require('./lib/receiveChat')

// RUN CLUSTER PROCESS
http.listen(8089, () => console.log("Application running on port", 8089))