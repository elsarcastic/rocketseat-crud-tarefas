import { buildRoutePath } from "../utils/utils.js"
import { Database } from "../database.js"
import { randomUUID } from 'node:crypto'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search, description: search
            } : null)

            return res.writeHead(200).end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            try {
                const { title, description } = req.body

                if (!title) return res.writeHead(419).end('Title is missing')

                if (!description) return res.writeHead(420).end('Description is missing')

                const newTask = {
                    id: randomUUID(),
                    title,
                    description,
                    completed_at: null,
                    created_at: new Date(),
                    updated_at: new Date()
                }

                database.insert('tasks', newTask)

                return res.writeHead(201).end()

            } catch (error) {
                return res.writeHead(427).end(error)
            }

        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const { title, description } = req.body

            const task = database.select('tasks', { id })

            if (task.length === 0) return res.writeHead(419).end('Task does not exist')

            if (!title && !description) return res.writeHead(419).end('No data to update')

            const taskUpdated = {
                updated_at: new Date(),
                title,
                description
            }

            try {
                database.update('tasks', id, taskUpdated)

                return res.writeHead(201).end()

            } catch {
                return res.writeHead(404).end('Error while updating resource')
            }
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const task = database.select('tasks', { id })

            if (task.length === 0) return res.writeHead(419).end('Task does not exist')

            try {
                database.delete('tasks', id)

                return res.writeHead(204).end()

            } catch {
                return res.writeHead(404).end('Error while deleting resource')
            }
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/completed'),
        handler: (req, res) => {
            const { id } = req.params
            const { completed } = req.query

            if (!completed) return res.writeHead(419).end('Completed info is missing')

            if (!['true', 'false'].includes(completed)) return res.writeHead(419).end('Completed info is invalid')

            const task = database.select('tasks', { id })

            if (task.length === 0) return res.writeHead(419).end('Task does not exist')

            try {
                if (completed === 'true') {
                    database.update('tasks', id, new Date(), 'completed_at')

                    return res.writeHead(201).end()
                } else if (completed === 'false') {
                    database.update('tasks', id, null, 'completed_at')

                    return res.writeHead(201).end()
                }

            } catch {
                return res.writeHead(404).end('Error while updating resource')
            }
        }
    }
]