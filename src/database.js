import fs from 'node:fs/promises'

const databasePath = new URL('db/db.json', import.meta.url)

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf-8').then(data => {
            this.#database = JSON.parse(data)
        }).catch(() => {
            this.#persist()
        })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    select(table, search) {
        let data = this.#database[table] ?? []

        if (search) {
            data = data.filter((row) => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLocaleLowerCase().includes(value.toLocaleLowerCase())
                })
            })
        }

        return data
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist
        }
    }

    update(table, id, data, field = null) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if (rowIndex > -1) {
            if (field) {
                this.#database[table][rowIndex][field] = data
                this.#persist()
            } else {
                const oldRow = this.#database[table][rowIndex]
                this.#database[table][rowIndex] = { ...oldRow, ...data }
                this.#persist()
            }
        }
    }
}