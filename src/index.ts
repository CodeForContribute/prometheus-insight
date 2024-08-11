import express from "express";
import { Counter } from 'prom-client';
import client from 'prom-client';

const app = express();
app.use(express.json());

let counter = new Counter({
    name: 'http_number_of_requests',
    help: "Number of Http Requests made",
    labelNames:['method','route','status_code']
});

// @ts-ignore
function requestCountMiddleware(req,res,next){
    const startTime = Date.now();
    res.on('finish',()=>{
        const endTime = Date.now();
        console.log(`Request took ${endTime - startTime} ms`);
        // increment request counter
        counter.inc({
            method: req.method,
            route: req.route ? req.route.path: req.path,
            status_code: res.statusCode
        });
    });
    next();
}
app.use(requestCountMiddleware);

// all the routes defined below
app.get('/', (req, res) => {
    counter.inc({
        route: "/user"
    });
    res.send({
        name: "hare krishna",
        type: "mantra"
    })
})

app.get('/todos',(req,res)=>{
    counter.inc({
        route: "/todos"
    });
    res.send({
        name: "hare rama",
        type: "mantra"
    })
})

app.get('/metrics', async (req, res) => {
    const metrics = await client.register.metrics();
    res.set('Content-Type', client.register.contentType);
    res.end(metrics);
});

app.listen(3000);