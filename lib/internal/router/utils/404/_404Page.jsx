import { Link } from 'react-router';
import { useNavigate } from 'react-router';

export default function _404() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* 404 Visual */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full"></div>
                        <div className="relative">
                            <h1 className="text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-500 to-purple-900 leading-none">
                                404
                            </h1>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-semibold mb-4 text-zinc-100">
                        Page Not Found
                    </h2>

                    {/* Description */}
                    <p className="text-lg text-zinc-400 mb-12 max-w-md leading-relaxed">
                        The page you're looking for doesn't exist or has been moved to another location.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex gap-4">
                        <Link 
                            to="/" 
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Go Home
                        </Link>
                        <button 
                            onClick={() => navigate(-1)} 
                            className="px-8 py-3 border border-zinc-700 hover:border-purple-600 text-zinc-300 rounded-lg font-medium transition-colors"
                        >
                            Go Back
                        </button>
                    </div>

                    {/* Decorative Element */}
                    <div className="mt-16 text-zinc-600 text-sm">
                        <p>Lost in the Phyre? We'll help you find your way.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}