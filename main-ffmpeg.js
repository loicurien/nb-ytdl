const youtubedl = require('youtube-dl')
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
let best_width = 0 ;
let max_width = 1000000 ;
let best_format_id  ;
let output = "output.mp4" ;

if (process.argv.length < 3) {
		console.error('No media url provided') ;
} else {
		const url = process.argv[2] ;
		if (process.argv[4]) {
				max_width = process.argv[4] ;
		}
		console.error('Reading infos : ' + url) ;
		console.time('infos') ;
		youtubedl.getInfo(url, (err, info) => {
				if (err) throw err
				console.timeEnd('infos') ;
				console.log('infos:', info) ;
				console.log('id:', info.id) ;
				console.log('title:', info.title) ;
				console.log('url:', info.url) ;
				console.log('thumbnail:', info.thumbnail) ;
				console.log('description:', info.description) ;
				console.log('filename:', info._filename) ;
				console.log('format id:', info.format_id) ;
				info.formats.map( (format) => {
						if( format.width > best_width && format.width <= max_width && format.ext === 'mp4') {
								best_width = format.width ;
								best_format_id = format.format_id ;
						}
						console.log('format:'+format.format+' format_id:', format.format_id, ' width : ' + format.width + ' container: ' + format.container + ' acodec: ' + format.acodec) ;
				}) ;
				console.log('BEST FORMAT:' + best_format_id) ;

				let downloaded_video = 0 ;
				let downloaded_audio = 0 ;
				if (process.argv[3]) {
						output = process.argv[3] ;
				} else {
						output = info._filename ;
				}
				const audio_output = 'audio_' + output + '.m4a';
				const video_output = 'video_' + output + '.mp4';
				if (fs.existsSync(video_output)) {
						downloaded_video = fs.statSync(video_output).size
				}
				const video = youtubedl(url,
						// Optional arguments passed to youtube-dl.
						['--format=' + best_format_id],
						// start will be sent as a range header
						{ start: downloaded_video, cwd: __dirname })

				// Will be called when the download starts.
				video.on('info', function(info) {
						console.log('Download started')
						console.log('filename: ' + info._filename + ' to:' + video_output)

						// info.size will be the amount to download, add
						let total = info.size + downloaded_video
						console.log('size: ' + total)

						if (downloaded_video > 0) {
								// size will be the amount already downloaded
								console.log('resuming from: ' + downloaded_video)

								// display the remaining bytes to download
								console.log('remaining bytes: ' + info.size)
						}
				})

				video.pipe(fs.createWriteStream(video_output, { flags: 'a' }))

				// Will be called if download was already completed and there is nothing more to download.
				video.on('complete', function complete(info) {
						'use strict'
						console.log('filename: ' + info._filename + ' already downloaded.')
				})

				video.on('end', function() {
						console.log('finished downloading!')
						if (fs.existsSync(audio_output)) {
								downloaded_audio = fs.statSync(audio_output).size
						}
						const audio = youtubedl(url,
								// Optional arguments passed to youtube-dl.
								['--format=140'],
								// start will be sent as a range header
								{ start: downloaded_audio, cwd: __dirname })

						// Will be called when the download starts.
						audio.on('info', function(info) {
								console.log('Download  audio started')
								console.log('filename: ' + info._filename + ' to:' + audio_output)

								// info.size will be the amount to download, add
								let total = info.size + downloaded_audio
								console.log('size: ' + total)

								if (downloaded_audio > 0) {
										// size will be the amount already downloaded
										console.log('resuming from: ' + downloaded_audio)

										// display the remaining bytes to download
										console.log('remaining bytes: ' + info.size)
								}
						})

						audio.pipe(fs.createWriteStream(audio_output, { flags: 'a' }))

						// Will be called if download was already completed and there is nothing more to download.
						audio.on('complete', function complete(info) {
								console.log('filename: ' + info._filename + ' already downloaded.') ;
						})

						audio.on('end', function() {
								console.log('finished downloading!') ;
								console.log('Start ffmpeg merging')
								ffmpeg()
										.input(video_output)
										.input(audio_output)
										.save(output+'.mp4')
										.on('error', console.error)
										.on('end', () => {
												console.log('Merge complete : ' +output+'.mp4');
												fs.unlink(audio_output, err => {
														if (err) console.error(err);
														else {
																fs.unlink(video_output, err => {
																		if (err) console.error(err);
																		else {
																				console.log('Merge complete : ' + output + '.mp4');

																		}
																});
														}
												});
										});
						})
				})
		}) ;
}
