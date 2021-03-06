const {CronJob} = require('cron')
const {fork, isMaster} = require('cluster')
const jabber = require('./lib/jabber')
const config = require('./config.json')
const {createConnection} = require('mysql')
const numCPUs = require('os').cpus().length
const xmpp = require('simple-xmpp')
const express = require('express')
const app = express()
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
	socket.emit('connected', 'connected')
	
	// ON SEND MESSAGE
	socket.on('send_message', (data) => {
		xmpp.send(data.id_jabber, data.message)		
	})
})

const {startPool} = require('./lib/pool')

new CronJob('* * * * * *', () => {
	startPool(conn)
}, (err) => {
	console.error(err)
}, true, 'Asia/Jakarta')

// RECEIVE CHAT
require('./lib/receiveChat')

// EXPRESS STATIC
app.use(express.static('front-dev'))
// ROUTE HTTP
app.get('/', async (req,res) => {
	res.sendFile(__dirname + '/front-dev/index.html')
})
// RUN CLUSTER PROCESS
http.listen(8089, () => console.log("Application running on port", 8089))