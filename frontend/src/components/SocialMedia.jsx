import React, { useState } from 'react';
import { FaFacebook, FaLinkedin, FaTwitter, FaReddit } from 'react-icons/fa';
import { AiFillInstagram } from 'react-icons/ai';

const SocialMedia = () => {
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [username, setUsername] = useState('');
    const [stats, setStats] = useState(null);

    const platforms = [
        { name: 'Facebook', icon: FaFacebook, color: 'bg-blue-600' },
        { name: 'LinkedIn', icon: FaLinkedin, color: 'bg-blue-700' },
        { name: 'Instagram', icon: AiFillInstagram, color: 'bg-pink-600' },
        { name: 'Twitter', icon: FaTwitter, color: 'bg-blue-400' },
        { name: 'Reddit', icon: FaReddit, color: 'bg-orange-600' },
    ];

    const handlePlatformSelect = (platform) => {
        setSelectedPlatform(platform);
        setStats(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const mockStats = {
            followers: Math.floor(Math.random() * 10000),
            posts: Math.floor(Math.random() * 500),
            engagement: (Math.random() * 5).toFixed(2) + '%',
        };
        setStats(mockStats);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-purple-800 mb-8 text-center">
                    Social Media Stats
                </h1>

                <div className="flex justify-center space-x-6 mb-10">
                    {platforms.map((platform) => (
                        <button
                            key={platform.name}
                            onClick={() => handlePlatformSelect(platform)}
                            className={`text-white p-6 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ${platform.color}`}
                        >
                            <platform.icon className="text-5xl" />
                        </button>
                    ))}
                </div>

                {selectedPlatform && (
                    <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition duration-300">
                        <h2 className="text-3xl font-semibold mb-6 text-center text-purple-800">
                            {selectedPlatform.name} Stats
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label
                                    className="block text-purple-700 font-bold mb-2"
                                    htmlFor="username"
                                >
                                    Username
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-3 px-4 text-purple-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="username"
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-center">
                                <button
                                    className={`${selectedPlatform.color} hover:opacity-80 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out`}
                                    type="submit"
                                >
                                    Get Stats
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {stats && (
                    <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl mt-8 p-8 transform hover:scale-105 transition duration-300">
                        <h3 className="text-2xl font-semibold text-center text-purple-800 mb-6">
                            User Stats
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-gray-600">Followers</p>
                                <p className="text-2xl font-bold text-purple-800">
                                    {stats.followers}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Posts</p>
                                <p className="text-2xl font-bold text-purple-800">
                                    {stats.posts}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Engagement</p>
                                <p className="text-2xl font-bold text-purple-800">
                                    {stats.engagement}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialMedia;
