(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
        return;
    }

    root.JsonRelaxedHelper = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function normalizeJsonLikeInput(input) {
        const source = String(input || '');
        let normalized = '';
        let token = '';
        let quote = null;
        let escaped = false;

        function flushToken() {
            if (!token) {
                return;
            }
            if (token === 'None') {
                normalized += 'null';
            } else if (token === 'True') {
                normalized += 'true';
            } else if (token === 'False') {
                normalized += 'false';
            } else {
                normalized += token;
            }
            token = '';
        }

        for (let i = 0; i < source.length; i++) {
            const char = source[i];

            if (quote === "'") {
                if (escaped) {
                    if (char === "'") {
                        normalized += "'";
                    } else if (char === '"') {
                        normalized += '\\"';
                    } else {
                        normalized += '\\' + char;
                    }
                    escaped = false;
                    continue;
                }

                if (char === '\\') {
                    escaped = true;
                    continue;
                }

                if (char === "'") {
                    normalized += '"';
                    quote = null;
                    continue;
                }

                if (char === '"') {
                    normalized += '\\"';
                    continue;
                }

                if (char === '\n') {
                    normalized += '\\n';
                    continue;
                }

                if (char === '\r') {
                    normalized += '\\r';
                    continue;
                }

                normalized += char;
                continue;
            }

            if (quote === '"') {
                normalized += char;
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (char === '\\') {
                    escaped = true;
                    continue;
                }
                if (char === '"') {
                    quote = null;
                }
                continue;
            }

            if (char === "'") {
                flushToken();
                quote = "'";
                normalized += '"';
                continue;
            }

            if (char === '"') {
                flushToken();
                quote = '"';
                normalized += char;
                continue;
            }

            if (/[A-Za-z_]/.test(char)) {
                token += char;
                continue;
            }

            flushToken();
            normalized += char;
        }

        if (quote === "'") {
            throw new Error('单引号字符串未闭合');
        }

        flushToken();
        return normalized.replace(/,\s*([}\]])/g, '$1');
    }

    function buildParserError(message, code) {
        const error = new Error(message);
        error.code = code;
        return error;
    }

    function createParser(text) {
        return {
            text: text,
            index: 0
        };
    }

    function peek(parser) {
        return parser.text[parser.index];
    }

    function skipWhitespace(parser) {
        while (parser.index < parser.text.length && /\s/.test(parser.text[parser.index])) {
            parser.index++;
        }
    }

    function isAtEnd(parser) {
        return parser.index >= parser.text.length;
    }

    function consumeIf(parser, char) {
        if (peek(parser) === char) {
            parser.index++;
            return true;
        }
        return false;
    }

    function parseStringValue(parser, allowPartial) {
        if (!consumeIf(parser, '"')) {
            throw buildParserError('Expected string key', 'PARSE_ERROR');
        }

        let result = '';
        let escaped = false;

        while (!isAtEnd(parser)) {
            const char = parser.text[parser.index++];

            if (escaped) {
                result += '\\' + char;
                escaped = false;
                continue;
            }

            if (char === '\\') {
                escaped = true;
                continue;
            }

            if (char === '"') {
                return JSON.parse('"' + result + '"');
            }

            result += char;
        }

        if (allowPartial) {
            try {
                return JSON.parse('"' + result + '"');
            } catch (e) {
                return result;
            }
        }

        throw buildParserError('Unexpected end of JSON input', 'INCOMPLETE_JSON');
    }

    function parseNumberValue(parser) {
        const slice = parser.text.slice(parser.index);
        const match = slice.match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+\-]?\d+)?/);
        if (!match) {
            throw buildParserError('Invalid number', 'PARSE_ERROR');
        }
        parser.index += match[0].length;
        return Number(match[0]);
    }

    function parseLiteralValue(parser) {
        const slice = parser.text.slice(parser.index);
        if (slice.startsWith('true')) {
            parser.index += 4;
            return true;
        }
        if (slice.startsWith('false')) {
            parser.index += 5;
            return false;
        }
        if (slice.startsWith('null')) {
            parser.index += 4;
            return null;
        }
        throw buildParserError('Unexpected token', 'PARSE_ERROR');
    }

    function parseValue(parser, allowPartial) {
        skipWhitespace(parser);

        if (isAtEnd(parser)) {
            throw buildParserError('Unexpected end of JSON input', 'INCOMPLETE_JSON');
        }

        const char = peek(parser);
        if (char === '{') {
            return parseObjectValue(parser, allowPartial);
        }
        if (char === '[') {
            return parseArrayValue(parser, allowPartial);
        }
        if (char === '"') {
            return parseStringValue(parser, allowPartial);
        }
        if (char === '-' || /[0-9]/.test(char)) {
            return parseNumberValue(parser);
        }
        return parseLiteralValue(parser);
    }

    function closeContainerIfPresent(parser, endChar) {
        skipWhitespace(parser);
        if (peek(parser) === endChar) {
            parser.index++;
        }
    }

    function parseObjectValue(parser, allowPartial) {
        const result = {};
        consumeIf(parser, '{');
        skipWhitespace(parser);

        if (consumeIf(parser, '}')) {
            return result;
        }

        while (true) {
            skipWhitespace(parser);

            if (isAtEnd(parser)) {
                if (allowPartial) {
                    return result;
                }
                throw buildParserError('Unexpected end of JSON input', 'INCOMPLETE_JSON');
            }

            if (consumeIf(parser, '}')) {
                return result;
            }

            const memberStart = parser.index;
            let key;
            try {
                key = parseStringValue(parser);
            } catch (error) {
                if (allowPartial) {
                    parser.index = memberStart;
                    try {
                        key = parseStringValue(parser, true);
                        result[key] = null;
                    } catch (e) {
                        // ignore
                    }
                    closeContainerIfPresent(parser, '}');
                    return result;
                }
                throw error;
            }

            skipWhitespace(parser);
            if (!consumeIf(parser, ':')) {
                if (allowPartial) {
                    result[key] = null;
                    closeContainerIfPresent(parser, '}');
                    return result;
                }
                throw buildParserError('Expected colon after key', 'PARSE_ERROR');
            }

            const valueStart = parser.index;
            let value;
            try {
                value = parseValue(parser, allowPartial);
            } catch (error) {
                if (allowPartial) {
                    result[key] = null;
                    parser.index = valueStart;
                    closeContainerIfPresent(parser, '}');
                    return result;
                }
                throw error;
            }

            result[key] = value;
            skipWhitespace(parser);

            if (consumeIf(parser, ',')) {
                skipWhitespace(parser);
                if (consumeIf(parser, '}')) {
                    return result;
                }
                continue;
            }

            if (consumeIf(parser, '}')) {
                return result;
            }

            if (allowPartial) {
                return result;
            }

            throw buildParserError('Expected comma or closing brace', 'PARSE_ERROR');
        }
    }

    function parseArrayValue(parser, allowPartial) {
        const result = [];
        consumeIf(parser, '[');
        skipWhitespace(parser);

        if (consumeIf(parser, ']')) {
            return result;
        }

        while (true) {
            skipWhitespace(parser);

            if (isAtEnd(parser)) {
                if (allowPartial) {
                    return result;
                }
                throw buildParserError('Unexpected end of JSON input', 'INCOMPLETE_JSON');
            }

            if (consumeIf(parser, ']')) {
                return result;
            }

            const itemStart = parser.index;
            let value;
            try {
                value = parseValue(parser, allowPartial);
            } catch (error) {
                if (allowPartial) {
                    parser.index = itemStart;
                    closeContainerIfPresent(parser, ']');
                    return result;
                }
                throw error;
            }

            result.push(value);
            skipWhitespace(parser);

            if (consumeIf(parser, ',')) {
                skipWhitespace(parser);
                if (consumeIf(parser, ']')) {
                    return result;
                }
                continue;
            }

            if (consumeIf(parser, ']')) {
                return result;
            }

            if (allowPartial) {
                return result;
            }

            throw buildParserError('Expected comma or closing bracket', 'PARSE_ERROR');
        }
    }

    function parsePartialJsonInputDetailed(normalized) {
        const parser = createParser(normalized);
        skipWhitespace(parser);

        if (isAtEnd(parser)) {
            throw buildParserError('Unexpected end of JSON input', 'INCOMPLETE_JSON');
        }

        return {
            value: parseValue(parser, true),
            consumed: parser.index
        };
    }

    function parsePartialJsonInput(normalized) {
        return parsePartialJsonInputDetailed(normalized).value;
    }

    function isRootCandidateChar(char) {
        return char === '{' || char === '[';
    }

    function parseBestPartialJsonInput(normalized) {
        let bestCandidate = null;

        for (let i = 0; i < normalized.length; i++) {
            if (!isRootCandidateChar(normalized[i])) {
                continue;
            }

            try {
                const candidate = parsePartialJsonInputDetailed(normalized.slice(i));
                if (!bestCandidate || candidate.consumed > bestCandidate.consumed) {
                    bestCandidate = {
                        value: candidate.value,
                        consumed: candidate.consumed,
                        start: i
                    };
                }
            } catch (error) {
                // Ignore bad candidate roots and keep searching for a richer parse.
            }
        }

        if (!bestCandidate) {
            throw buildParserError('Unexpected end of JSON input', 'INCOMPLETE_JSON');
        }

        return bestCandidate.value;
    }

    function parseJsonInput(input, options) {
        const settings = options || {};

        try {
            return JSON.parse(input);
        } catch (strictError) {
            const normalized = normalizeJsonLikeInput(input);

            try {
                return JSON.parse(normalized);
            } catch (relaxedError) {
                if (!settings.allowPartial) {
                    throw new Error(relaxedError.message);
                }
                try {
                    return parseBestPartialJsonInput(normalized);
                } catch (partialError) {
                    throw new Error(relaxedError.message || partialError.message);
                }
            }
        }
    }

    return {
        normalizeJsonLikeInput: normalizeJsonLikeInput,
        parseJsonInput: parseJsonInput
    };
}));
