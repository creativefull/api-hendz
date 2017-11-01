const {noresponse} = require('./hang')

exports.startPool = (conn) => {
	if (!conn) return console.log("Database not connected")
	let inJabber = []
	let idInJabber = ''

	conn.query('SELECT * FROM in_jabber WHERE status = 0', (err, results) => {
		if (err) {
			socket.emit('log', {date : new Date(), message : 'Terjadi Kesalahan Pada Server: ' + JSON.stringify(err)})			
		}
		if (results) {
			results.forEach((result) => {
				idInJabber += '\'' + result.id + '\','
				inJabber.push(result)

				if (result.dst_jabber) {
					result.dst_jabber.split("|").forEach((dst_jabber) => {
						// SEND TO JABBER
						console.log(dst_jabber)
						xmpp.send(dst_jabber, result.message)
					})
				}
			})

			// UPDATE STATUS TO 1
			if (inJabber.length > 0) {
				// console.log("ADA PESAN MASUK")
				let concatIdJabber = idInJabber.substr(0, idInJabber.length - 1)
				// console.log(concatIdJabber)
				conn.query('UPDATE in_jabber SET status = 1, start_at = NOW() WHERE id IN (' + concatIdJabber + ')', (err, results) => {
					if (err) return console.error(err)
					console.log("Update status")
				})
			}
		}
	})

	noresponse(conn)
}