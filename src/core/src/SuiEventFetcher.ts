import type { EventId, SuiClient, SuiEvent } from "@mysten/sui/client";

import { sleep } from "./misc.js";

/**
 * Fetch Sui events and parse them into custom objects.
 * @see SuiEventFetcher.fetchEvents
 */
export class SuiEventFetcher<T> {
	private eventType: string;
	private parseEvent: (suiEvent: SuiEvent) => T | null;
	private eventCursor: EventId | null;
	private suiClient: SuiClient;
	private rateLimitDelay = 300; // how long to sleep between RPC requests, in milliseconds

	/**
	 * @param eventType     The full Sui event object type, e.g. '0x123::your_module::YourEvent'.
	 * @param parseEvent    A function that can parse raw Sui events into custom objects.
	 * @param nextCursor    (optional) To start fetching events starting at an old cursor.
	 * @param networkName   (optional) The network name. Defaults to 'mainnet'.
	 */
	constructor(
		suiClient: SuiClient,
		eventType: string,
		parseEvent: (suiEvent: SuiEvent) => T | null,
		nextCursor: EventId | null = null,
	) {
		this.eventType = eventType;
		this.parseEvent = parseEvent;
		this.eventCursor = nextCursor;
		this.suiClient = suiClient;
	}

	/**
	 * Fetch the latest events. Every time the function is called it looks
	 * for events that took place since the last call.
	 */
	public async fetchEvents(): Promise<T[]> {
		try {
			if (!this.eventCursor) {
				// 1st run
				await this.fetchLastEventAndUpdateCursor();
				return [];
			} else {
				return await this.fetchEventsFromCursor();
			}
		} catch (error) {
			console.error("[SuiEventFetcher]", error);
			return [];
		}
	}

	private async fetchLastEventAndUpdateCursor(): Promise<void> {
		// console.debug(`[SuiEventFetcher] fetchLastEventAndUpdateCursor()`);

		// fetch last event
		const suiEvents = await this.suiClient.queryEvents({
			query: { MoveEventType: this.eventType },
			limit: 1,
			order: "descending",
		});

		// update cursor
		if (!suiEvents.nextCursor) {
			console.error("[SuiEventFetcher] unexpected missing cursor");
		} else {
			this.eventCursor = suiEvents.nextCursor;
		}
	}

	private async fetchEventsFromCursor(): Promise<T[]> {
		// console.debug(`[SuiEventFetcher] fetchEventsFromCursor()`);

		// fetch events from cursor
		const suiEvents = await this.suiClient.queryEvents({
			query: { MoveEventType: this.eventType },
			cursor: this.eventCursor,
			order: "ascending",
			// limit: 10,
		});

		// update cursor
		if (!suiEvents.nextCursor) {
			console.error("[SuiEventFetcher] unexpected missing cursor");
			return [];
		}
		this.eventCursor = suiEvents.nextCursor;

		// parse events
		const objects: T[] = [];
		for (const suiEvent of suiEvents.data) {
			const obj = this.parseEvent(suiEvent);
			if (obj) {
				objects.push(obj);
			}
		}
		// console.debug('suiEvents.data.length:', suiEvents.data.length)
		// console.debug('hasNextPage:', suiEvents.hasNextPage);
		// console.debug('nextCursor:', suiEvents.nextCursor ? suiEvents.nextCursor.txDigest : 'none');

		// call this function recursively if there's newer events that didn't fit in the page
		if (suiEvents.hasNextPage) {
			// console.debug(`[SuiEventFetcher] has next page, will fetching recursively`);
			await sleep(this.rateLimitDelay);
			const nextObjects = await this.fetchEventsFromCursor();
			objects.push(...nextObjects);
		}

		return objects;
	}
}
