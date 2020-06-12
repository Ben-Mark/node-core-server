module.exports = (mandatoryParams, req, res) =>{

    // payloadType: [query , body ... ]
    mandatoryParams.map(payloadType => {
        // if(!req[payloadType]){
        //     notFoundResponse(res,`missing ${payloadType} parameters: ${mandatoryParams[payloadType]}`)
        // }
        return Object.keys(payloadType).map(paramKey => {
            //key doesnt exist
            if(!req[payloadType][paramKey]){
                notFoundResponse(res,`missing mandatory ${payloadType} parameter: ${paramKey}`)
            }
        })
    })

};


let notFoundResponse = (response, notFoundMsg) => {
    if (response.statusCode !== 404)
        response.status(404)        // HTTP status 404: NotFound
            .send(`Not found, ${notFoundMsg || ""} `);
};
