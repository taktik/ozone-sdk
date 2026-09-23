import { IUploadFile, UploadMediaError } from './models'
import { Queue } from './Queue'
import { Blob, FromOzone, ModeType, File as OzoneFile } from '@taktik/ozone-type'
import { getDefaultClient } from '../default'
import { SearchQuery } from '../search'

type OnStartUploadFunction = (params: { id: string; percent: number; file: File }) => void
type OnEndBlobUploadFunction = (params: { id: string }) => void
type OnEndImportBlobAsMediaFunction = (params: { oldId: string; newId?: string }) => void
type OnProgressEventFunction = (id: string) => (progressEvent: Event) => void
type OnErrorUploadMediaFunction = (params: { id: string; error: UploadMediaError }) => void
type OnEndOfUploadFunction = (params: { id: string }) => void
type CheckIfMediaExistsParam = {
	mode?: ModeType
	tenant: string
}

type ImportBlobAsMediaTaskResult = {
	mediaId: string
	asyncTasksGroupId?: string
}

type BlobRequest = {
	blob: Blob
	file: File
	id: string
}

export type ImportBlobParams = {
	$type: string
	mediaInputChannel: string
}
const defaultImportBlobParams: ImportBlobParams = {
	$type: 'importblobasmedia',
	mediaInputChannel: 'inputChannel',
}

type Item = { file?: string; id?: string } & object
export class OzoneApiUploadV3<T extends Item = Item> {
	private onStartUpload?: OnStartUploadFunction
	private onEndBlobUpload?: OnEndBlobUploadFunction
	private onEndImportBlobAsMedia?: OnEndImportBlobAsMediaFunction
	private onEndUpload?: OnEndOfUploadFunction
	private onProgress?: OnProgressEventFunction
	private onErrorUploadMedia?: OnErrorUploadMediaFunction
	private setMedia: (media: T) => void
	private collection: string
	private readonly createBlobMaxRetry: number
	private readonly importTaskMaxRetry: number
	private blobQueue = new Queue<void>(5)
	private importBlobParams: ImportBlobParams
	private importTaskQueue = new Queue<void>(10)
	private checkIfMediaExists?: CheckIfMediaExistsParam
	private metaData?: Partial<T>
	private timeoutUpload?: number
	constructor({
		onStartUpload,
		onEndBlobUpload,
		onProgress,
		createBlobMaxRetry = 5,
		onErrorUploadMedia,
		onEndUpload,
		importBlobParams = defaultImportBlobParams,
		importTaskMaxRetry = 10,
		onEndImportBlobAsMedia,
		setMedia,
		collection,
		checkIfMediaExists,
		metaData,
		timeoutUpload,
	}: {
		onStartUpload?: OnStartUploadFunction
		onEndBlobUpload?: OnEndBlobUploadFunction
		onProgress?: OnProgressEventFunction
		onEndImportBlobAsMedia?: OnEndImportBlobAsMediaFunction
		createBlobMaxRetry?: number
		onErrorUploadMedia?: OnErrorUploadMediaFunction
		importBlobParams?: ImportBlobParams
		importTaskMaxRetry?: number
		onEndUpload?: OnEndOfUploadFunction
		setMedia: (media: T) => void
		collection: string
		checkIfMediaExists?: CheckIfMediaExistsParam
		metaData?: Partial<T>
		timeoutUpload?: number
	}) {
		this.onStartUpload = onStartUpload
		this.onEndBlobUpload = onEndBlobUpload
		this.onProgress = onProgress
		this.onErrorUploadMedia = onErrorUploadMedia
		this.onEndImportBlobAsMedia = onEndImportBlobAsMedia
		this.onEndUpload = onEndUpload
		this.createBlobMaxRetry = createBlobMaxRetry
		this.importBlobParams = importBlobParams
		this.importTaskMaxRetry = importTaskMaxRetry
		this.setMedia = setMedia
		this.collection = collection
		this.checkIfMediaExists = checkIfMediaExists
		this.metaData = metaData
		this.timeoutUpload = timeoutUpload
	}

	/* Create blob files and put import task in stack "importingTasks"
	 * @param files
	 * @private
	 */
	private createBlobs(files: IUploadFile[]) {
		files.forEach(({ id, file }) => {
			this.onStartUpload?.({ id, percent: 0, file })
		})

		const createBlobTask = async (file: File, id: string, attempt = 1): Promise<void> => {
			try {
				const blob = await getDefaultClient()
					.blobClient()
					.create(file, {
						onprogress: this.onProgress?.(id),
						timeout: this.timeoutUpload,
					})
				this.onEndBlobUpload?.({ id: id })
				this.importTaskQueue.push([() => this.submitBlobTask({ blob, file, id })])
			} catch {
				if (attempt >= this.createBlobMaxRetry) {
					this.onErrorUploadMedia?.({
						id,
						error: UploadMediaError.UPLOAD,
					})
				} else {
					return createBlobTask(file, id, attempt + 1)
				}
			}
		}
		const blobRequests = files.map(
			({ file, id }) =>
				() =>
					createBlobTask(file, id),
		)
		this.blobQueue.push(blobRequests)
	}

	submitBlobTask(params: BlobRequest) {
		let fileId = params?.id
		if (!params) {
			return Promise.resolve()
		}
		const media = {
			...{
				name: params.file.name,
				type: 'media',
			},
			...(this.metaData ? this.metaData : {}),
		}

		// retry scope is the task submission/wait ONLY: a failure while waiting on the
		// thumbnails group must not re-submit the import task (the media already exists —
		// a resubmit would import the blob a second time and create a duplicate media)
		const submitAndWait = async (attempt = 1): Promise<ImportBlobAsMediaTaskResult | undefined> => {
			try {
				const taskId = await getDefaultClient()
					.taskClient()
					.submitTask(
						JSON.stringify({
							$type: this.importBlobParams.$type,
							blob: params.blob.id,
							media,
							mediaInputChannel: this.importBlobParams.mediaInputChannel,
						}),
					)
				return await getDefaultClient()
					.taskClient()
					.waitForTask<ImportBlobAsMediaTaskResult>(taskId, {
						skipWaitingOnSubTask: true,
					}).waitResult
			} catch (err) {
				console.log('Error submit upload task', err)
				if (attempt >= this.importTaskMaxRetry) {
					return undefined
				}
				return submitAndWait(attempt + 1)
			}
		}

		const generateTask = async (): Promise<void> => {
			const result = await submitAndWait()
			if (!result?.mediaId) {
				if (fileId) {
					this.onErrorUploadMedia?.({
						id: fileId,
						error: UploadMediaError.IMPORTING,
					})
				}
				return
			}
			this.onEndImportBlobAsMedia?.({
				oldId: fileId,
				newId: result.mediaId,
			})
			fileId = result.mediaId
			try {
				if (result.asyncTasksGroupId) {
					await this.waitForThumbnails(result.asyncTasksGroupId, result.mediaId)
				} else {
					// no async task group (nothing to transcode/thumbnail): the media is
					// already final — deliver it and close the upload, otherwise the
					// consumer never gets setMedia/onEndUpload for this file
					await this.deliverMedia(result.mediaId)
				}
			} catch (err) {
				console.log('Error waiting for media readiness', err)
				this.onErrorUploadMedia?.({
					id: fileId,
					error: UploadMediaError.IMPORTING,
				})
			}
		}
		return generateTask()
	}

	/** fetch the finished media, hand it to the consumer and signal the end of the upload */
	private deliverMedia = async (mediaId: string): Promise<void> => {
		const media = await getDefaultClient().itemClient<T>(this.collection).findOne(mediaId)
		if (media) {
			this.setMedia(media)
		}
		this.onEndUpload?.({ id: mediaId })
	}

	private waitForThumbnails = (tasksGroupId: string, mediaId: string) => {
		const func = (resolve: () => void, reject: () => void, attemptThumbnails = 1) => {
			const onSuccess = async () => {
				await this.deliverMedia(mediaId)
				resolve()
			}
			const onError = () => {
				if (attemptThumbnails >= this.importTaskMaxRetry) {
					reject()
				} else {
					return func(resolve, reject, attemptThumbnails + 1)
				}
			}
			this.waitUntilEndOfUpload(tasksGroupId, onSuccess, onError)
		}
		return new Promise<void>((resolve, reject) => {
			func(resolve, reject)
		})
	}

	/* Will wait until the end of upload
	 * generation of thumbnails ...
	 * @param task - the task id
	 * @param callBack - executed once the task is completed
	 */
	private waitUntilEndOfUpload(
		task: string,
		callBack?: ({ taskId }: { taskId?: string }) => void | Promise<void>,
		onError?: ({ taskId }: { taskId?: string }) => void | Promise<void>,
	) {
		const taskClient = getDefaultClient().taskClient()
		const taskHandle = taskClient.waitForTask(task)
		taskHandle.onFinish = callBack
		taskHandle.onError = onError
	}

	private async getIfMediaExists(file: File): Promise<T | undefined> {
		try {
			if (this.checkIfMediaExists) {
				const querySearchByName = new SearchQuery().and
					.termQuery('name', file.name)
					.tenantQuery(
						this.checkIfMediaExists.mode ?? 'OWN_AND_PARENTS',
						this.checkIfMediaExists.tenant,
					)
				const { results: medias = [] } = await getDefaultClient()
					.itemClient<T>(this.collection)
					.search(querySearchByName.searchRequest)
				if (!medias.length) {
					// not exists
					return undefined
				}
				const fileIds = medias.map((media) => media.file).filter(Boolean) as string[]
				const files = (
					await getDefaultClient().itemClient<OzoneFile>('file').findAllByIds(fileIds)
				).filter((ozoneFile) => !ozoneFile.deleted)
				if (!files.length) {
					return undefined
				}
				// the size check is async, so filter AFTER awaiting: filtering the pending
				// promises keeps every entry (all truthy) and a null first slot would make
				// the find below match a media with no file at all
				const candidates = await Promise.all(
					files.map(async (ozoneFile) => {
						if (ozoneFile.blob) {
							const blob = await getDefaultClient().blobClient().getById(ozoneFile.blob)
							if (blob?.size === file.size) {
								return ozoneFile
							}
						}
						return null
					}),
				)
				const existingFiles = candidates.filter(
					(ozoneFile): ozoneFile is FromOzone<OzoneFile> => !!ozoneFile,
				)
				if (!existingFiles.length) {
					return undefined
				}
				const matchedFile = existingFiles[0]
				return medias.find((media) => media.file === matchedFile.id)
			}
			return undefined
		} catch (err) {
			console.error('Error getting media if exists', err)
			return undefined
		}
	}
	/* Upload several medias
	 * Firstly start create blobs
	 * @param files
	 */
	uploadFiles(files: IUploadFile[]) {
		Promise.all(
			files.map(async (file) => {
				const mediaAlreadyExists = await this.getIfMediaExists(file.file)
				if (mediaAlreadyExists) {
					this.onEndImportBlobAsMedia?.({
						oldId: file.id,
						newId: mediaAlreadyExists.id,
					})
					// same event order as the fresh-upload path: the media is delivered
					// BEFORE the upload is declared over
					this.setMedia(mediaAlreadyExists)
					this.onEndUpload?.({ id: mediaAlreadyExists.id! })
					return null // not create blob
				}
				return file
			}),
		)
			.then((files) => {
				this.createBlobs(files.filter((file) => file) as IUploadFile[])
			})
			.catch((err) => {
				console.error('Error uploading medias', err)
			})
	}
}
