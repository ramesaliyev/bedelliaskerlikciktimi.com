/**
 * Get dependencies.
 */
var strip = require('strip'),
    linkify = require('linkifyjs/string');

/**
 * Linkify options.
 */
var linkifyOptions = {
    attributes: {
        rel: 'nofollow'
    }
};

/**
 * Modify texts.
 *
 * Clear html tags, convert url strings to <a> again.
 */
module.exports = function(text) {
    // Keep new lines.
    text = text.replace(/(\\n|<br(\/| \/|)>)/g, '$NEWLINE$');

    // Clear text from html tags.
    text = strip(text);

    // Re-link urls.
    text = linkify(text, linkifyOptions);

    // Re-add new lines.
    text = text.replace(/(\$NEWLINE\$)/g, '<br>');

    // Return text.
    return text;
};
