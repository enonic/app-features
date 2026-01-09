function fibonacci(n) {
    var fib = [0, 1];
    for (var i = fib.length; i < n; i++) {
        fib[i] = fib[i - 2] + fib[i - 1];
    }

    return fib;
}

// Export the function.
exports.fibonacci = fibonacci;
