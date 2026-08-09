import Dexie, { type Table } from "dexie"

import type { FlowConfiguration } from "../types/Flow"

export interface AppConfigRecord {
    key: string
    value: FlowConfiguration[]
}

class BoothAppDatabase extends Dexie {
    appConfig!: Table<AppConfigRecord, string>

    constructor() {
        super("openphotobooth")

        this.version(1).stores({
            appConfig: "&key",
        })
    }
}

export const boothAppDatabase = new BoothAppDatabase()
