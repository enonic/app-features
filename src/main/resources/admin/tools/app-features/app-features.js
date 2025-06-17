exports.get = function (req) {
    return {
        body : __.newBean('com.enonic.xp.sample.features.Test').callme()
    }
}
