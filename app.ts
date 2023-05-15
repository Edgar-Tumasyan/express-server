import * as dotenv from 'dotenv';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as errorhandler from 'strong-error-handler';

import { groups } from './routes/groups';
import { sequelize } from './sequelize';
import { score } from './routes/score';

dotenv.config();
export const app = express();

// middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// middleware for json body parsing
app.use(bodyParser.json({ limit: '5mb' }));

// enable corse for all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Expose-Headers', 'x-total-count');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type,authorization');

    next();
});

app.use('/scores', score);
app.use('/groups', groups);

app.use(errorhandler({ debug: process.env.ENV !== 'prod', log: true }));

const port = process.env.PORT || 3000;

(async () => {
    await sequelize.sync();

    app.listen(port, () => console.info(`Server running on port ${port}`));
})();
