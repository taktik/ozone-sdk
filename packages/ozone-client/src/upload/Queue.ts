type Task<T> = () => Promise<T>
type Callback<T> = (err: Error | null, res?: T) => unknown

const noop = () => {
	// nothing
}

class IDGenerator {
	private static currentId = 0
	static generate(): string {
		return `id-${++IDGenerator.currentId}`
	}
}

class Thread<T> {
	private callback: Callback<T> = noop
	public readonly id = IDGenerator.generate()

	startTask(task: Task<T>) {
		task()
			.then((res) => this.callback(null, res))
			.catch((error) => this.callback(error as Error))
	}

	onEnd(cb: Callback<T>) {
		this.callback = cb
	}

	offEnd(cb: Callback<T>) {
		if (this.callback === cb) {
			this.callback = noop
		}
	}
}

export class Queue<T> {
	private threadPool: Thread<T>[] = []
	private freeThreadPoolIds: string[] = []
	private progressCb: (res: T | undefined) => void = noop
	private onQueueEndCallback = noop
	private errorCb: (error: Error) => void = noop
	private tasks: Task<T>[] = []
	constructor(amountOfThreads = 5) {
		for (let i = 0; i < amountOfThreads; i++) {
			const thread = this.createThread()
			this.threadPool.push(thread)
			this.freeThreadPoolIds.push(thread.id)
		}
	}

	/* Return free threads
     * @private
     */
	private getThreads(nbOfThreads: number) {
		const freeThreads = this.freeThreadPoolIds.slice(0, this.freeThreadPoolIds.length > nbOfThreads ? nbOfThreads : this.freeThreadPoolIds.length)
		return this.threadPool.filter((thread) => freeThreads.includes(thread.id))
	}

	/* Add new tasks in the queue
     * If a free thread is available start the process
     * @param tasks
     */
	push(tasks: Task<T>[]) {
		this.tasks.push(...tasks)
		this.getThreads(tasks.length).forEach((thread) => this.startThread(thread))
	}

	onQueueEnd(callback: () => void) {
		this.onQueueEndCallback = callback
	}

	private createThread() {
		const thread = new Thread<T>()
		thread.onEnd((err, response) => {
			if (!err) {
				this.progressCb(response)
				const task = this.tasks.shift()
				if (task) {
					thread.startTask(task)
				}
			} else {
				this.errorCb(err)
				// Decide whether to keep going ? Maybe errorCb could return something to say either abort or continue ?
			}
			if (!this.tasks.length) {
				this.freeThreadPoolIds.push(thread.id) // no more task, the thread is free
				this.onQueueEndCallback()
			}
		})

		return thread
	}

	private startThread(thread: Thread<T>) {
		const task = this.tasks.shift()
		if (task) {
			const index = this.freeThreadPoolIds.findIndex((threadId) => threadId === thread.id)
			this.freeThreadPoolIds.splice(index, 1)
			thread.startTask(task)
		}
	}

	start(progressCb: (res: T | undefined) => void, errorCb: (error: Error) => void) {
		this.progressCb = progressCb
		this.errorCb = errorCb
		this.threadPool.forEach((thread) => this.startThread(thread))
	}
}
