Ext.define('otak.view.ai.ChatBot', {
    extend: 'Ext.Panel',
    xtype: 'aichatbot',
    
    layout: 'vbox', // Use vbox instead of border
    
    items: [{
        xtype: 'container',
        flex: 1, // Takes remaining space
        scrollable: true,
        items: [{
            xtype: 'component',
            itemId: 'chatMessages',
            html: '<div class="chat-container"></div>'
        }]
    }, {
        xtype: 'container',
        layout: 'hbox',
        height: 60,
        padding: 10,
        items: [{
            xtype: 'textfield',
            flex: 1,
            itemId: 'messageField',
            placeholder: 'Ask about brain diseases...',
            listeners: {
                action: function(field) { // Use action event for Enter key
                    field.up('aichatbot').sendMessage(field.getValue());
                    field.setValue('');
                }
            }
        }, {
            xtype: 'button',
            text: 'Send',
            margin: '0 0 0 10',
            handler: function(btn) {
                var field = btn.up('container').down('textfield');
                btn.up('aichatbot').sendMessage(field.getValue());
                field.setValue('');
            }
        }]
    }],
    
    initialize: function() {
        this.callParent();
        this.loadDiseaseData();
    },
    
    loadDiseaseData: function() {
        Ext.Ajax.request({
            url: 'app/Data/brain.json',
            method: 'GET',
            success: function(response) {
                const diseases = Ext.decode(response.responseText);
                this.diseaseData = diseases;
                this.addMessage('ai', 'Hello! I\'m your brain disease assistant. I have information about ' + diseases.length + ' neurological conditions. How can I help you?');
            },
            failure: function() {
                this.addMessage('ai', 'Hello! I\'m your brain disease assistant. How can I help you?');
            },
            scope: this
        });
    },
    
    sendMessage: function(message) {
        if (!message || !message.trim()) return;
        
        this.addMessage('user', message);
        this.showTyping();
        this.getAIResponse(message);
    },
    
    getAIResponse: function(message) {
        const context = this.createContextFromData();
        this.callBackendAPI(message, context);
    },
    
    createContextFromData: function() {
        if (!this.diseaseData) return '';
        
        let context = "You are a medical AI assistant specializing in brain diseases. Here's the disease database:\n\n";
        
        this.diseaseData.forEach(disease => {
            context += `Disease: ${disease.Disease_Name}\n`;
            context += `Category: ${disease.Category}\n`;
            context += `Description: ${disease.Description}\n`;
            context += `Prevalence: ${disease.Prevalence_Range}\n\n`;
        });
        
        context += "Provide accurate, helpful information about these brain diseases.";
        return context;
    },
    
    callBackendAPI: function(message, context) {
        Ext.Ajax.request({
            url: 'http://localhost:8000/api/chat', // Make sure this matches your Go port
            method: 'POST',
            jsonData: {
                message: message,
                context: context
            },
            headers: {
                'Content-Type': 'application/json'
            },
            success: function(response) {
                this.hideTyping();
                const data = Ext.decode(response.responseText);
                
                if (data.success) {
                    this.addMessage('ai', data.message);
                } else {
                    this.addMessage('ai', 'Error: ' + data.error);
                    this.fallbackLocalSearch(message);
                }
            },
            failure: function(response) {
                this.hideTyping();
                console.log('Request failed:', response);
                this.addMessage('ai', 'Connection failed. Status: ' + response.status);
                this.fallbackLocalSearch(message);
            },
            scope: this
        });
    },
    
    fallbackLocalSearch: function(message) {
        if (!this.diseaseData) return;
        
        const searchTerm = message.toLowerCase();
        const matches = this.diseaseData.filter(disease => 
            disease.Disease_Name.toLowerCase().includes(searchTerm) ||
            disease.Category.toLowerCase().includes(searchTerm)
        );
        
        if (matches.length > 0) {
            let response = "From local database:\n\n";
            matches.slice(0, 3).forEach(disease => {
                response += `• <strong>${disease.Disease_Name}</strong> (${disease.Category})\n`;
                response += `  ${disease.Description}\n\n`;
            });
            this.addMessage('ai', response);
        } else {
            this.addMessage('ai', "No matching diseases found. Try Alzheimer's, Parkinson's, or Epilepsy.");
        }
    },
    
    addMessage: function(sender, message) {
        const chatContainer = this.down('#chatMessages');
        const timestamp = new Date().toLocaleTimeString();
        
        const messageHtml = `
            <div class="chat-message ${sender}">
                <div class="message-bubble">
                    <div class="message-text">${this.formatMessage(message)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            </div>
        `;
        
        const currentHtml = chatContainer.getHtml();
        chatContainer.setHtml(currentHtml + messageHtml);
        
        // Scroll to bottom
        Ext.defer(function() {
            var scrollable = chatContainer.getScrollable();
            if (scrollable) {
                scrollable.scrollToEnd();
            }
        }, 100, this);
    },
    
    formatMessage: function(message) {
        return message.replace(/\n/g, '<br>');
    },
    
    showTyping: function() {
        const chatContainer = this.down('#chatMessages');
        const typingHtml = `
            <div class="chat-message ai typing">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        
        const currentHtml = chatContainer.getHtml();
        chatContainer.setHtml(currentHtml + typingHtml);
        
        Ext.defer(function() {
            var scrollable = chatContainer.getScrollable();
            if (scrollable) {
                scrollable.scrollToEnd();
            }
        }, 100, this);
    },
    
    hideTyping: function() {
        const chatContainer = this.down('#chatMessages');
        const html = chatContainer.getHtml().replace(/<div class="chat-message ai typing">[\s\S]*?<\/div>/, '');
        chatContainer.setHtml(html);
    }
});