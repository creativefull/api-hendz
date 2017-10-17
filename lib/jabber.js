const xmpp = require('simple-xmpp')
const jabber = require('./jabber.json')

exports.config = jabber

exports.send = (to, msg) => {
    console.log(msg)
    xmpp.send(to, msg)
}

exports.connect = () => {
    xmpp.connect({
		jid					: jabber.jid,
		password		    : jabber.password,
		host				: jabber.host,
		port				: jabber.port
    });
}

exports.subscribe = (jid) => {
    xmpp.subscribe(jid);
}
// check for incoming subscription requests
xmpp.getRoster();

xmpp.on('error', (err) => {
	console.error(err);
});

xmpp.on('subscribe', (from) => {
    console.log("ini event subscribe", from)
    xmpp.acceptSubscription(from);
});

// CHECK IF XMPP ONLINE
xmpp.on('online', (data) => {
    console.log("Connected with jid : ", data.jid.user)
    console.log("Yes i\'m connected")
})