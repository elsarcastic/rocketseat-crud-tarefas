import { parse } from 'csv-parse'
import fs from 'node:fs'

const dataCsv = new URL('../data/data.csv', import.meta.url)

export async function importCSV() {
    const lines = []

    const parser = fs.createReadStream(dataCsv).pipe(parse({ delimiter: ';', from_line: 2, encoding: 'utf-8', trim: true }))

    for await (const record of parser) {
        lines.push(record)
    }

    const tasksFormatted = lines.map((record) => ({ title: record[0], description: record[1] }))

    for (const task of tasksFormatted) {
        const response = await fetch('http://localhost:3333/tasks', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task)
        })

        if (response.ok) {
            console.log(`${task.title} importado`)
        }
    }
}

await importCSV()
