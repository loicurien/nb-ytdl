const youtubedl = require('youtube-dl')
const fs = require('fs')
let best_width = 0 ;
let best_format_id  ;

if (process.argv.length < 3) {
		console.error('No media url provided') ;
} else {
		const url = process.argv[2] ;
		console.error('Reading infos : ' + url) ;
		console.time('infos') ;
		youtubedl.getInfo(url, (err, info) => {
				if (err) throw err
				console.timeEnd('infos') ;
				console.log('id:', info.id) ;
				console.log('title:', info.title) ;
				console.log('url:', info.url) ;
				console.log('thumbnail:', info.thumbnail) ;
				console.log('description:', info.description) ;
				console.log('filename:', info._filename) ;
				console.log('format id:', info.format_id) ;
				info.formats.map( (format) => {
						if( format.width > best_width && format.ext === 'mp4') {
								best_width = format.width ;
								best_format_id = format.format_id ;
						}
						console.log('format:'+format.format+' format_id:', format.format_id, format.width) ;
				}) ;
				console.log('BEST FORMAT:' + best_format_id) ;
				let downloaded = 0 ;

				if (fs.existsSync(info._filename)) {
						downloaded = fs.statSync(info._filename).size
				}

				const video = youtubedl(url,
						// Optional arguments passed to youtube-dl.
						['--format=best'],
						// start will be sent as a range header
						{ start: downloaded, cwd: __dirname })

				// Will be called when the download starts.
				video.on('info', function(info) {
						console.log('Download started')
						console.log('filename: ' + info._filename)

						// info.size will be the amount to download, add
						let total = info.size + downloaded
						console.log('size: ' + total)

						if (downloaded > 0) {
								// size will be the amount already downloaded
								console.log('resuming from: ' + downloaded)

								// display the remaining bytes to download
								console.log('remaining bytes: ' + info.size)
						}
				})

				video.pipe(fs.createWriteStream(info._filename, { flags: 'a' }))

				// Will be called if download was already completed and there is nothing more to download.
				video.on('complete', function complete(info) {
						'use strict'
						console.log('filename: ' + info._filename + ' already downloaded.')
				})

				video.on('end', function() {
						console.log('finished downloading!')
				})
		}) ;
}