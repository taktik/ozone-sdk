/*
	Ozone file type identifiers, and the order in which to prefer them.

	These came from ozone-config, which this package used to depend on for
	nothing else -- the rest of that package fetches configuration over HTTP and
	was never touched from here. They are constants, so they travel with the
	code that reads them.
*/


export const OzoneFormat: OzoneFormatType = {
	'type': {
		'hls': 'org.taktik.filetype.video.hls',
		'mp3': 'org.taktik.filetype.audio.mp3',
		'original': 'org.taktik.filetype.original',
		'flowr': 'org.taktik.filetype.flowr.video',
		'mp4': 'org.taktik.filetype.video.mp4',
		'jpg': 'org.taktik.filetype.image.preview.{SIZE}',
		'png': 'preview.png.{SIZE}'
	},
	'priority': {
		'video': ['hls', 'flowr', 'original', 'mp4'],
		'audio': ['hls', 'flowr', 'mp4', 'mp3', 'original']
	}
}

export enum FlowrVideoEnum {
	'hls'= 'org.taktik.filetype.video.hls',
	'mp3' = 'org.taktik.filetype.audio.mp3',
	'original' = 'org.taktik.filetype.original',
	'flowr' = 'org.taktik.filetype.flowr.video',
	'mp4' = 'org.taktik.filetype.video.mp4'
}
export enum FlowrImageEnum {
	'jpg' = 'org.taktik.filetype.image.preview.{SIZE}',
	'png' = 'preview.png.{SIZE}'
}

export type OzoneFormatType = {
	type: {
		hls: string,
		mp3: string,
		original: string,
		flowr: string,
		mp4: string,
		jpg: string,
		png: string,
		[key: string]: string
	},
	priority: {
		video: Array<string>,
		audio: Array<string>
	}
}
