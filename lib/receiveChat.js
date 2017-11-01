xmpp.on('chat', (from, message) => {
	// SEND LOG REALTIME
	try {
		socket.emit('log', {date : new Date(), message : 'Pesan Masuk ' + message + ' Dari ' + from})
	} catch(e) {
		console.error("No user connected")
	}

	let dReply = {
		msg : message,
		from : from,
		created_at : new Date()
	}

	let query = "SELECT inj.*, suppar.* FROM in_jabber AS inj INNER JOIN supplier_parsing as suppar ON inj.id_supplier=suppar.id_supplier WHERE inj.dst_jabber LIKE '%" + from + "%' LIMIT 0,1"

	conn.query(query, (err, sups) => {
		if (sups.length > 0) {
			let sup = sups[0]

			let msgTmp = message
			// SUKSES
			let sukses = sup.sukses.toLowerCase()
			let nomor_tujuan = sup.no_tujuan.split("|")
			let splitKodeProduct = sup.kode_produk.split("|")

			// GAGAL
			let gagal = sup.gagal.toString().split(', ')

			if (message.toLowerCase().indexOf(sukses) >= 0) {
				console.log("=== TRX SUKSES ===")
				let nomor = message.substr(0, message.indexOf(nomor_tujuan[1]))
					nomor = nomor.split(nomor_tujuan[0]).pop();
				let kodeProduct = message.split(splitKodeProduct[0]).pop().split(splitKodeProduct[1]).shift()
				data = {
					nomor : nomor,
					kodeProduct : kodeProduct,
					status : 'sukses',
					message : 'Transaksi Sukses'
				}

				try {
					socket.emit('log', {date : new Date(), message : 'Transaksi Sukses ' + nomor + ' Kode Product ' + kodeProduct})
				} catch(e) {

				}

				let messageData = kodeProduct + '.' + nomor
				let querySukses = "Update in_jabber SET status=2, Src_jabber='" + dReply.from + "' WHERE message LIKE '%" + messageData + "%' AND status=1"
				conn.query(querySukses, (err, jabber) => {
					if (jabber.affectedRows >= 1) {
						console.log("Update status to success in trx id", sup.trx_id)
					} else {
						console.log("Data Transaksi Not Found")
					}
				})

				// INSERT TO OUTJABBER
				let queryInsert = "INSERT INTO out_jabber (message, trx_id, dst_jabber,Src_jabber,id_supplier,status) VALUES('" + msgTmp + "', '" + sup.trx_id + "', '" + sup.dst_jabber + "', '" + dReply.from + "', '" + sup.id_supplier + "', '2')"
				conn.query(queryInsert)
			}


			// CONDITION WHEN FAILED RESPONSE
			let statusGagal = false
			gagal.forEach((g) => {
				if (message.toLowerCase().indexOf(g.toLowerCase()) >= 0) {
					statusGagal = true
				}
			})

			if (statusGagal) {
				console.log("=== TRX GAGAL ===")
				let nomor = message.substr(0, message.indexOf(nomor_tujuan[1]))
					nomor = nomor.split(nomor_tujuan[0]).pop();
				let kodeProduct = message.split(splitKodeProduct[0]).pop().split(splitKodeProduct[1]).shift()
				data = {
					nomor : nomor,
					kodeProduct : kodeProduct,
					status : 'gagal',
					message : 'Transaksi Gagal'
				}

				try {
					socket.emit('log', {date : new Date(), message : 'Transaksi Gagal ' + nomor + ' Kode Product ' + kodeProduct})
				} catch(e) {

				}

				let messageData = kodeProduct + '.' + nomor
				let queryGagal = "Update in_jabber SET status=3, Src_jabber='" + dReply.from + "' WHERE dst_jabber LIKE '%" + dReply.from + "%' AND status=1"
				conn.query(queryGagal, (err, jabber) => {
					if (jabber.affectedRows >= 1) {
						console.log("Update status to gagal in trx id", sup.trx_id)
					} else {
						console.log("Data Transaksi Not Found")
					}
				})

				// INSERT TO OUTJABBER
				let queryInsert = "INSERT INTO out_jabber (message, trx_id, dst_jabber,Src_jabber,id_supplier,status) VALUES('" + msgTmp + "', '" + sup.trx_id + "', '" + sup.dst_jabber + "', '" + dReply.from + "', '" + sup.id_supplier + "', '1')"
				conn.query(queryInsert)
			}
		}
	})
})