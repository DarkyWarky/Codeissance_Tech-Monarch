import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { TailSpin } from 'react-loader-spinner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';  // Importing recharts components
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FFBB28', '#FF8042']; // Colors for the pie chart



const LeakResultDisplay = ({ email, leakResult }) => {
    if (!leakResult) return <p>No leak check result available.</p>;

    return (
        
        <div className=" text-lg bg-gradient-to-br from-indigo-100 to-purple-200 flex flex-col items-center justify-center shadow-md rounded-lg p-6 text-purple-800 font-bold  z-10 h-auto">
            <h2 className="text-5xl font-heading leading-tight font-semibold mb-4">Data Leaked in a Breach? </h2>
            {leakResult.success ? (
                <>
                    <p className="text-xl mb-2">
                        <span className="font-medium text-3xl">Status:</span> 
                        <span className="text-red-600 text-3xl font-bold ml-2">Leak Found</span>
                    </p>
                    <p className="mb-2">
                        <span className="font-medium">Number of leaks:</span> 
                        <span className="ml-2">{leakResult.found}</span>
                    </p>
                    <div className="mb-4 text-left">
                        <p className="font-medium mb-1">Compromised information:</p>
                        <ul className="list-disc list-inside pl-4">
                            {leakResult.fields.map((field, index) => (
                                <li key={index} className="capitalize">{field.replace('_', ' ')}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium mb-1">Leak sources:</p>
                        <ul className="list-disc list-inside pl-4">
                            {leakResult.sources.map((source, index) => (
                                <li key={index}>
                                    {source.name} <span className="text-gray-600">({source.date})</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : (
                <p className="text-3xl text-green-600 font-bold">No leaks found</p>
            )}
        </div>
    );
};

const Emails = () => {
    const [emailCategories, setEmailCategories] = useState(null);
    const [spamCategories, setSpamCategories] = useState(null); // New state for spam emails
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [fetchedEmails, setFetchedEmails] = useState(null);
    const [leakResult, setLeakResult] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileAndProcessEmails();
    }, []);

    const fetchProfileAndProcessEmails = async () => {
        try {
            const profileResponse = await axios.get('http://localhost:8000/api/user/profile', {
                withCredentials: true
            });
            const profile = profileResponse.data;
            console.log('Received profile data:', profile);

            setUserProfile(profile);

            if (profile && profile.fullUser && profile.fullUser.accessToken) {
                await fetchAndProcessEmails(profile.fullUser.accessToken, profile.fullUser.googleId);
                await checkEmailLeak(profile.email);
            } else {
                throw new Error('Invalid user profile data or missing access token');
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
            if (err.response && err.response.status === 401) {
                navigate('/');
            } else {
                setError('Failed to fetch user profile: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAndProcessEmails = async (accessToken, googleId) => {
        try {
            const response = await axios.get('http://localhost:8000/api/gmail/fetch-emails', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            
            const emails = response.data;
            console.log('Fetched emails:', emails);

            setFetchedEmails(emails);

            if (emails.length > 0) {
                const categorizedEmails = await categorizeEmailsWithGemini(emails);
                setEmailCategories(categorizedEmails);
                
                if (googleId) {
                    await storeEmailsInFirestore(googleId, emails, categorizedEmails);
                } else {
                    console.error('Google ID not found in profile');
                }
            } else {
                setEmailCategories({ 
                    categories: [{ 
                        name: "No Emails", 
                        uniqueSenders: 0, 
                        senders: [] 
                    }] 
                });
            }
        } catch (err) {
            console.error('Error fetching or processing emails:', err);
            setError('Failed to fetch or process emails: ' + err.message);
        }
    };
    
    const fetchAndProcessSpamEmails = async (accessToken) => {
        try {
            const response = await axios.get('http://localhost:8000/api/gmail/fetch-spams', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            
            const spamEmails = response.data;
            console.log('Fetched spam emails:', spamEmails);

            if (spamEmails.length > 0) {
                const categorizedSpams = await categorizeEmailsWithGemini(spamEmails);
                setSpamCategories(categorizedSpams);
            } else {
                setSpamCategories({
                    categories: [{
                        name: "No Spam Emails",
                        uniqueSenders: 0,
                        senders: []
                    }]
                });
            }
        } catch (err) {
            console.error('Error fetching or processing spam emails:', err);
            setError('Failed to fetch or process spam emails: ' + err.message);
        }
    };


    const categorizeEmailsWithGemini = async (emails) => {
        const API_KEY = 'AIzaSyApiAFWpRgc7wCo2XCXOD29f2Y0zwjxSx8'; // Replace with your actual API key
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

        const prompt = `
        Categorize the following list of email senders into 5 categories. 
        For each category, provide a count of unique senders and how many times each sender appears.
        Return the result as a JSON object with the following structure:
        {
        "categories": [
        {
        "name": "Category Name",
        "uniqueSenders": 10,
        "senders": [
        { "email": "example@example.com", "count": 5 },
        ...
        ]
        },
        ...
        ]
        }
        Here's the list of email senders:
        ${JSON.stringify(emails)}
        `;

        try {
            const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Gemini API Response:', response.data);

            if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                let generatedContent = response.data.candidates[0].content.parts[0].text;
                console.log('Generated content:', generatedContent);

                // Extract JSON from the markdown code block
                const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        const parsedContent = JSON.parse(jsonMatch[1]);
                        if (parsedContent.categories) {
                            return parsedContent;
                        }
                    } catch (parseError) {
                        console.error('Error parsing JSON:', parseError);
                    }
                }
                throw new Error('Invalid JSON response from Gemini API');
            } else {
                throw new Error('No valid response from Gemini API');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            throw error;
        }
    };

    const checkEmailLeak = async (userEmail) => {
        try {
            const response = await axios.post('http://localhost:8000/api/privacy/checkleak', 
                { email: userEmail },
                { withCredentials: true }
            );
            setLeakResult(response.data);
        } catch (error) {
            console.error(`Error checking leak for ${userEmail}:`, error);
            setLeakResult({ error: 'Failed to check leak' });
        }
    };

    const storeEmailsInFirestore = async (googleId, emails, categorizedEmails) => {
        try {
            const userDocRef = doc(db, 'users', googleId);
            const emailsToStore = emails.map(email => ({
                from: email.from || '',
                subject: email.subject || '',
                date: email.date || '',
            })).filter(email => email.from && email.subject && email.date);

            await setDoc(userDocRef, {
                fetchedEmails: emailsToStore,
                categorizedEmails: categorizedEmails || {}
            }, { merge: true });
            console.log('Emails and categories stored in Firestore');
        } catch (error) {
            console.error('Error storing emails in Firestore:', error);
        }
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const closePopup = () => {
        setSelectedCategory(null);
    };

    const renderPieChart = () => {
        if (!emailCategories || !emailCategories.categories) return null;

        // Prepare data for the PieChart
        const pieData = emailCategories.categories.map((category) => ({
            name: category.name,
            value: category.senders.reduce((sum, sender) => sum + sender.count, 0),
        }));

        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    };


    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white relative">
            {/* Loader */}
            <TailSpin
                height="120"
                width="120"
                color="#fff"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                visible={true}
            />
            
            {/* Loading Text */}
            <p className="text-3xl font-bold mt-6 animate-pulse">Finding Your Digital Footprints...</p>
    
            {/* Floating decorative elements */}
            <div className="absolute top-10 left-10 bg-white w-8 h-8 rounded-full opacity-50 animate-float"></div>
            <div className="absolute bottom-16 right-16 bg-indigo-200 w-10 h-10 rounded-full opacity-50 animate-float delay-100"></div>
            <div className="absolute top-24 right-24 bg-purple-300 w-12 h-12 rounded-full opacity-50 animate-float delay-200"></div>
        </div>
    );
    
        if (error) return <div className="text-center mt-8 text-red-600">Error: {error}</div>;

    return (
            <>
        <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-700 h-auto pb-20">
            <h1 className="text-6xl font-heading font-bold leading-tight pt-9 text-white mb-6 text-center">Companies that have Footprints</h1>
            {userProfile && <p className="text-center text-white/90 mb-4">User: {userProfile.email}</p>}
            
            {/* Render the Pie Chart */}
            <div className="my-8">
                    {renderPieChart()}
                </div>


            {emailCategories && emailCategories.categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {emailCategories.categories.map((category, index) => (
                        <div 
                            key={index} 
                            className="bg-white p-6 rounded-md shadow-md min-h-40 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleCategoryClick(category)}
                        >
                            <h2 className="text-2xl font-semibold mb-3">{category.name}</h2>
                            <p className="text-black ">Unique Senders: {category.uniqueSenders}</p>
                            <p className="text-black">Total Emails: {category.senders.reduce((sum, sender) => sum + sender.count, 0)}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-xl mt-8">No emails found.</p>
            )}

            {selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-3xl font-bold mb-4">{selectedCategory.name}</h2>
                        <p className="text-xl mb-4">Unique Senders: {selectedCategory.uniqueSenders}</p>
                        <ul className="space-y-2">
                            {selectedCategory.senders.map((sender, senderIndex) => (
                                <li key={senderIndex} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                    <span className="font-medium">{sender.email}</span>
                                    <div>
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full mr-2">Count: {sender.count}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button 
                            className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={closePopup}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            
            {spamCategories && (
                <div className="w-full max-w-4xl mb-10">
                    <h2 className="text-3xl font-heading leading-tight font-semibold mb-6 text-center text-gray-800">
                        Spam Emails
                    </h2>
                    {renderPieChart(spamCategories)}

                    {spamCategories.categories.map((category, index) => (
                        <div key={index} className="mb-4">
                            <div
                                className="text-2xl font-medium cursor-pointer hover:text-blue-500 mb-2"
                                onClick={() => handleCategoryClick(category)}
                            >
                                {category.name} - {category.uniqueSenders} unique senders
                            </div>
                            <ul>
                                {category.senders.map((sender, i) => (
                                    <li key={i} className="pl-4">
                                        {sender.name} - {sender.count} emails
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Updated leak check result display */}
        </div>
                <LeakResultDisplay email={userProfile?.email} leakResult={leakResult} />
    </>
    );
};

export default Emails;