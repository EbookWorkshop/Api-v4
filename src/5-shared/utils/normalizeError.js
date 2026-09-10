function normalizeError(err) {
    if (!err) return { message: 'Unknown error' };
    if (typeof err === 'string') return { message: err };
    return {
        message: err.message || 'Unknown error',
        name: err.name,
        stack: err.stack,
        code: err.code,
        details: err.details,
    };
}