import { UUID, TaskExecution, GroupExecution } from '@taktik/ozone-type'
import { TaskClient, TaskHandler, TaskHandlerOption } from './taskClient'
import { OzoneClient } from '../ozoneClient/ozoneClient'
import { Request } from 'typescript-http-client'

export class TaskClientImpl implements TaskClient {
	constructor(private client: OzoneClient, private baseUrl: string) {}

	waitForTask<T>(taskId: UUID, options?: TaskHandlerOption): TaskHandlerImpl {
		return new TaskHandlerImpl<T>(taskId, this.client, this.baseUrl, options || {})
	}

	submitTask(body: string): Promise<UUID> {
		const url = `${this.baseUrl}/rest/v3/task`
		const request = new Request(url)
			.setMethod('POST').setBody(body)
		return this.client.call<UUID>(request)
	}
}
const waitingTime = 10000 // ms

export class TaskHandlerImpl<T = any> implements TaskHandler {

	onFinish?: (taskExecution: TaskExecution) => void

	onError?: (taskExecution: TaskExecution) => void

	onProgress?: (taskExecution: TaskExecution) => void

	private pollInterval: number

	private timeout?: number

	private subTimeout?: number

	private rejectPromise?: (reason?: any) => void

	stopWaiting(): void {
		this._clearPullTimeout()
		const stopWaitingErrorMessage = { error: 'Wait for task canceled' }
		this.executeCallback(this.onError, stopWaitingErrorMessage)
		this.executeCallback(this.rejectPromise, stopWaitingErrorMessage)
	}

	_clearPullTimeout(): void {
		clearTimeout(this.timeout)
		clearTimeout(this.subTimeout)
	}

	private executeCallback(callback: ((taskExecution: TaskExecution) => void) | undefined, param: TaskExecution) {
		if (callback) {
			setTimeout(() => callback(param))
		}
	}
	readonly waitResult: Promise<T | undefined>

	constructor(taskId: string, private client: OzoneClient, private baseUrl: string, private options: TaskHandlerOption) {
		this.pollInterval = options.pollInterval || 500
		this.waitResult = this._waitForTask(taskId)
	}

	private _waitForSubTasks(asyncTasksGroupId: string): Promise<void> {
		return (new Promise((resolve, reject) => {
			const wait = () => {
				this.subTimeout = window.setTimeout(() => {
					this._awaitTask(asyncTasksGroupId)
						.then((data: GroupExecution) => {
							if (data.stepsCount !== data.stepsDone) {
								wait()
							} else if (data.hasErrors) {
								reject('One of the processing sub tasks as an error')
							} else if (data.stepsDone === data.stepsCount) {
								this._clearPullTimeout()
								resolve()
							}
						})
						.catch((error) => {
							this._clearPullTimeout()
							reject(error)
						})
				}, this.pollInterval)
			}
			wait()
		}))
	}
	private _waitForTask<T>(taskId: string): Promise<T | undefined> {
		let primaryTaskResult: TaskExecution
		return (new Promise<TaskExecution>((resolve, reject) => {
			this.rejectPromise = reject
			const wait = () => {
				this.timeout = window.setTimeout(() => {
					this._awaitTask(taskId)
						.then((data: GroupExecution) => {
							if (data && data.taskExecutions) {
								const taskExecution: TaskExecution = data.taskExecutions[taskId]
								this.executeCallback(this.onProgress, taskExecution)
								if (data.hasErrors) {
									this.executeCallback(this.onError, taskExecution)
									clearTimeout(this.timeout)
									reject(Error(taskExecution.error || 'Error in ozone task'))

								} else if (data.stepsDone === data.stepsCount) {
									this._clearPullTimeout()
									primaryTaskResult = taskExecution
									resolve(taskExecution)
								} else {
									wait()
								}
							}
						})
						.catch((error) => {
							clearTimeout(this.timeout)
							reject(error)
						})
				}, this.pollInterval)
			}
			wait()
		}))
			.then((taskResult: TaskExecution): Promise<void> | undefined => {
				if (!this.options.skipWaitingOnSubTask
					&& taskResult.taskResult
					&& taskResult.taskResult.asyncTasksGroupId) {
					return this._waitForSubTasks(taskResult.taskResult.asyncTasksGroupId)
				}
			})
			.then(() => {
				this.executeCallback(this.onFinish, primaryTaskResult)
				return primaryTaskResult.taskResult
			})
	}

	private async _awaitTask(taskId: string): Promise<GroupExecution> {
		const url = `${this.baseUrl}/rest/v3/task/wait/${taskId}/${waitingTime}`
		const request = new Request(url)
			.setMethod('GET')
		return this.client.call<GroupExecution>(request)
	}
}
