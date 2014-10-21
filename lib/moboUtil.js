//////////////////////////////////////////
// MOBO UTILITY MODULE                  //
//////////////////////////////////////////

// This module is a collection of more general utility functions
// They are used throughout mobo

/**
 * Pad a number with n digits
 *
 * @param number
 * @param digits
 * @returns {string}
 */
exports.pad = function pad(number, digits) {
    return new Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
};

/**
 * Strips trailing slashes from URL
 *
 * @see http://stackoverflow.com/a/6680858/776425
 *
 * @param {String} str URL to cleanup
 * @returns {String}
 */
exports.stripTrailingSlash = function(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}