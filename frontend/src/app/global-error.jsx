'use client';

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong!</h2>
                            <p className="text-gray-600 mb-6">
                                An error occurred. Please try again.
                            </p>
                            <button
                                onClick={() => reset()}
                                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
