import express from 'express';
import  graphqlHTTP from 'express-graphql'
import schema from './graphql/schema';
import db from './models'
import { extratJwtMiddleware } from './middlewares/extract-jwt.middlewares';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middleware();
    }

    private middleware(): void {

        this.express.use('/graphql',

            extratJwtMiddleware(),

            (req, res, next) => {
                req['context'].db = db;
                next();
            },

            graphqlHTTP((req) => ({
                schema: schema,
                graphiql: true, //
                context: req['context']
            }))
        );


    }
}

export default new App().express;
