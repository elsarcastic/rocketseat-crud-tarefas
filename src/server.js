import http from 'node:http'
import { json } from './middlewares/json.js'
import { routes } from './routes/routes.js'
import { extractQueryParams } from './utils/utils.js'

const server = http.createServer(async (req, res) => {

    const { method, url } = req

    await json(req, res)

    const route = routes.find((route) => route.path.test(url) && route.method === method)

    if (route) {
        const routeParams = req.url.match(route.path)

        const { query, ...params } = routeParams.groups

        req.params = params
        // funcao que transforma os query params q vem junto da url em um objeto
        req.query = query ? extractQueryParams(query) : {}

        return route.handler(req, res)
    }

    return res.writeHead(404).end()
})

server.listen(3333)

console.log('server listening on port 3333')