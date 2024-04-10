let conversation = []; 
let temporaryMessage = ""; // 用于存储用户当前输入但尚未发送的消息

function updateConversation(message, temporary = false) {
    const chatContainer = document.getElementById('chatContainer');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', message.role === "user" ? 'userMessage' : 'aiMessage');

    if (temporary) {
        messageElement.classList.add('previewMessage'); // 添加特定类
    }

    messageElement.innerHTML = marked.parse(message.content);
    chatContainer.appendChild(messageElement);
    if (!temporary) {
        conversation.push(message);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

document.getElementById('userInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
        const input = document.getElementById('userInput');
        input.value += '\n';
    } else if (event.key === 'Enter' && !event.ctrlKey) {
        event.preventDefault(); // 阻止默认的回车换行行为
        document.getElementById('sendButton').click(); // 触发发送消息按钮的点击事件
    }
});

document.getElementById('clearButton').addEventListener('click', function() {
    conversation = []; // 清空对话历史
    document.getElementById('chatContainer').innerHTML = ''; // 清空聊天容器
});

document.getElementById('userInput').addEventListener('input', function(event) {
    const input = event.target.value;
    
    // 检查是否存在上一个临时消息，如果存在则移除
    if (temporaryMessage !== "" && document.querySelector('.userMessage:last-child')) {
        document.querySelector('.userMessage:last-child').remove();
        temporaryMessage = "";
    }

    // 如果输入不为空，则创建或更新临时消息
    if (input.trim() !== '') {
        temporaryMessage = {role: "user", content: input};
        updateConversation(temporaryMessage, true); // 使用Markdown渲染并更新聊天气泡
    }
});

document.getElementById('sendButton').addEventListener('click', function() {
    const userInput = document.getElementById('userInput').value;
    const selectedModel = document.getElementById('modelSelect').value;
    console.log("Selected Model:", selectedModel);
    if (userInput.trim() !== '') {
        if (temporaryMessage !== "") {
            document.querySelector('.userMessage:last-child').remove(); // 移除临时消息
        }
        updateConversation({role: "user", content: userInput}); // 将用户消息添加到conversation并更新聊天气泡

        fetch('http://localhost:8000/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: conversation
            })
        })
        .then(response => response.json())
        .then(data => {
            const aiMessage = data.choices[0].message.content;
            updateConversation({role: "assistant", content: aiMessage});
        })
        .catch(error => console.error('Error:', error));

        document.getElementById('userInput').value = ''; // 清空输入框
        temporaryMessage = ""; // 清空临时消息
    }
});