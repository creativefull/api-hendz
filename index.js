const {CronJob} = require('cron')
const {fork, isMaster} = require('cluster')
const jabber = require('./lib/jabber')
const config = require('./config.json')
const {createConnection} = require('mysql')
const numCPUs = require('os').cpus().length
const xmpp = require('simple-xmpp')

// CONNECT DATABASE
let conn = createConnection(config.database)
conn.connect()
global.conn = conn
global.xmpp = xmpp

// CONNECT JABBER
jabber.connect()

const {startPool} = require('./lib/pool')

new CronJob('* * * * * *', () => {
	startPool(conn)
}, (err) => {
	console.error(err)
}, true, 'Asia/Jakarta')

// RECEIVE CHAT
require('./lib/receiveChat')

// RUN CLUSTER PROCESS
console.log("Application running")
