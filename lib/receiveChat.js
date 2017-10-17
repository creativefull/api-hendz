xmpp.on('chat', (from, message) => {
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
			let sukses = sup.sukses.toLowerCase()
			let nomor_tujuan = sup.no_tujuan.split("|")
			let splitKodeProduct = sup.kode_produk.split("|")

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

				console.log(data)
				let messageData = kodeProduct + '.' + nomor
				let querySukses = "Update in_jabber SET status=2 WHERE message LIKE '%" + messageData + "%' AND status=1"
				conn.query(querySukses, (err, jabber) => {
					if (jabber.affectedRows >= 1) {
						console.log("Update status to success in trx id", sup.trx_id)
					} else {
						console.log("Data Transaksi Not Found")
					}
				})

				// let queryInsert = "INSERT INTO out_jabber ('message', 'trx_id', 'dst_jabber','Src_jabber','id_supplier','status') VALUES('" + msgTmp + "', '" + sup.trx_id + "', '" + sup.dst_jabber + "', '" + sup.Src_jabber + "', '1')"
				// conn.query(queryInsert)
			}

		}
	})
})