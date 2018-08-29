/**
 * Load all external dependencies TODO: Move these to the files that need them instead of passing them as properties ( DIRTY ).
 */
const Discord = require('discord.js');
const query = require('game-server-query');
const qs = require("querystring");
const request = require("request");
const bluebird = require("bluebird");
const optionalRequire = require("optional-require")(require);
const fs      = require('fs');
const path      = require('path');
const copycfg     = require('../cfg.js');

fs.exists( path.join(process.execPath , '../z-bot-config.js'), function(exists) {

    if (!exists) {
        console.log("Config doesn't exist yet. Creating zbot-config.js next to executable. Change this file for your server.");
        fs.createReadStream(path.join(__dirname + '/../cfg.js')).pipe(fs.createWriteStream(path.join(process.execPath , '../z-bot-config.js')));
    }

});

/**
 * Load all internal dependencies
 */
const Clapp   = require('./modules/clapp-discord');
const ZBotEvents    = require('./modules/z-bot-events');
const ZBotRedis    = require('./modules/z-bot-redis');
const cfg  =  optionalRequire(path.join(process.execPath , '/../z-bot-config.js'), "Config not yet created.") || undefined;

const defaultConfig  = require('../defaults.js');
const pkg     = require('../package.json');

if(cfg !== undefined) {

    /**
     * Create bot instance.
     */
    let bot     = new Discord.Client({ autoReconnect: true });

    /**
     * Initiate Clapp module
     * This module is an clean and easy implementation for replying to ! commmands.
     * @type {App}
     */
    let clapp = new Clapp.App({
        name: cfg.name,
        desc: pkg.description,
        prefix: cfg.prefix,
        version: pkg.version,
        onReply: (msg, context) => {
            context.msg.reply('\n' + msg).then(bot_response => {
                if (cfg.deleteAfterReply.enabled) {
                    context.msg.delete(cfg.deleteAfterReply.time)
                        .then(msg => console.log(`Deleted message from ${msg.author}`))
                        .catch(console.log);
                    bot_response.delete(cfg.deleteAfterReply.time)
                        .then(msg => console.log(`Deleted message from ${msg.author}`))
                        .catch(console.log);
                }
            });
        }
    });


    /**s
     * Initiate the ZBotEvents of the ZBot module
     * This will be your medium between Discord Events and ZBot.
     * @type {ZBotEvents}
     */
    const events = new ZBotEvents(cfg.token, {
        bot: bot,
        cfg: cfg,
        clapp: clapp,
        query: query,
        qs: qs,
        request: request,
        redisNode: null,
        defaultConfig: defaultConfig
    });

}