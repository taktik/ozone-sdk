import { expect } from 'chai'
import { OzoneMediaUrl, OzonePreviewSize } from '../../src/urls/mediaUrl'
import { FlowrVideoEnum } from '../../src/urls/formats'

describe('tool OzoneMediaUrl', function () {
	const config = '/ozone'

	describe('constructor', function () {
		it('should set config and id', () => {
			const element = new OzoneMediaUrl('an_id', 'host')
			expect(element.id).to.equal('an_id')
			expect((element as any).ozoneHost).to.deep.equal('host')
		})
	})
	describe('getNumericId', function () {
		it('should convert id: "00000000-046c-7fc4-0000-000000006030" to 24624', () => {
			const element = new OzoneMediaUrl('00000000-046c-7fc4-0000-000000006030', 'host')
			expect(element.getNumericId()).to.equal(24624)
		})
	})
	describe('getPreviewUrlJpg', function () {
		it('should convert id: "00000000-046c-7fc4-0000-000000006030" to 24624', () => {
			const element = new OzoneMediaUrl('00000000-046c-7fc4-0000-000000006030', config)
			expect(element.getPreviewUrlJpg(1500)).to.equal(
				'/ozone/view/24624/org.taktik.filetype.image.preview.1500',
			)
		})

		it('should work with enum', () => {
			const element = new OzoneMediaUrl('00000000-046c-7fc4-0000-000000006030', config)
			expect(element.getPreviewUrlJpg(OzonePreviewSize.Small)).to.equal(
				'/ozone/view/24624/org.taktik.filetype.image.preview.250',
			)
		})
	})
	describe('getPreviewUrlPng', function () {
		it('should convert id: "00000000-046c-7fc4-0000-000000006030" to 24624', () => {
			const element = new OzoneMediaUrl('00000000-046c-7fc4-0000-000000006030', config)
			expect(element.getPreviewUrlPng(1500)).to.equal('/ozone/view/24624/preview.png.1500')
		})

		it('should work with enum', () => {
			const element = new OzoneMediaUrl('00000000-046c-7fc4-0000-000000006030', config)
			expect(element.getPreviewUrlPng(OzonePreviewSize.Small)).to.equal(
				'/ozone/view/24624/preview.png.250',
			)
		})
	})

	describe('getVideoUrl', function () {
		it('should return video url', function () {
			const element = new OzoneMediaUrl('00000000-046c-7fc4-0000-000000006028', config)
			expect(element.getVideoUrl(FlowrVideoEnum.flowr)).to.equal(
				'/ozone/view/24616/org.taktik.filetype.flowr.video/index.m3u8',
			)
		})
	})
	describe('getVideoUrlMp4', function () {
		it('should return video url', function () {
			const element = new OzoneMediaUrl('00000000-046c-7fc4-0000-000000006028', config)
			expect(element.getVideoUrlMp4()).to.equal('/ozone/view/24616/org.taktik.filetype.video.mp4')
		})
	})
})
