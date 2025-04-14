# 🗣️ Customer Support Chatbot

Hey there! Welcome to the **Customer Support Chatbot** project. This is a simple, yet powerful, chatbot built to help users with common questions, perform web searches, and interact with an AI assistant powered by OpenRouter. It's made with love using Node.js, Express, and a few cool APIs!

## 🚀 Features

- **Predefined Responses**: The chatbot responds to things like greetings and farewells with friendly messages.
- **AI Assistance**: Powered by **OpenRouter**, it can answer more complex questions in a natural way.
- **Web Search**: Need to search something? It can fetch the top results from the web using **SerpAPI**.
- **Sleek Frontend**: A simple and easy-to-use interface built with HTML, CSS, and JavaScript for you to chat with the bot.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Plain old HTML, CSS, and JavaScript
- **APIs**:
  - [OpenRouter](https://openrouter.ai/) for AI-powered responses
  - [SerpAPI](https://serpapi.com/) for fetching web search results
- **Environment Variables**: `.env` file to store API keys and config stuff.
- **Middleware**: We’re using CORS, JSON parsing, and static file serving.

## 🔧 Getting Started

### Prerequisites

Before you get started, make sure you have:
- **Node.js** installed (preferably the LTS version)
- **npm** (Node Package Manager)

### Clone the Repo

```bash
git clone https://github.com/your-username/chatbot-project.git
cd chatbot-project
```

### Install Dependencies

Once you're in the project folder, run:

```bash
npm install
```

This will install all the necessary dependencies for the backend.

### Set Up Your Environment

Create a `.env` file in the root of the project and add your API keys:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
SERPAPI_KEY=your_serpapi_key_here
```

### Running It Locally

Now, you're all set up! To start the server, run:

```bash
npm start
```

The server will run on `http://localhost:3000`, and you can visit that URL in your browser to chat with your chatbot.

### Endpoints

- **`POST /chat`**: Send a message to the chatbot, and it’ll respond with a cool AI-generated reply.
- **`POST /search`**: Give it a search query, and it’ll fetch the top results from the web!

## 🛠️ Error Handling

Don't worry, we've got error handling covered! Here's how it works:

- If you forget to send a message or query, the server will gently remind you with a 400 error.
- If anything goes wrong (like API issues), you'll get a 500 error, and we’ll make sure it’s logged for debugging.

## 📦 Deploying

Ready to share your chatbot with the world? You can deploy it to platforms like **Vercel** or **Heroku**. Here's how you can deploy to **Vercel**:

1. Install the Vercel CLI:
    ```bash
    npm install -g vercel
    ```
2. Deploy with just one command:
    ```bash
    vercel
    ```

Follow the prompts, and Vercel will take care of the rest. 🥳

## 🛠️ Contributing

Got ideas for improving the bot? Feel free to fork the repo, make some changes, and submit a pull request! If you run into any issues, open an issue on the repo, and I’ll check it out.



### 🔮 What’s Next?

- **Logging & Error Handling**: Consider adding more detailed logging for production with packages like `winston` or `morgan`.
- **Personalization**: You can always improve the chatbot by adding more responses or connecting it to even more APIs for a richer experience!

---

That's it! If you have any questions or need help, feel free to reach out. This my email "emenikechukwuka65@gmail.com" Enjoy building and chatting! 😎

---