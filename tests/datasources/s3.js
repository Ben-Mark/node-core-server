import test from 'ava';
// const {chai,app} = require('../baseApiTest');
const S3 = require('../../lib/orm/datasources/s3');
const path = require('path');

test("s3 unit test get file", async t => {

    let s3 = new S3();

    await s3.get('rasa/rf/config/config.yml')
        .then(res => {
            console.log(res);
            t.assert(res);
        });

});

test("s3 unit test remove file", async t => {

    let s3 = new S3();

    await s3.remove('rasa/rf/models/20200223-075824.tar.gz.5EFbF596.e0Cc332E')
        .then(res => {
            t.assert(true);
        });

});


test("s3 unit test list file", async t => {

    let s3 = new S3();

    await s3.getAll('rasa/rf/data')
        .then(res => {
            t.assert(true);
        });

});


test("s3 unit test get all lookupfiles and append them to the nlu.md", async t => {

    let s3 = new S3();

    let lookupFiles = await s3.getAll('rasa/rf/data')
        .then(lookupFiles => lookupFiles.filter(filePath => {
                //get all of the lookup.txt files to append to nlu.
                return filePath.endsWith('.txt');
            }));

    let nlu = await s3.get('rasa/rf/data/nlu.md');

    let nluRows = nlu.split('\n');

    let lookUpFileNames = lookupFiles.map(filePath => path.basename(filePath));


    //example for a lookup field inside an nlu.md
    //## lookup:additional_currencies  <!-- specify lookup tables in an external file -->
    // path/to/currencies.txt
    const lookUpHtmlComment = "<\!-- specify lookup tables in an external file -->";

    lookUpFileNames.forEach(lookUpFileName =>{
        let lookUpKey = `## lookup:${lookUpFileName} ${lookUpHtmlComment}`;
        nluRows.push(lookUpKey);
        let lookUpValue = `  data/${lookUpFileName}`;
        nluRows.push(lookUpValue);
    });

    console.log(nluRows.join('\n'));
    // console.log(lookupFiles);
    t.assert(true);
    //     .map(async lookUpFile => {
    //     let lookUp = await s3.get(lookUpFile);
    //     console.log(lookUp);
    //     t.assert(true);
    //     return lookUp
    // }));

    //what
    // explain
    // whether
    // can i
    // is it
    // are you
    // do i
    // can you
    // does it
    // am i
    // why
    // life is
    // how come
    // white
    // What
    // Explain
    // Whether
    // Can i
    // Is it
    // Are you
    // Do i
    // Can you
    // Does it
    // Am i
    // Why
    // Life is
    // How come
    // White

});


