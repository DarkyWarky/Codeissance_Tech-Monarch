import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Emails = () => {
    const [emailCategories, setEmailCategories] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAndProcessEmails();
    }, []);

    const fetchAndProcessEmails = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/gmail/fetch-emails', {
                withCredentials: true
            });
            const emails = response.data;

            // Process emails with Gemini
            const categorizedEmails = await categorizeEmailsWithGemini(emails);
            setEmailCategories(categorizedEmails);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching or processing emails:', err);
            if (err.response && err.response.status === 401) {
                // Redirect to login page if unauthorized
                navigate('/');
            } else {
                setError('Failed to fetch or process emails');
            }
            setLoading(false);
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

            console.log('Gemini API Response:', response.data); // Log the full response

            if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                let generatedContent = response.data.candidates[0].content.parts[0].text;
                console.log('Generated content:', generatedContent); // Log the generated content

                // Attempt to parse the JSON
                try {
                    const parsedContent = JSON.parse(generatedContent);
                    if (parsedContent.categories) {
                        return parsedContent;
                    } else {
                        throw new Error('Unexpected JSON structure');
                    }
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    console.log('Raw content:', generatedContent);
                    // Attempt to extract JSON from the response
                    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const extractedJson = jsonMatch[0];
                        const parsedExtracted = JSON.parse(extractedJson);
                        if (parsedExtracted.categories) {
                            return parsedExtracted;
                        }
                    }
                    throw new Error('Invalid JSON response from Gemini API');
                }
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

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const closePopup = () => {
        setSelectedCategory(null);
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error) return <div className="text-center mt-8 text-red-600">Error: {error}</div>;

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Categorized Emails</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emailCategories && emailCategories.categories.map((category, index) => (
                    <div 
                        key={index} 
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleCategoryClick(category)}
                    >
                        <h2 className="text-2xl font-semibold mb-3">{category.name}</h2>
                        <p className="text-gray-600">Unique Senders: {category.uniqueSenders}</p>
                        <p className="text-gray-600">Total Emails: {category.senders.reduce((sum, sender) => sum + sender.count, 0)}</p>
                    </div>
                ))}
            </div>

            {selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-3xl font-bold mb-4">{selectedCategory.name}</h2>
                        <p className="text-xl mb-4">Unique Senders: {selectedCategory.uniqueSenders}</p>
                        <ul className="space-y-2">
                            {selectedCategory.senders.map((sender, senderIndex) => (
                                <li key={senderIndex} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                    <span className="font-medium">{sender.email}</span>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Count: {sender.count}</span>
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
        </div>
    );
};

export default Emails;