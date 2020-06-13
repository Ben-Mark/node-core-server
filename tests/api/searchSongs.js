import test from 'ava';

const {chai} = require('../baseApiTest');

const server = require('./../../app');

test("API: search youtube song with likes percentages", async t => {

    return await chai.request(server)
        .post('/api/search')
        .send({
            searchWord: "2pac%202020%20remix"
        })
        .then((result) => {
            t.assert(result.body.length === 10)
        })
        .catch(err => {
            console.error(err);
        })


});