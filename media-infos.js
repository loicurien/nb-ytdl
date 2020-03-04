const youtubedl = require('youtube-dl') ;
if (process.argv.length < 3) {
	console.error('No media url provided') ;
} else {
		const url = process.argv[2] ;
		let best_width = 0 ;
		let best_format_id  ;
		console.error('Reading infos : ' + url) ;
		console.time('infos') ;
		youtubedl.getInfo(url, (err, info) => {
				if (err) throw err
				console.timeEnd('infos') ;
				console.log('id:', info.id)
				console.log('title:', info.title)
				console.log('url:', info.url)
				console.log('thumbnail:', info.thumbnail)
				console.log('description:', info.description)
				console.log('filename:', info._filename)
				console.log('format id:', info.format_id)
				info.formats.map( (format) => {
						if( format.width > best_width && format.ext === 'mp4') {
								best_width = format.width ;
								best_format_id = format.format_id ;
						}
						console.log('format:'+format.format+' format_id:', format.format_id, format.width) ;
				}) ;
				console.log('BEST FORMAT:' + best_format_id) ;
		}) ;
}

