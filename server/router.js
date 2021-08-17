const Router = require('@express/router');
const router = new Router();
const scriptMetadata = require('./scripts.json');

router.get('/:scriptHashID', async(ctx, next)=>{
    const script = scriptMetadata[ctx.params.scriptHashID];
    if (typeof script === 'undefined'){
        ctx.status = 400;
        ctx.body = {
            error: `script by the Hash ID of: ${ctx.params.scriptHashID} doesn't exist`
        };
        return;
    }
    ctx.body = {
        scriptHashID: ctx.params.scriptHashID,
        result: script
    };
});
module.exports = router;