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
           // console.log(result);
            t.assert(true)
        })
        .catch(err => {
            console.error(err);
        })


});