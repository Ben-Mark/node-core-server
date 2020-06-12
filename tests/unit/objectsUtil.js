import test from 'ava';
const objectUtil = require('../../lib/utils/objectsUtil');

test("verify that the difference between two objects is functionally valid without regards to base object size compared to the target object", async t => {

    let obj1 = {
        a: "a",
        b: "b",
        c: "c"
    };

    let obj2 = {
        a: "a",
        b: "b",
        c: "g",
        d: "d",
    };

    let result = objectUtil.getObjectsDiff(obj1, obj2);
    t.assert(result['c'] && result['c'] === 'g');
    t.assert(result['d'] && result['d'] === 'd');


     obj1 = {
        a: "a",
        b: "b",
        c: "c"
    };

     obj2 = {
        a: "a",
        b: "b",
        c: "k",
    };

    result = objectUtil.getObjectsDiff(obj1, obj2);
    t.assert(result['c'] && result['c'] === 'k');


    obj1 = {
        a: "a",
        b: "b",
        c: "c"
    };

    obj2 = {
        a: "a",
        b: "f",
    };

    result = objectUtil.getObjectsDiff(obj1, obj2);
    t.assert(result['b'] && result['b'] === 'f');


});
