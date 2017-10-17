let nextJabber = (db, id_supplier) => {
	db.query("SELECT prioritas FROM produk_supplier WHERE id_supplier=" + id_supplier, (err, results) => {
		if (err) {
			return process.send({
				status : 500,
				message : err.message
			})
		}
		console.log(results)
	})
}
exports.noresponse = (db) => {
	const moment = require('moment')
	moment.locale('id')

	db.query("SELECT id_supplier, start_at FROM in_jabber WHERE status = 1", (err, results) => {
		if (err) {
			return process.send({
				status : 500,
				message : err.message
			})
		}

		if (results) {
			results.forEach((result) => {
				let start_at = moment(result.start_at, 'YYYY-MM-DD HH:mm:ss').add(1, 'hour')
				let now = moment()
				if (start_at.diff(now) < 0) {
					nextJabber(db, result.id_supplier)
				}
			})
		}
	})
}