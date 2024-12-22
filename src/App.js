import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { BsChevronUp } from 'react-icons/bs';
import './App.css';

function App() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [chat, setChat] = useState([]);
	const [input, setInput] = useState('');

	const send = async (e) => {
		e.preventDefault();
		setLoading(true);
		setInput('');
		setError('');

		const chatCopy = [...chat];
		chatCopy.push({ role: 'user', content: input });
		setChat(chatCopy);

		try {
			const res = await axios.post('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions',
				{
					model: 'Qwen/Qwen2.5-72B-Instruct',
					messages: chatCopy,
				},
				{
				headers: {
					Authorization: 'Bearer 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',
					'Content-Type': 'application/json',
				},
			});

			const data = res.data['choices'][0]['message'];
			chatCopy.push({ role: data.role, content: data.content });
			setChat(chatCopy);
		} catch (error) {
			chatCopy.pop();
			setChat(chatCopy);
			
			if (error.response) {
				if (error.response.status === 400) {
					setError('Invalid input data.');
				} else if (error.response.status === 401) {
					setError('Invalid authorization token.');
				} else if (error.response.status === 403) {
					setError('You have reached your quota limit.');
				} else if (error.response.status === 404) {
					setError('Model does not exist.');
				} else if (error.response.status === 429) {
					setError('Too many requests. Please slow down.');
				} else if (error.response.status === 500) {
					setError('Unexpected server error occurred.');
				} else if (error.response.status === 503) {
					setError('Model is currently loading, Try later.');
				} else {
					setError('Unknown error occured, Try again.');
				};
			} else {
				setError('Unknown error occured, Try again.');
			};
		};

		setLoading(false);
		document.getElementById(chat.length).scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<div className="container">
			<div className="error-container">
				<div className="error">
					{error}
				</div>
			</div>

           	<div className="history">
	           	{
	            	chat.length > 0 ?
	            	chat.map((message, index) => {
	            		return (
	            			<div key={index} id={index} className={`message ${message.role === 'user' ? 'user' : 'bot'}`}>
								<ReactMarkdown>
									{message.content}
								</ReactMarkdown>
							</div>
	            		)
	            	}) :
					<h1 className="history-placeholder">Hey There,<br />What Can I Help<br />You With?</h1>
	           	}
            </div>

            <div className="chat-input">
                <form onSubmit={e => send(e)} className="input-form">
                	<input
	                    type="text"
	                    value={input}
	                    onChange={e => setInput(e.target.value)}
	                    placeholder="Type your message..."
	                    required
	               	/>
	                <button type="submit">
	                	{
	                		loading ?
	                		<div className="spinner"></div> :
	                		<BsChevronUp />
	                	}
	                </button>
                </form>
            </div>
		</div>
	);
};

export default App;
